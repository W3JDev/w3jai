/**
 * Utility functions for input validation
 */

/**
 * Validates a file upload based on type and size
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {string[]} options.allowedTypes - Array of allowed MIME types
 * @param {number} options.maxSize - Maximum file size in bytes
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateFile = (file, options = {}) => {
  const {
    allowedTypes = ['text/plain', 'image/jpeg', 'image/png', 'application/pdf'],
    maxSize = 10 * 1024 * 1024 // 10MB default
  } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: `File too large. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB`
    };
  }

  return { isValid: true };
};

/**
 * Validates text input
 * @param {string} text - The text to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxLength - Maximum text length
 * @param {boolean} options.allowEmpty - Whether empty text is allowed
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateText = (text, options = {}) => {
  const {
    maxLength = 4000,
    allowEmpty = false
  } = options;

  // Check if text is empty
  if (!allowEmpty && (!text || text.trim() === '')) {
    return {
      isValid: false,
      message: 'Text cannot be empty'
    };
  }

  // Check text length
  if (text && text.length > maxLength) {
    return {
      isValid: false,
      message: `Text too long. Maximum length: ${maxLength} characters`
    };
  }

  return { isValid: true };
};

/**
 * Validates API key format
 * @param {string} apiKey - The API key to validate
 * @param {string} provider - The provider name for custom validation
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateApiKey = (apiKey, provider = '') => {
  if (!apiKey || apiKey.trim() === '') {
    return {
      isValid: false,
      message: 'API key cannot be empty'
    };
  }

  // Provider-specific validation - simplified to accept more formats
  switch (provider.toLowerCase()) {
    case 'openai':
      // Accept any non-empty OpenAI key
      // OpenAI keys can have different formats now
      break;
    case 'anthropic':
      // Accept any non-empty Anthropic key
      break;
    // Add more provider-specific validations as needed
  }

  return { isValid: true };
};

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) return '';

  // Basic sanitization - replace potentially dangerous characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Validates URL format
 * @param {string} url - The URL to validate
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateUrl = (url) => {
  if (!url || url.trim() === '') {
    return {
      isValid: false,
      message: 'URL cannot be empty'
    };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      message: 'Invalid URL format'
    };
  }
};
