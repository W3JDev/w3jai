import AIService from './aiService';

/**
 * Hugging Face AI service implementation
 */
class HuggingFaceService extends AIService {
  constructor() {
    super();
    this.apiKey = null;
    this.selectedModel = 'mistralai/Mixtral-8x7B-Instruct-v0.1';
    this.systemPrompt = "You are Smith, a helpful AI assistant engaging in natural conversation. Keep responses concise and engaging.";
    this.availableModels = [
      { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', provider: 'Hugging Face' },
      { id: 'meta-llama/Llama-2-70b-chat-hf', name: 'Llama 2 70B', provider: 'Hugging Face' },
      { id: 'google/gemma-7b-it', name: 'Gemma 7B', provider: 'Hugging Face' },
      { id: 'microsoft/phi-2', name: 'Phi-2', provider: 'Hugging Face' },
      { id: 'stabilityai/stablelm-zephyr-3b', name: 'StableLM Zephyr 3B', provider: 'Hugging Face' }
    ];
  }

  /**
   * Initialize the Hugging Face service
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
   * Get available models from Hugging Face
   * @returns {Array} - List of available models
   */
  async getAvailableModels() {
    return this.availableModels;
  }

  /**
   * Send a message to Hugging Face
   * @param {string} text - The message text
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The AI response
   */
  async sendMessage(text, options = {}) {
    return this.streamMessage(text, options);
  }

  /**
   * Stream a message response from Hugging Face
   * @param {string} text - The message text
   * @param {Object} options - Additional options like files, images
   * @param {Function} onProgress - Callback for streaming progress
   * @returns {Promise<string>} - The complete AI response
   */
  async streamMessage(text, options = {}, onProgress = null) {
    if (!this.isConfigured()) {
      throw new Error('Hugging Face API key is required');
    }

    try {
      // Format the prompt based on the model
      let prompt = '';
      
      // If file is provided, add its content to the message
      let userContent = text;
      if (options.file) {
        const fileContent = await this.readFileContent(options.file);
        userContent += `\n\nFile content:\n${fileContent}`;
      }

      // If image is provided, mention it in the message
      if (options.image) {
        userContent += `\n\n[Image attached: The user has shared an image with you. Please respond accordingly.]`;
      }

      // Format prompt based on model type
      if (this.selectedModel.includes('mistral')) {
        prompt = `<s>[INST] ${this.systemPrompt} [/INST]</s>\n<s>[INST] ${userContent} [/INST]`;
      } else if (this.selectedModel.includes('llama')) {
        prompt = `<s>[INST] <<SYS>>\n${this.systemPrompt}\n<</SYS>>\n\n${userContent} [/INST]`;
      } else {
        // Generic format for other models
        prompt = `System: ${this.systemPrompt}\nUser: ${userContent}\nAssistant:`;
      }

      const response = await fetch(`https://api-inference.huggingface.co/models/${this.selectedModel}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      }

      // Hugging Face doesn't support streaming, so we'll simulate it
      const result = await response.json();
      let generatedText = '';
      
      if (Array.isArray(result)) {
        generatedText = result[0]?.generated_text || '';
      } else {
        generatedText = result.generated_text || '';
      }

      // Clean up the response based on model
      if (this.selectedModel.includes('mistral') || this.selectedModel.includes('llama')) {
        // Remove any trailing model tokens
        generatedText = generatedText.replace(/<\/s>$/, '').trim();
      }

      // Simulate streaming for UI feedback
      if (onProgress) {
        const words = generatedText.split(' ');
        let partialResponse = '';
        
        for (const word of words) {
          partialResponse += word + ' ';
          onProgress(partialResponse);
          // Add a small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }

      return generatedText;
    } catch (error) {
      console.error('Hugging Face API error:', error);
      throw error;
    }
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

export default HuggingFaceService;
