import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatService from './ChatService';

// Mock the provider adapters
vi.mock('./providers/OpenAIAdapter', () => ({
  default: vi.fn().mockImplementation(() => ({
    sendMessage: vi.fn().mockResolvedValue({
      text: 'Response from OpenAI',
      audio: null
    })
  }))
}));

vi.mock('./providers/AnthropicAdapter', () => ({
  default: vi.fn().mockImplementation(() => ({
    sendMessage: vi.fn().mockResolvedValue({
      text: 'Response from Anthropic',
      audio: null
    })
  }))
}));

vi.mock('./providers/GroqAdapter', () => ({
  default: vi.fn().mockImplementation(() => ({
    sendMessage: vi.fn().mockResolvedValue({
      text: 'Response from Groq',
      audio: null
    })
  }))
}));

describe('ChatService', () => {
  let chatService;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a new instance for each test
    chatService = new ChatService();
  });
  
  it('initializes with default provider', () => {
    expect(chatService).toBeDefined();
    expect(chatService.provider).toBeDefined();
  });
  
  it('can change provider', () => {
    const initialProvider = chatService.provider;
    chatService.setProvider('anthropic');
    expect(chatService.provider).not.toBe(initialProvider);
  });
  
  it('sends message to current provider', async () => {
    const response = await chatService.sendMessage('Hello, AI!');
    expect(response).toBeDefined();
    expect(response.text).toBeDefined();
  });
  
  it('falls back to alternative provider on failure', async () => {
    // Mock the current provider to fail
    chatService.provider.sendMessage = vi.fn().mockRejectedValue(new Error('Provider error'));
    
    // Mock the fallback provider
    const fallbackSpy = vi.fn().mockResolvedValue({
      text: 'Fallback response',
      audio: null
    });
    chatService.getFallbackProvider = vi.fn().mockReturnValue({
      sendMessage: fallbackSpy
    });
    
    const response = await chatService.sendMessage('Hello, AI!', { fallbackEnabled: true });
    
    expect(fallbackSpy).toHaveBeenCalled();
    expect(response.text).toBe('Fallback response');
  });
  
  it('handles file uploads', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const response = await chatService.sendMessage('Analyze this file', { file });
    
    expect(response).toBeDefined();
    expect(response.text).toBeDefined();
  });
  
  it('processes system prompts', async () => {
    const systemPrompt = 'You are a helpful assistant';
    const response = await chatService.sendMessage('Hello', { systemPrompt });
    
    expect(response).toBeDefined();
    expect(response.text).toBeDefined();
  });
  
  it('handles web search requests', async () => {
    const response = await chatService.sendMessage('Search for latest news', { 
      webSearchEnabled: true 
    });
    
    expect(response).toBeDefined();
    expect(response.text).toBeDefined();
  });
  
  it('handles menu data integration', async () => {
    const menuData = {
      restaurant: { name: 'Test Restaurant' },
      categories: [
        { 
          name: 'Appetizers', 
          items: [{ name: 'Spring Rolls', price: 5.99 }] 
        }
      ]
    };
    
    const response = await chatService.sendMessage('What appetizers do you have?', { 
      menuData 
    });
    
    expect(response).toBeDefined();
    expect(response.text).toBeDefined();
  });
});
