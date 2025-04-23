/**
 * MCP Client
 * Handles communication with MCP servers
 */
import { getProviderById } from './providerAdapters';
import { executeTool, getAllTools } from './toolRegistry';

class MCPClient {
  constructor(config = {}) {
    this.serverUrl = config.serverUrl || 'http://localhost:3000';
    this.apiKey = config.apiKey || null;
    this.connected = false;
    this.supportedModels = [];
    this.supportedTools = [];
    this.provider = config.provider || 'openai';
    this.providerAdapter = getProviderById(this.provider);
  }

  /**
   * Initialize the MCP client
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - True if successfully connected
   */
  async initialize(config = {}) {
    if (config.serverUrl) {
      this.serverUrl = config.serverUrl;
    }
    
    if (config.apiKey) {
      this.apiKey = config.apiKey;
    }
    
    if (config.provider) {
      this.provider = config.provider;
      this.providerAdapter = getProviderById(this.provider);
    }
    
    try {
      // Test connection to the MCP server
      const response = await this.fetchWithTimeout(`${this.serverUrl}/status`, {
        method: 'GET',
        headers: this.getHeaders()
      }, 5000);
      
      if (!response.ok) {
        throw new Error(`Failed to connect to MCP server: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.connected = data.status === 'ok';
      
      if (this.connected) {
        // Get supported models and tools
        await this.fetchSupportedModels();
        await this.fetchSupportedTools();
      }
      
      return this.connected;
    } catch (error) {
      console.error('MCP connection error:', error);
      // If we can't connect to the server, we'll use local tools
      this.connected = false;
      this.supportedTools = getAllTools();
      return false;
    }
  }

  /**
   * Get headers for API requests
   * @returns {Object} - Headers object
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }

  /**
   * Fetch with timeout
   * @param {string} url - URL to fetch
   * @param {Object} options - Fetch options
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Response>} - Fetch response
   */
  async fetchWithTimeout(url, options, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  /**
   * Fetch supported models from the MCP server
   * @returns {Promise<Array>} - List of supported models
   */
  async fetchSupportedModels() {
    try {
      const response = await this.fetchWithTimeout(`${this.serverUrl}/models`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.supportedModels = data.models || [];
      return this.supportedModels;
    } catch (error) {
      console.error('Failed to fetch supported models:', error);
      return [];
    }
  }

  /**
   * Fetch supported tools from the MCP server
   * @returns {Promise<Array>} - List of supported tools
   */
  async fetchSupportedTools() {
    try {
      const response = await this.fetchWithTimeout(`${this.serverUrl}/tools`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tools: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.supportedTools = data.tools || [];
      return this.supportedTools;
    } catch (error) {
      console.error('Failed to fetch supported tools:', error);
      // If we can't fetch tools from the server, use local tools
      this.supportedTools = getAllTools();
      return this.supportedTools;
    }
  }

  /**
   * Check if the client is connected to the MCP server
   * @returns {boolean} - True if connected
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Get available models from the MCP server
   * @returns {Array} - List of available models
   */
  getAvailableModels() {
    return this.supportedModels;
  }

  /**
   * Get available tools from the MCP server
   * @returns {Array} - List of available tools
   */
  getAvailableTools() {
    return this.supportedTools;
  }

  /**
   * Send a chat completion request to the MCP server
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} - Chat completion response
   */
  async chatCompletion(params) {
    if (this.connected) {
      // If connected to MCP server, send request to server
      try {
        const response = await this.fetchWithTimeout(`${this.serverUrl}/chat/completions`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(params)
        });
        
        if (!response.ok) {
          throw new Error(`Chat completion failed: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Chat completion error:', error);
        throw error;
      }
    } else {
      // If not connected to MCP server, use local tools
      throw new Error('Not connected to MCP server and local chat completion not implemented');
    }
  }

  /**
   * Stream a chat completion request from the MCP server
   * @param {Object} params - Request parameters
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise<Object>} - Complete response
   */
  async streamChatCompletion(params, onChunk) {
    if (this.connected) {
      // If connected to MCP server, stream from server
      try {
        const response = await this.fetchWithTimeout(`${this.serverUrl}/chat/completions/stream`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(params)
        });
        
        if (!response.ok) {
          throw new Error(`Stream chat completion failed: ${response.statusText}`);
        }
        
        const reader = response.body.getReader();
        let result = '';
        let toolCalls = [];
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                // Handle content
                if (data.content) {
                  result += data.content;
                  if (onChunk) {
                    onChunk(result);
                  }
                }
                
                // Handle tool calls
                if (data.tool_calls) {
                  toolCalls = [...toolCalls, ...data.tool_calls];
                }
              } catch (e) {
                // Ignore JSON parse errors from incomplete chunks
              }
            }
          }
        }
        
        // Return the complete response
        if (toolCalls.length > 0) {
          return {
            content: result,
            tool_calls: toolCalls
          };
        }
        
        return { content: result };
      } catch (error) {
        console.error('Stream chat completion error:', error);
        throw error;
      }
    } else {
      // If not connected to MCP server, use local tools
      throw new Error('Not connected to MCP server and local streaming not implemented');
    }
  }

  /**
   * Execute a tool on the MCP server
   * @param {string} toolName - Name of the tool to execute
   * @param {Object} params - Tool parameters
   * @returns {Promise<Object>} - Tool execution result
   */
  async executeTool(toolName, params) {
    if (this.connected) {
      // If connected to MCP server, execute tool on server
      try {
        const response = await this.fetchWithTimeout(`${this.serverUrl}/tools/${toolName}`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(params)
        });
        
        if (!response.ok) {
          throw new Error(`Tool execution failed: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Tool execution error (${toolName}):`, error);
        throw error;
      }
    } else {
      // If not connected to MCP server, execute tool locally
      try {
        return await executeTool(toolName, params);
      } catch (error) {
        console.error(`Local tool execution error (${toolName}):`, error);
        throw error;
      }
    }
  }

  /**
   * Execute a web search using the MCP server
   * @param {string} query - Search query
   * @param {number} count - Number of results to return
   * @returns {Promise<Object>} - Search results
   */
  async webSearch(query, count = 5) {
    return this.executeTool('web_search', { query, count });
  }
}

export default MCPClient;
