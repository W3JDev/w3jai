/**
 * Unified ChatService for handling multiple AI providers
 * Supports OpenAI, GROQ, Anthropic, Deepseek, and Hugging Face
 */
import { v4 as uuidv4 } from 'uuid';
import { validateApiKey, validateText } from '../utils/validation';

// Base provider class
class BaseProvider {
  constructor(apiKey, model, systemPrompt) {
    this.apiKey = apiKey;
    this.model = model;
    this.systemPrompt = systemPrompt || '';
    this.progressCallback = null;
  }

  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  async sendMessage(text, options = {}) {
    throw new Error('Method not implemented');
  }

  async processVoiceInput(audioData) {
    throw new Error('Method not implemented');
  }
}

// OpenAI Provider
class OpenAIProvider extends BaseProvider {
  constructor(apiKey, model = 'gpt-4o', systemPrompt) {
    super(apiKey, model, systemPrompt);
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async sendMessage(text, options = {}) {
    const {
      conversationHistory = [],
      stream = true,
      tools = [],
      images = []
    } = options;

    // Validate inputs
    const textValidation = validateText(text);
    if (!textValidation.isValid) {
      throw new Error(textValidation.message);
    }

    // Prepare messages
    let messages = [...conversationHistory];

    // Add system message if provided and not already in history
    if (this.systemPrompt && !messages.some(m => m.role === 'system')) {
      messages.unshift({ role: 'system', content: this.systemPrompt });
    }

    // Add current message
    if (images && images.length > 0) {
      // Handle multimodal input with images
      const content = [
        { type: 'text', text },
        ...images.map(image => ({
          type: 'image_url',
          image_url: { url: image }
        }))
      ];
      messages.push({ role: 'user', content });
    } else {
      // Text-only message
      messages.push({ role: 'user', content: text });
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream,
          tools: tools.length > 0 ? tools : undefined
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to get response from OpenAI';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.details || errorMessage;
          console.error('OpenAI API error details:', errorData);
        } catch (e) {
          console.error('Error parsing OpenAI error response:', e);
        }
        throw new Error(errorMessage);
      }

      if (stream) {
        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let fullResponse = '';

        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });

              // Process buffer for complete SSE messages
              const lines = buffer.split('\n\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0]?.delta?.content || '';
                    if (content) {
                      fullResponse += content;
                      if (this.progressCallback) {
                        this.progressCallback(content, fullResponse);
                      }
                    }
                  } catch (e) {
                    console.error('Error parsing SSE message:', e);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error reading stream:', error);
            throw error;
          }
        };

        await processStream();
        return { text: fullResponse, provider: 'openai', model: this.model };
      } else {
        // Handle non-streaming response
        const data = await response.json();
        const responseText = data.choices[0]?.message?.content || '';
        return { text: responseText, provider: 'openai', model: this.model };
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async processVoiceInput(audioData) {
    // Implementation for voice transcription
    // This would typically call the OpenAI Whisper API
    throw new Error('Voice transcription not implemented for OpenAI');
  }
}

// GROQ Provider
class GroqProvider extends BaseProvider {
  constructor(apiKey, model = 'llama3-70b-8192', systemPrompt) {
    super(apiKey, model, systemPrompt);
    this.apiUrl = '/api/groq/chat';
  }

  async sendMessage(text, options = {}) {
    const {
      conversationHistory = [],
      stream = true
    } = options;

    // Validate inputs
    const textValidation = validateText(text);
    if (!textValidation.isValid) {
      throw new Error(textValidation.message);
    }

    // Prepare messages
    let messages = [...conversationHistory];

    // Add system message if provided and not already in history
    if (this.systemPrompt && !messages.some(m => m.role === 'system')) {
      messages.unshift({ role: 'system', content: this.systemPrompt });
    }

    // Add current message
    messages.push({ role: 'user', content: text });

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to get response from GROQ');
      }

      if (stream) {
        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let fullResponse = '';

        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });

              // Process buffer for complete SSE messages
              const lines = buffer.split('\n\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0]?.delta?.content || '';
                    if (content) {
                      fullResponse += content;
                      if (this.progressCallback) {
                        this.progressCallback(content, fullResponse);
                      }
                    }
                  } catch (e) {
                    console.error('Error parsing SSE message:', e);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error reading stream:', error);
            throw error;
          }
        };

        await processStream();
        return { text: fullResponse, provider: 'groq', model: this.model };
      } else {
        // Handle non-streaming response
        const data = await response.json();
        const responseText = data.choices[0]?.message?.content || '';
        return { text: responseText, provider: 'groq', model: this.model };
      }
    } catch (error) {
      console.error('GROQ API error:', error);
      throw error;
    }
  }
}

// Anthropic Provider
class AnthropicProvider extends BaseProvider {
  constructor(apiKey, model = 'claude-3-opus-20240229', systemPrompt) {
    super(apiKey, model, systemPrompt);
    this.apiUrl = '/api/anthropic/chat';
  }

  async sendMessage(text, options = {}) {
    const {
      conversationHistory = [],
      stream = true,
      tools = [],
      images = []
    } = options;

    // Validate inputs
    const textValidation = validateText(text);
    if (!textValidation.isValid) {
      throw new Error(textValidation.message);
    }

    // Prepare messages
    let messages = [...conversationHistory];

    // Add system message if provided
    const systemPrompt = this.systemPrompt;

    // Add current message
    if (images && images.length > 0) {
      // Handle multimodal input with images
      const content = [
        { type: 'text', text },
        ...images.map(image => ({
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: image.replace(/^data:image\/[a-z]+;base64,/, '') }
        }))
      ];
      messages.push({ role: 'user', content });
    } else {
      // Text-only message
      messages.push({ role: 'user', content: text });
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          system: systemPrompt,
          stream
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to get response from Anthropic');
      }

      if (stream) {
        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let fullResponse = '';

        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });

              // Process buffer for complete SSE messages
              const lines = buffer.split('\n\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.delta?.text || '';
                    if (content) {
                      fullResponse += content;
                      if (this.progressCallback) {
                        this.progressCallback(content, fullResponse);
                      }
                    }
                  } catch (e) {
                    console.error('Error parsing SSE message:', e);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error reading stream:', error);
            throw error;
          }
        };

        await processStream();
        return { text: fullResponse, provider: 'anthropic', model: this.model };
      } else {
        // Handle non-streaming response
        const data = await response.json();
        const responseText = data.content[0]?.text || '';
        return { text: responseText, provider: 'anthropic', model: this.model };
      }
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }
}

// Main ChatService class
class ChatService {
  constructor(config = {}) {
    this.config = config;
    this.provider = null;
    this.progressCallback = null;
    this.fallbackProviders = [];
    this.initialize(config);
  }

  async initialize({ provider, apiKey, model, systemPrompt, fallbackProviders = [] } = {}) {
    // If no config is provided, just return without initializing
    if (!provider || !apiKey) {
      console.log('No provider or API key provided, ChatService will be initialized later');
      return;
    }

    // Validate API key
    const keyValidation = validateApiKey(apiKey, provider);
    if (!keyValidation.isValid) {
      console.error('API key validation failed:', keyValidation.message);
      throw new Error(keyValidation.message);
    }

    // Initialize the appropriate provider based on configuration
    try {
      switch (provider.toLowerCase()) {
        case 'openai':
          this.provider = new OpenAIProvider(apiKey, model, systemPrompt);
          break;
        case 'groq':
          this.provider = new GroqProvider(apiKey, model, systemPrompt);
          break;
        case 'anthropic':
          this.provider = new AnthropicProvider(apiKey, model, systemPrompt);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      // Initialize fallback providers if specified
      this.fallbackProviders = fallbackProviders.map(fb => {
        switch (fb.provider.toLowerCase()) {
          case 'openai':
            return new OpenAIProvider(fb.apiKey, fb.model, fb.systemPrompt || systemPrompt);
          case 'groq':
            return new GroqProvider(fb.apiKey, fb.model, fb.systemPrompt || systemPrompt);
          case 'anthropic':
            return new AnthropicProvider(fb.apiKey, fb.model, fb.systemPrompt || systemPrompt);
          default:
            console.warn(`Unsupported fallback provider: ${fb.provider}`);
            return null;
        }
      }).filter(Boolean);

    } catch (error) {
      console.error('Error initializing ChatService:', error);
      throw error;
    }
  }

  setProgressCallback(callback) {
    this.progressCallback = callback;
    if (this.provider) {
      this.provider.setProgressCallback(callback);
    }
    this.fallbackProviders.forEach(provider => {
      provider.setProgressCallback(callback);
    });
  }

  async sendMessage(text, options = {}) {
    if (!this.provider) {
      throw new Error('ChatService not initialized');
    }

    try {
      // Try with primary provider
      return await this.provider.sendMessage(text, {
        ...options,
        requestId: uuidv4()
      });
    } catch (error) {
      console.error(`Error with primary provider (${this.provider.constructor.name}):`, error);

      // Try fallback providers if available
      if (this.fallbackProviders.length > 0) {
        console.log('Attempting to use fallback providers...');

        for (const fallbackProvider of this.fallbackProviders) {
          try {
            console.log(`Trying fallback provider: ${fallbackProvider.constructor.name}`);
            return await fallbackProvider.sendMessage(text, {
              ...options,
              requestId: uuidv4()
            });
          } catch (fallbackError) {
            console.error(`Error with fallback provider (${fallbackProvider.constructor.name}):`, fallbackError);
          }
        }
      }

      // If we get here, all providers failed
      throw new Error('All providers failed to process the request');
    }
  }

  async processVoiceInput(audioData) {
    if (!this.provider) {
      throw new Error('ChatService not initialized');
    }

    try {
      return await this.provider.processVoiceInput(audioData);
    } catch (error) {
      console.error('Error processing voice input:', error);
      throw error;
    }
  }
}

export default ChatService;
