/**
 * Configuration for AI providers
 */

const providers = {
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable model with vision and up-to-date knowledge' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Powerful model with reasoning capabilities' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' }
    ],
    defaultModel: 'gpt-4o',
    supportsVision: true,
    supportsVoice: true,
    supportsTools: true,
    maxTokens: 128000,
    apiKeyName: 'OPENAI_API_KEY'
  },
  groq: {
    name: 'GROQ',
    models: [
      { id: 'llama3-70b-8192', name: 'Llama-3 70B', description: 'High-performance open model with 8K context' },
      { id: 'llama3-8b-8192', name: 'Llama-3 8B', description: 'Faster, smaller model with 8K context' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Powerful mixture-of-experts model with 32K context' }
    ],
    defaultModel: 'llama3-70b-8192',
    supportsVision: false,
    supportsVoice: false,
    supportsTools: false,
    maxTokens: 32768,
    apiKeyName: 'GROQ_API_KEY'
  },
  anthropic: {
    name: 'Anthropic',
    models: [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful Claude model with advanced reasoning' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest Claude model for quick responses' }
    ],
    defaultModel: 'claude-3-opus-20240229',
    supportsVision: true,
    supportsVoice: false,
    supportsTools: true,
    maxTokens: 200000,
    apiKeyName: 'ANTHROPIC_API_KEY'
  },
  deepseek: {
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Specialized for code generation and understanding' },
      { id: 'deepseek-llm-67b', name: 'DeepSeek LLM 67B', description: 'General purpose large language model' }
    ],
    defaultModel: 'deepseek-llm-67b',
    supportsVision: false,
    supportsVoice: false,
    supportsTools: false,
    maxTokens: 32768,
    apiKeyName: 'DEEPSEEK_API_KEY'
  },
  huggingface: {
    name: 'Hugging Face',
    models: [
      { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B Instruct', description: 'Powerful open-source mixture-of-experts model' },
      { id: 'meta-llama/Llama-2-70b-chat-hf', name: 'Llama 2 70B', description: 'Meta\'s large language model' },
      { id: 'google/gemma-7b-it', name: 'Gemma 7B Instruct', description: 'Google\'s lightweight instruction-tuned model' }
    ],
    defaultModel: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    supportsVision: false,
    supportsVoice: false,
    supportsTools: false,
    maxTokens: 32768,
    apiKeyName: 'HUGGINGFACE_API_KEY'
  }
};

export default providers;

/**
 * Get provider configuration by ID
 * @param {string} providerId - The provider ID
 * @returns {Object|null} - Provider configuration or null if not found
 */
export const getProviderConfig = (providerId) => {
  return providers[providerId] || null;
};

/**
 * Get model configuration for a specific provider and model
 * @param {string} providerId - The provider ID
 * @param {string} modelId - The model ID
 * @returns {Object|null} - Model configuration or null if not found
 */
export const getModelConfig = (providerId, modelId) => {
  const provider = getProviderConfig(providerId);
  if (!provider) return null;
  
  return provider.models.find(model => model.id === modelId) || null;
};

/**
 * Get default model for a provider
 * @param {string} providerId - The provider ID
 * @returns {string|null} - Default model ID or null if provider not found
 */
export const getDefaultModel = (providerId) => {
  const provider = getProviderConfig(providerId);
  return provider ? provider.defaultModel : null;
};

/**
 * Get all available providers
 * @returns {Array} - Array of provider objects with id and name
 */
export const getAvailableProviders = () => {
  return Object.entries(providers).map(([id, config]) => ({
    id,
    name: config.name,
    defaultModel: config.defaultModel
  }));
};
