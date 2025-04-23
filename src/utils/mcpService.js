import AIService from './aiService';
import MCPClient from './mcpClient';

/**
 * MCP service implementation
 * Uses an MCP server for AI model access and tools
 */
class MCPService extends AIService {
  constructor() {
    super();
    this.mcpClient = new MCPClient();
    this.apiKey = null;
    this.serverUrl = null;
    this.selectedModel = 'claude-3-opus';
    this.systemPrompt = "You are Smith, a helpful AI assistant engaging in natural conversation. Keep responses concise and engaging.";
    this.availableModels = [];
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
    
    // Initialize the MCP client
    const connected = await this.mcpClient.initialize({
      serverUrl: this.serverUrl,
      apiKey: this.apiKey
    });
    
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
    }
    
    return connected;
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean} - True if API key is set and connected to MCP server
   */
  isConfigured() {
    return !!this.apiKey && this.mcpClient.isConnected();
  }

  /**
   * Get available models from MCP server
   * @returns {Array} - List of available models
   */
  async getAvailableModels() {
    return this.availableModels;
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
        },
        { role: "user", content: text }
      ];

      // If file is provided, add its content to the message
      if (options.file) {
        const fileContent = await this.readFileContent(options.file);
        messages[1].content += `\n\nFile content:\n${fileContent}`;
      }

      // If image is provided, add it to the message
      if (options.image) {
        // For now, just mention the image
        // In a real implementation, the MCP server would handle image processing
        messages[1].content += `\n\n[Image attached: The user has shared an image with you. Please respond accordingly.]`;
      }

      // Check if web search is requested
      if (options.webSearch) {
        try {
          const searchResults = await this.mcpClient.webSearch(options.webSearch.query);
          if (searchResults && searchResults.results) {
            messages[1].content += `\n\nHere are some search results that might help:\n${this.formatSearchResults(searchResults.results)}`;
          }
        } catch (searchError) {
          console.error('Web search error:', searchError);
        }
      }

      // Stream the response from the MCP server
      const response = await this.mcpClient.streamChatCompletion({
        model: this.selectedModel,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      }, onProgress);

      return response.content;
    } catch (error) {
      console.error('MCP service error:', error);
      throw error;
    }
  }

  /**
   * Format search results as markdown
   * @param {Array} results - Array of search results
   * @returns {string} - Markdown formatted results
   */
  formatSearchResults(results) {
    if (!results || results.length === 0) {
      return "No search results found.";
    }

    let markdown = "### Search Results\n\n";
    
    results.forEach((result, index) => {
      markdown += `**${index + 1}. [${result.title}](${result.url})**\n`;
      markdown += `${result.snippet}\n\n`;
    });
    
    return markdown;
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
