/**
 * MCP Service
 * Integrates MCP with the existing AI service architecture
 */
import AIService from '../aiService';
import MCPClient from './mcpClient';
import { getProviderById } from './providerAdapters';
import { getAllTools, executeTool } from './toolRegistry';

class MCPService extends AIService {
  constructor() {
    super();
    this.mcpClient = null;
    this.apiKey = null;
    this.serverUrl = null;
    this.selectedModel = 'claude-3-opus';
    this.systemPrompt = "You are Smith, a helpful AI assistant engaging in natural conversation. Keep responses concise and engaging. You have access to tools like web search that you can use to find current information. When asked about current events or information you don't know, ALWAYS use the web_search tool. You MUST use the web_search tool whenever the user asks you to search for something or find information online.";
    this.availableModels = [];
    this.provider = 'mcp';
    this.providerAdapter = getProviderById(this.provider);
    this.tools = getAllTools();
    this.useTools = true;
  }

  /**
   * Initialize the MCP service
   * @param {Object} config - Configuration with API key and server URL
   */
  async initialize(config) {
    this.apiKey = config.apiKey;
    this.serverUrl = config.serverUrl || 'http://localhost:3000';
    
    if (config.model) {
      this.selectedModel = config.model;
    }
    
    if (config.systemPrompt) {
      this.systemPrompt = config.systemPrompt;
    }
    
    if (config.provider) {
      this.provider = config.provider;
      this.providerAdapter = getProviderById(this.provider);
    }
    
    // Initialize the MCP client
    this.mcpClient = new MCPClient({
      serverUrl: this.serverUrl,
      apiKey: this.apiKey,
      provider: this.provider
    });
    
    const connected = await this.mcpClient.initialize();
    
    if (connected) {
      // Get available models from the MCP server
      this.availableModels = this.mcpClient.getAvailableModels();
      
      // If no models are available, add some default ones
      if (this.availableModels.length === 0) {
        this.availableModels = [
          { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
          { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
          { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
          { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' }
        ];
      }
    } else {
      console.log('Not connected to MCP server, using local tools');
      this.tools = getAllTools();
    }
    
    return this.isConfigured();
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean} - True if API key is set
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Get available models from MCP server
   * @returns {Promise<Array>} - List of available models
   */
  async getAvailableModels() {
    return this.availableModels;
  }

  /**
   * Create a tool instruction for non-tool-supporting models
   * @returns {string} - Tool instruction
   */
  createToolInstruction() {
    const tools = this.tools;
    let instruction = "You can call tools using the following format:\n";
    
    tools.forEach(tool => {
      instruction += `Tool Call: {"function": "${tool.name}", "arguments": {...}}\n`;
      instruction += `Description: ${tool.description}\n`;
      instruction += `Parameters: ${JSON.stringify(tool.parameters.properties)}\n\n`;
    });
    
    instruction += "Respond with this format when a tool is needed. For example:\n";
    instruction += `Tool Call: {"function": "web_search", "arguments": {"query": "latest news about AI"}}\n\n`;
    instruction += "After calling a tool, wait for the tool response before continuing.";
    
    return instruction;
  }

  /**
   * Send a message to the MCP server
   * @param {string} text - The message text
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The AI response
   */
  async sendMessage(text, options = {}) {
    return this.streamMessage(text, options);
  }

  /**
   * Stream a message response from the MCP server
   * @param {string} text - The message text
   * @param {Object} options - Additional options like files, images
   * @param {Function} onProgress - Callback for streaming progress
   * @returns {Promise<string>} - The complete AI response
   */
  async streamMessage(text, options = {}, onProgress = null) {
    if (!this.isConfigured()) {
      throw new Error('MCP service is not properly configured');
    }

    try {
      let messages = [
        { 
          role: "system", 
          content: this.systemPrompt
        }
      ];
      
      // Add tool instruction for non-tool-supporting models
      if (this.useTools && !this.providerAdapter.supportsToolCalling) {
        messages.push({
          role: "system",
          content: this.createToolInstruction()
        });
      }
      
      messages.push({ role: "user", content: text });

      // If file is provided, add its content to the message
      if (options.file) {
        const fileContent = await this.readFileContent(options.file);
        messages[messages.length - 1].content += `\n\nFile content:\n${fileContent}`;
      }

      // If image is provided, add it to the message
      if (options.image) {
        // For now, just mention the image
        // In a real implementation, the MCP server would handle image processing
        messages[messages.length - 1].content += `\n\n[Image attached: The user has shared an image with you. Please respond accordingly.]`;
      }

      // Prepare request parameters
      const params = {
        model: this.selectedModel,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      };
      
      // Add tools if supported and enabled
      if (this.useTools) {
        if (this.providerAdapter.supportsToolCalling) {
          params.tools = this.providerAdapter.formatTools(this.tools);
          params.tool_choice = "auto";
        }
      }

      // Stream the response from the MCP server
      let response;
      if (this.mcpClient.isConnected()) {
        // If connected to MCP server, use it
        response = await this.mcpClient.streamChatCompletion(params, onProgress);
      } else {
        // If not connected, throw error (for now)
        throw new Error('Not connected to MCP server and local streaming not implemented');
      }

      // Handle tool calls if present
      if (response.tool_calls) {
        // Parse tool calls based on provider
        const toolCalls = this.providerAdapter.parseToolCalls(response);
        
        if (toolCalls && toolCalls.length > 0) {
          // Execute tools and get results
          const toolResults = await this.executeToolCalls(toolCalls, text);
          
          // Add tool results to messages
          for (const result of toolResults) {
            messages.push({
              role: "assistant",
              content: response.content
            });
            
            messages.push({
              role: "tool",
              tool_call_id: result.tool_call_id,
              name: result.name,
              content: result.content
            });
          }
          
          // Get final response with tool results
          const finalResponse = await this.sendFollowUpMessage(messages, options, onProgress);
          return finalResponse;
        }
      }

      return response.content || response;
    } catch (error) {
      console.error('MCP service error:', error);
      throw error;
    }
  }

  /**
   * Execute tool calls
   * @param {Array} toolCalls - Array of tool calls
   * @param {string} originalText - Original message text
   * @returns {Promise<Array>} - Array of tool results
   */
  async executeToolCalls(toolCalls, originalText) {
    const results = [];
    
    for (const toolCall of toolCalls) {
      try {
        const { name, arguments: args } = toolCall.function;
        const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
        
        console.log(`Executing tool: ${name} with args:`, parsedArgs);
        
        // Execute the tool
        let result;
        if (this.mcpClient.isConnected()) {
          // If connected to MCP server, use it
          result = await this.mcpClient.executeTool(name, parsedArgs);
        } else {
          // If not connected, use local tools
          result = await executeTool(name, parsedArgs);
        }
        
        results.push({
          tool_call_id: toolCall.id,
          name,
          content: typeof result === 'string' ? result : JSON.stringify(result)
        });
      } catch (error) {
        console.error(`Tool execution error (${toolCall.function.name}):`, error);
        results.push({
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: `Error: ${error.message}`
        });
      }
    }
    
    return results;
  }

  /**
   * Send a follow-up message with tool results
   * @param {Array} messages - Array of messages
   * @param {Object} options - Additional options
   * @param {Function} onProgress - Callback for streaming progress
   * @returns {Promise<string>} - The AI response
   */
  async sendFollowUpMessage(messages, options = {}, onProgress = null) {
    // Prepare request parameters
    const params = {
      model: this.selectedModel,
      messages,
      temperature: 0.7,
      max_tokens: 1000
    };
    
    // Add tools if supported and enabled
    if (this.useTools && this.providerAdapter.supportsToolCalling) {
      params.tools = this.providerAdapter.formatTools(this.tools);
      params.tool_choice = "auto";
    }

    // Stream the response
    let response;
    if (this.mcpClient.isConnected()) {
      // If connected to MCP server, use it
      response = await this.mcpClient.streamChatCompletion(params, onProgress);
    } else {
      // If not connected, throw error (for now)
      throw new Error('Not connected to MCP server and local streaming not implemented');
    }

    return response.content || response;
  }

  /**
   * Read content from a file
   * @param {File} file - The file to read
   * @returns {Promise<string>} - The file content
   */
  async readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Error reading file'));
      
      if (file.type.startsWith('text/')) {
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  }
}

export default MCPService;
