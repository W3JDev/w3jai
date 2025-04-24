import { useEffect, useState } from 'react';
import userService from './userService';

class ApiManager {
  constructor() {
    this.providers = {};
    this.availableModels = {};
    this.isInitialized = false;
  }

  async initialize(userId) {
    if (this.isInitialized) return;
    
    // Load API keys from user preferences
    const { data: apiKeys } = await userService.getUserApiKeys(userId);
    
    // Initialize each provider with their API key
    for (const provider in apiKeys) {
      if (apiKeys[provider]) {
        await this.registerProvider(provider, apiKeys[provider]);
      }
    }
    
    this.isInitialized = true;
  }

  async registerProvider(provider, apiKey) {
    try {
      // Initialize provider service
      const service = this.getProviderService(provider);
      await service.initialize({ apiKey });
      
      // Fetch available models
      const models = await this.fetchAvailableModels(provider, service);
      
      this.providers[provider] = service;
      this.availableModels[provider] = models;
      
      return true;
    } catch (error) {
      console.error(`Failed to initialize ${provider} provider:`, error);
      return false;
    }
  }

  async fetchAvailableModels(provider, service) {
    try {
      // Implement provider-specific model fetching logic
      // This should be overridden by each provider's implementation
      return [];
    } catch (error) {
      console.error(`Failed to fetch models for ${provider}:`, error);
      return [];
    }
  }

  getProviderService(provider) {
    // Return appropriate service based on provider
    switch (provider) {
      case 'openai':
        return new OpenAIService();
      case 'anthropic':
        return new AnthropicService();
      case 'groq':
        return new GroqService();
      case 'elevenlabs':
        return new ElevenLabsService();
      case 'brave':
        return new BraveSearchService();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  getAvailableModels(provider) {
    return this.availableModels[provider] || [];
  }

  getProvider(provider) {
    return this.providers[provider];
  }

  hasProvider(provider) {
    return !!this.providers[provider];
  }
}

export const useApiManager = (userId) => {
  const [apiManager] = useState(new ApiManager());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await apiManager.initialize(userId);
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };

    init();
  }, [userId, apiManager]);

  return { apiManager, isLoading, error };
};

export default ApiManager;