import AIService from './aiService';

/**
 * OpenRouter AI service implementation
 */
class OpenRouterService extends AIService {
  constructor() {
    super();
    this.apiKey = null;
    this.selectedModel = 'anthropic/claude-2';
    this.systemPrompt = "You are Smith, a helpful AI assistant engaging in natural conversation. Keep responses concise and engaging.";
    this.availableModels = [
      { id: 'anthropic/claude-2', name: 'Claude 2', provider: 'Anthropic' },
      { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google' },
      { id: 'meta-llama/llama-2-70b-chat', name: 'Llama 2 70B', provider: 'Meta' },
      { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', provider: 'Mistral AI' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
      { id: 'openai/gpt-4', name: 'GPT-4', provider: 'OpenAI' }
    ];
  }

  /**
   * Initialize the OpenRouter service
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
   * Get available models from OpenRouter
   * @returns {Array} - List of available models
   */
  async getAvailableModels() {
    return this.availableModels;
  }

  /**
   * Send a message to OpenRouter
   * @param {string} text - The message text
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The AI response
   */
  async sendMessage(text, options = {}) {
    return this.streamMessage(text, options);
  }

  /**
   * Stream a message response from OpenRouter
   * @param {string} text - The message text
   * @param {Object} options - Additional options like files, images
   * @param {Function} onProgress - Callback for streaming progress
   * @returns {Promise<string>} - The complete AI response
   */
  async streamMessage(text, options = {}, onProgress = null) {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key is required');
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

      // If image is provided, mention it in the message
      if (options.image) {
        messages[1].content += `\n\n[Image attached: The user has shared an image with you. Please respond accordingly.]`;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'W3J Assistant'
        },
        body: JSON.stringify({
          model: this.selectedModel,
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
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
              if (data.choices?.[0]?.delta?.content) {
                result += data.choices[0].delta.content;
                // Call onProgress if provided
                if (onProgress) {
                  onProgress(result);
                }
              }
            } catch (e) {
              // Ignore JSON parse errors from incomplete chunks
            }
          }
        }
      }

      return result;
    } catch (error) {
      console.error('OpenRouter API error:', error);
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

export default OpenRouterService;
