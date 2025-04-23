import AIService from './aiService';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Google Gemini service implementation
 */
class GeminiService extends AIService {
  constructor() {
    super();
    this.apiKey = null;
    this.selectedModel = 'gemini-pro';
    this.genAI = null;
    this.model = null;
    this.chat = null;
    this.systemPrompt = "You are Smith, a helpful AI assistant engaging in natural conversation. Keep responses concise and engaging.";
    this.availableModels = [
      { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', provider: 'Google' }
    ];
  }

  /**
   * Initialize the Gemini service
   * @param {Object} config - Configuration with API key and model
   */
  async initialize(config) {
    this.apiKey = config.apiKey;
    if (config.model) {
      this.selectedModel = config.model;
    }
    if (config.systemPrompt) {
      this.systemPrompt = config.systemPrompt;
    }

    if (this.isConfigured()) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: this.selectedModel,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      });
      
      // Initialize chat session
      this.chat = await this.model.startChat({
        history: [
          {
            role: "user",
            parts: "Hello, who are you?"
          },
          {
            role: "model",
            parts: this.systemPrompt
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      });
      
      return true;
    }
    
    return false;
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean} - True if API key is set
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Get available models from Gemini
   * @returns {Array} - List of available models
   */
  async getAvailableModels() {
    return this.availableModels;
  }

  /**
   * Send a message to Gemini
   * @param {string} text - The message text
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The AI response
   */
  async sendMessage(text, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is required');
    }

    try {
      if (!this.chat) {
        await this.initialize({ apiKey: this.apiKey, model: this.selectedModel });
      }

      let content = text;

      // If file is provided, add its content to the message
      if (options.file) {
        const fileContent = await this.readFileContent(options.file);
        content += `\n\nFile content:\n${fileContent}`;
      }

      // For vision model with image
      if (options.image && this.selectedModel === 'gemini-pro-vision') {
        const result = await this.model.generateContent([
          content,
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: options.image.split(',')[1] // Remove the data URL prefix
            }
          }
        ]);
        const response = await result.response;
        return response.text();
      } 
      // Regular text chat
      else {
        if (options.image) {
          content += `\n\n[Image attached: The user has shared an image with you. Please respond accordingly.]`;
        }
        
        const result = await this.chat.sendMessage(content);
        const response = await result.response;
        return response.text();
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  /**
   * Stream a message response from Gemini
   * @param {string} text - The message text
   * @param {Object} options - Additional options like files, images
   * @param {Function} onProgress - Callback for streaming progress
   * @returns {Promise<string>} - The complete AI response
   */
  async streamMessage(text, options = {}, onProgress = null) {
    // Gemini doesn't support true streaming yet in the JS SDK
    // So we'll just use sendMessage and simulate streaming
    const response = await this.sendMessage(text, options);
    
    if (onProgress) {
      // Simulate streaming by sending chunks of the response
      const words = response.split(' ');
      let partialResponse = '';
      
      for (const word of words) {
        partialResponse += word + ' ';
        onProgress(partialResponse);
        // Add a small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return response;
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

export default GeminiService;
