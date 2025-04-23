/**
 * Provider Adapters for MCP
 * Defines capabilities and formats for each AI provider
 */

/**
 * Provider configuration
 * Each provider has:
 * - supportsToolCalling: Whether the provider natively supports tool calling
 * - toolFormat: The format of tool calls for the provider
 * - formatTools: Function to format tools for the provider
 * - parseToolCalls: Function to parse tool calls from the provider
 */
export const AI_PROVIDERS = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    supportsToolCalling: true,
    toolFormat: "openai",
    formatTools: (tools) => {
      // OpenAI format is already our standard format
      return tools;
    },
    parseToolCalls: (response) => {
      // If response has tool_calls property, return them
      if (response.tool_calls) {
        return response.tool_calls;
      }
      return null;
    }
  },
  
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    supportsToolCalling: true,
    toolFormat: "claude",
    formatTools: (tools) => {
      // Convert to Claude format
      return tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.parameters
      }));
    },
    parseToolCalls: (response) => {
      // Claude returns tool calls in a different format
      if (response.content && Array.isArray(response.content)) {
        const toolCalls = [];
        
        for (const item of response.content) {
          if (item.type === 'tool_use') {
            toolCalls.push({
              id: item.id || `call_${toolCalls.length}`,
              type: 'function',
              function: {
                name: item.name,
                arguments: JSON.stringify(item.input)
              }
            });
          }
        }
        
        return toolCalls.length > 0 ? toolCalls : null;
      }
      
      return null;
    }
  },
  
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    supportsToolCalling: false,
    toolFormat: null,
    formatTools: (tools) => {
      // Gemini doesn't support tool calling yet, so we use prompt engineering
      return null;
    },
    parseToolCalls: (response) => {
      // Parse tool calls from text using regex
      if (typeof response === 'string' || (response && response.content)) {
        const content = typeof response === 'string' ? response : response.content;
        return parseToolCallsFromText(content);
      }
      return null;
    }
  },
  
  groq: {
    id: 'groq',
    name: 'GROQ',
    supportsToolCalling: false,
    toolFormat: null,
    formatTools: (tools) => {
      // GROQ doesn't support tool calling yet, so we use prompt engineering
      return null;
    },
    parseToolCalls: (response) => {
      // Parse tool calls from text using regex
      if (typeof response === 'string' || (response && response.content)) {
        const content = typeof response === 'string' ? response : response.content;
        return parseToolCallsFromText(content);
      }
      return null;
    }
  },
  
  deepseek: {
    id: 'deepseek',
    name: 'Deepseek',
    supportsToolCalling: false,
    toolFormat: null,
    formatTools: (tools) => {
      // Deepseek doesn't support tool calling yet, so we use prompt engineering
      return null;
    },
    parseToolCalls: (response) => {
      // Parse tool calls from text using regex
      if (typeof response === 'string' || (response && response.content)) {
        const content = typeof response === 'string' ? response : response.content;
        return parseToolCallsFromText(content);
      }
      return null;
    }
  },
  
  huggingface: {
    id: 'huggingface',
    name: 'Hugging Face',
    supportsToolCalling: false,
    toolFormat: null,
    formatTools: (tools) => {
      // Hugging Face doesn't support tool calling yet, so we use prompt engineering
      return null;
    },
    parseToolCalls: (response) => {
      // Parse tool calls from text using regex
      if (typeof response === 'string' || (response && response.content)) {
        const content = typeof response === 'string' ? response : response.content;
        return parseToolCallsFromText(content);
      }
      return null;
    }
  },
  
  mcp: {
    id: 'mcp',
    name: 'MCP Server',
    supportsToolCalling: true,
    toolFormat: "openai",
    formatTools: (tools) => {
      // MCP server uses OpenAI format
      return tools;
    },
    parseToolCalls: (response) => {
      // If response has tool_calls property, return them
      if (response.tool_calls) {
        return response.tool_calls;
      }
      return null;
    }
  }
};

/**
 * Parse tool calls from text using regex
 * @param {string} text - The text to parse
 * @returns {Array|null} - Array of tool calls or null if none found
 */
function parseToolCallsFromText(text) {
  if (!text) return null;
  
  // Try to find JSON tool calls in the format:
  // Tool Call: {"function": "web_search", "arguments": {"query": "example"}}
  const toolCallRegex = /Tool Call:\s*({[\s\S]*?})/g;
  const matches = [...text.matchAll(toolCallRegex)];
  
  if (matches.length === 0) {
    // Try alternative format: [TOOL:web_search]\nquery=example
    const altToolCallRegex = /\[TOOL:([\w_]+)\]([\s\S]*?)(?=\[TOOL:|$)/g;
    const altMatches = [...text.matchAll(altToolCallRegex)];
    
    if (altMatches.length > 0) {
      return altMatches.map((match, index) => {
        const toolName = match[1];
        const paramsText = match[2];
        
        // Parse parameters
        const params = {};
        const paramRegex = /(\w+)=([^\n]+)/g;
        const paramMatches = [...paramsText.matchAll(paramRegex)];
        
        paramMatches.forEach(paramMatch => {
          params[paramMatch[1]] = paramMatch[2].trim();
        });
        
        return {
          id: `call_${index}`,
          type: 'function',
          function: {
            name: toolName,
            arguments: JSON.stringify(params)
          }
        };
      });
    }
    
    return null;
  }
  
  // Parse JSON tool calls
  const toolCalls = [];
  
  for (const [_, jsonStr] of matches) {
    try {
      const toolCall = JSON.parse(jsonStr);
      
      toolCalls.push({
        id: `call_${toolCalls.length}`,
        type: 'function',
        function: {
          name: toolCall.function,
          arguments: typeof toolCall.arguments === 'string' 
            ? toolCall.arguments 
            : JSON.stringify(toolCall.arguments)
        }
      });
    } catch (error) {
      console.error('Error parsing tool call JSON:', error);
    }
  }
  
  return toolCalls.length > 0 ? toolCalls : null;
}

/**
 * Get a provider by ID
 * @param {string} providerId - The ID of the provider
 * @returns {Object|null} - The provider configuration or null if not found
 */
export const getProviderById = (providerId) => {
  return AI_PROVIDERS[providerId] || null;
};

/**
 * Get all supported providers
 * @returns {Array} - Array of provider configurations
 */
export const getAllProviders = () => {
  return Object.values(AI_PROVIDERS);
};

export default {
  AI_PROVIDERS,
  getProviderById,
  getAllProviders
};
