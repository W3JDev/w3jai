/**
 * Base AI Service class that defines the common interface for all AI providers
 */
class AIService {
  constructor() {
    if (this.constructor === AIService) {
      throw new Error("Abstract class 'AIService' cannot be instantiated directly");
    }
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Initialize the AI service with necessary credentials and configuration
   * @param {Object} config - Configuration object with API keys and settings
   */
  async initialize(config) {
    throw new Error("Method 'initialize' must be implemented by subclasses");
  }

  /**
   * Send a message to the AI service and get a response
   * @param {string} text - The message text to send
   * @param {Object} options - Additional options like files, images, etc.
   * @returns {Promise<string>} - The AI response
   */
  async sendMessage(text, options = {}) {
    throw new Error("Method 'sendMessage' must be implemented by subclasses");
  }

  /**
   * Execute a request with retry logic
   * @param {Function} requestFn - The request function to execute
   * @param {string} errorContext - Context for error messages
   * @returns {Promise<any>} - The response from the request
   */
  async executeWithRetry(requestFn, errorContext) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }
    
    throw new Error(`${errorContext} failed after ${this.maxRetries} attempts: ${lastError?.message || lastError}`);
  }

  /**
   * Stream a response from the AI service
   * @param {string} text - The message text to send
   * @param {Object} options - Additional options like files, images, etc.
   * @param {Function} onProgress - Callback function for streaming progress
   * @returns {Promise<string>} - The complete AI response
   */
  async streamMessage(text, options = {}, onProgress = null) {
    throw new Error("Method 'streamMessage' must be implemented by subclasses");
  }

  /**
   * Get available models from this AI service
   * @returns {Promise<Array>} - List of available models
   */
  async getAvailableModels() {
    throw new Error("Method 'getAvailableModels' must be implemented by subclasses");
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean} - True if the service is ready to use
   */
  isConfigured() {
    throw new Error("Method 'isConfigured' must be implemented by subclasses");
  }
}

export default AIService;
