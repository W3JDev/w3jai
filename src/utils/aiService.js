/**
 * Base AI Service class that defines the common interface for all AI providers
 */
class AIService {
  constructor() {
    if (this.constructor === AIService) {
      throw new Error("Abstract class 'AIService' cannot be instantiated directly");
    }
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
