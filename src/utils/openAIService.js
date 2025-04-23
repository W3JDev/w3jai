import AIService from './aiService';

/**
 * OpenAI service implementation
 */
class OpenAIService extends AIService {
  constructor() {
    super();
    this.apiKey = null;
    this.selectedModel = 'gpt-3.5-turbo';
    this.systemPrompt = "You are Smith, a helpful AI assistant engaging in natural conversation. Keep responses concise and engaging.";
    this.availableModels = [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
      { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
      { id: 'gpt-4-vision-preview', name: 'GPT-4 Vision', provider: 'OpenAI' }
    ];
  }

  /**
   * Initialize the OpenAI service
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
   * Get available models from OpenAI
   * @returns {Array} - List of available models
   */
  async getAvailableModels() {
    return this.availableModels;
  }

  /**
   * Send a message to OpenAI
   * @param {string} text - The message text
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The AI response
   */
  async sendMessage(text, options = {}) {
    return this.streamMessage(text, options);
  }

  /**
   * Stream a message response from OpenAI
   * @param {string} text - The message text
   * @param {Object} options - Additional options like files, images
   * @param {Function} onProgress - Callback for streaming progress
   * @returns {Promise<string>} - The complete AI response
   */
  async streamMessage(text, options = {}, onProgress = null) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is required');
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

      // If image is provided and using a vision model, add it as content
      if (options.image && this.selectedModel === 'gpt-4-vision-preview') {
        // For vision models, we need to format the content as an array of content parts
        const content = [
          { type: "text", text: messages[1].content },
          {
            type: "image_url",
            image_url: {
              url: options.image,
              detail: "auto"
            }
          }
        ];

        // Replace the content with the array format
        messages[1] = {
          role: "user",
          content: content
        };
      } else if (options.image) {
        // For non-vision models, just mention the image
        messages[1].content += `\n\n[Image attached: The user has shared an image with you. Please respond accordingly.]`;
      }

      // Prepare request body
      const requestBody = {
        model: this.selectedModel,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      };

      // Add tools if provided
      if (options.tools) {
        requestBody.tools = options.tools.tools;
        requestBody.tool_choice = options.tools.tool_choice;
        console.log('Adding tools to OpenAI request:', JSON.stringify(options.tools));
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
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

              // Check for tool calls
              if (parsed.choices?.[0]?.delta?.tool_calls) {
                const delta = parsed.choices[0].delta;
                console.log('Tool call delta received:', JSON.stringify(delta));

                // Initialize tool calls array if this is the first tool call chunk
                if (delta.tool_calls[0]?.index !== undefined) {
                  const index = delta.tool_calls[0].index;

                  if (!toolCalls[index]) {
                    toolCalls[index] = {
                      id: delta.tool_calls[0].id || `call_${index}`,
                      type: 'function',
                      function: {
                        name: '',
                        arguments: ''
                      }
                    };
                    console.log(`Initialized tool call at index ${index}`);
                  }

                  // Update tool call with new data
                  if (delta.tool_calls[0]?.function?.name) {
                    toolCalls[index].function.name = delta.tool_calls[0].function.name;
                    console.log(`Updated tool name to: ${delta.tool_calls[0].function.name}`);
                  }

                  if (delta.tool_calls[0]?.function?.arguments) {
                    toolCalls[index].function.arguments += delta.tool_calls[0].function.arguments;
                    console.log(`Updated tool arguments: ${delta.tool_calls[0].function.arguments}`);
                  }
                }
              }
            } catch (e) {
              // Ignore JSON parse errors from incomplete chunks
            }
          }
        }
      }

      // If we have tool calls, return them along with the result
      if (toolCalls.length > 0) {
        console.log('Completed tool calls:', JSON.stringify(toolCalls));
        return {
          content: result,
          tool_calls: toolCalls
        };
      }

      return result;
    } catch (error) {
      console.error('OpenAI API error:', error);
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

export default OpenAIService;
