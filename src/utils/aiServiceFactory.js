import OpenRouterService from './openRouterService';
import OpenAIService from './openAIService';
import GeminiService from './geminiService';
import GroqService from './groqService';
import DeepseekService from './deepseekService';
import HuggingFaceService from './huggingFaceService';
import MCPService from './mcp/mcpService';

/**
 * Factory class for creating AI service instances
 */
class AIServiceFactory {
  /**
   * Create an AI service instance based on the provider
   * @param {string} provider - The AI provider name
   * @returns {AIService} - An instance of the requested AI service
   */
  static createService(provider) {
    switch (provider.toLowerCase()) {
      case 'openrouter':
        return new OpenRouterService();
      case 'openai':
        return new OpenAIService();
      case 'gemini':
        return new GeminiService();
      case 'groq':
        return new GroqService();
      case 'deepseek':
        return new DeepseekService();
      case 'huggingface':
        return new HuggingFaceService();
      case 'mcp':
        return new MCPService();
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * Get a list of all supported AI providers
   * @returns {Array} - List of supported providers
   */
  static getSupportedProviders() {
    return [
      { id: 'openrouter', name: 'OpenRouter', description: 'Access multiple AI models through a single API' },
      { id: 'openai', name: 'OpenAI', description: 'Direct access to GPT models' },
      { id: 'gemini', name: 'Google Gemini', description: 'Google\'s multimodal AI models' },
      { id: 'groq', name: 'GROQ', description: 'Ultra-fast inference for Llama and Mixtral models' },
      { id: 'deepseek', name: 'Deepseek', description: 'Advanced reasoning and step-by-step thinking' },
      { id: 'huggingface', name: 'Hugging Face', description: 'Access to open-source models' },
      { id: 'mcp', name: 'MCP Server', description: 'Connect to a local Model Control Protocol server' }
    ];
  }
}

export default AIServiceFactory;
