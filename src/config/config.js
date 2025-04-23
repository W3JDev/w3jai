/**
 * Application configuration
 */

const config = {
  development: {
    apiUrl: 'http://localhost:3001',
    providers: {
      openai: import.meta.env.VITE_OPENAI_KEY,
      groq: import.meta.env.VITE_GROQ_KEY,
      anthropic: import.meta.env.VITE_ANTHROPIC_KEY,
      deepseek: import.meta.env.VITE_DEEPSEEK_KEY,
      huggingface: import.meta.env.VITE_HUGGINGFACE_KEY
    },
    elevenLabsKey: import.meta.env.VITE_ELEVENLABS_KEY,
    mcpServerUrl: import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:3001',
    defaultProvider: 'openai',
    features: {
      enableVoice: true,
      enableVideo: true,
      enableFileUpload: true,
      enableStructuredOutput: true,
      enableWebSearch: true
    },
    security: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['text/plain', 'image/jpeg', 'image/png', 'application/pdf'],
      maxMessageLength: 4000
    },
    performance: {
      maxChatHistoryLength: 50,
      streamResponses: true
    }
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || window.location.origin,
    providers: {
      openai: import.meta.env.VITE_OPENAI_KEY,
      groq: import.meta.env.VITE_GROQ_KEY,
      anthropic: import.meta.env.VITE_ANTHROPIC_KEY,
      deepseek: import.meta.env.VITE_DEEPSEEK_KEY,
      huggingface: import.meta.env.VITE_HUGGINGFACE_KEY
    },
    elevenLabsKey: import.meta.env.VITE_ELEVENLABS_KEY,
    mcpServerUrl: import.meta.env.VITE_MCP_SERVER_URL || window.location.origin,
    defaultProvider: 'openai',
    features: {
      enableVoice: true,
      enableVideo: true,
      enableFileUpload: true,
      enableStructuredOutput: true,
      enableWebSearch: true
    },
    security: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['text/plain', 'image/jpeg', 'image/png', 'application/pdf'],
      maxMessageLength: 4000
    },
    performance: {
      maxChatHistoryLength: 50,
      streamResponses: true
    }
  }
};

// Determine current environment
const env = import.meta.env.MODE || 'development';
const currentConfig = config[env];

export default currentConfig;

/**
 * Get API URL for a specific endpoint
 * @param {string} endpoint - The API endpoint
 * @returns {string} - Full API URL
 */
export const getApiUrl = (endpoint) => {
  return `${currentConfig.apiUrl}${endpoint}`;
};

/**
 * Get API key for a specific provider
 * @param {string} provider - The provider name
 * @returns {string|null} - API key or null if not found
 */
export const getApiKey = (provider) => {
  return currentConfig.providers[provider] || null;
};

/**
 * Check if a feature is enabled
 * @param {string} feature - The feature name
 * @returns {boolean} - Whether the feature is enabled
 */
export const isFeatureEnabled = (feature) => {
  return currentConfig.features[feature] || false;
};

/**
 * Get security configuration
 * @returns {Object} - Security configuration
 */
export const getSecurityConfig = () => {
  return currentConfig.security;
};

/**
 * Get performance configuration
 * @returns {Object} - Performance configuration
 */
export const getPerformanceConfig = () => {
  return currentConfig.performance;
};
