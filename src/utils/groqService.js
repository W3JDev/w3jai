import AIService from './aiService';

/**
 * GROQ AI service implementation
 */
class GroqService extends AIService {
  constructor() {
    super();
    this.apiKey = null;
    this.selectedModel = 'llama3-70b-8192';
    this.systemPrompt = "You are Smith, a helpful AI assistant engaging in natural conversation. Keep responses concise and engaging.";
    this.availableModels = [
      { id: 'llama3-70b-8192', name: 'Llama 3 70B', provider: 'GROQ' },
      { id: 'llama3-8b-8192', name: 'Llama 3 8B', provider: 'GROQ' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'GROQ' },
      { id: 'gemma-7b-it', name: 'Gemma 7B', provider: 'GROQ' }
    ];
  }

  /**
   * Initialize the GROQ service
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
   * Get available models from GROQ
   * @returns {Array} - List of available models
   */
  async getAvailableModels() {
    return this.availableModels;
  }

  /**
   * Send a message to GROQ
   * @param {string} text - The message text
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The AI response
   */
  async sendMessage(text, options = {}) {
    return this.streamMessage(text, options);
  }

  /**
   * Stream a message response from GROQ
   * @param {string} text - The message text
   * @param {Object} options - Additional options like files, images
   * @param {Function} onProgress - Callback for streaming progress
   * @returns {Promise<string>} - The complete AI response
   */
  async streamMessage(text, options = {}, onProgress = null) {
    if (!this.isConfigured()) {
      throw new Error('GROQ API key is required');
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

      // If image is provided, mention it in the message (GROQ doesn't support images directly)
      if (options.image) {
        messages[1].content += `\n\n[Image attached: The user has shared an image with you. Please respond accordingly.]`;
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
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
        throw new Error(`GROQ API error: ${response.statusText}`);
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
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                result += parsed.choices[0].delta.content;
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
      console.error('GROQ API error:', error);
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

export default GroqService;
