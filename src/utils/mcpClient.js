/**
 * MCP (Model Control Protocol) Client
 * Handles communication with an MCP server for AI model access and tools
 */
class MCPClient {
  constructor(config = {}) {
    this.serverUrl = config.serverUrl || 'http://localhost:3000';
    this.apiKey = config.apiKey || null;
    this.connected = false;
    this.supportedModels = [];
    this.supportedTools = [];
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
      this.connected = false;
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
      return [];
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
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }
    
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
  }

  /**
   * Stream a chat completion request from the MCP server
   * @param {Object} params - Request parameters
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise<Object>} - Complete response
   */
  async streamChatCompletion(params, onChunk) {
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }
    
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
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                result += data.content;
                if (onChunk) {
                  onChunk(result);
                }
              }
            } catch (e) {
              // Ignore JSON parse errors from incomplete chunks
            }
          }
        }
      }
      
      return { content: result };
    } catch (error) {
      console.error('Stream chat completion error:', error);
      throw error;
    }
  }

  /**
   * Execute a tool on the MCP server
   * @param {string} toolName - Name of the tool to execute
   * @param {Object} params - Tool parameters
   * @returns {Promise<Object>} - Tool execution result
   */
  async executeTool(toolName, params) {
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }
    
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
