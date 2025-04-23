/**
 * Error handling utilities
 */

// Custom error classes
export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class AuthenticationError extends Error {
  constructor(message, provider = null) {
    super(message);
    this.name = 'AuthenticationError';
    this.provider = provider;
  }
}

/**
 * Handles API errors with exponential backoff retry
 * @param {Function} apiCall - Async function that makes the API call
 * @param {Object} options - Options for retry behavior
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.initialDelay - Initial delay in ms
 * @param {number} options.maxDelay - Maximum delay in ms
 * @param {Function} options.shouldRetry - Function that determines if error should trigger retry
 * @returns {Promise} - Result of the API call
 */
export const withRetry = async (apiCall, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error) => {
      // By default, retry on network errors and 5xx server errors
      return (
        !error.status || // Network error
        (error.status >= 500 && error.status < 600) || // Server error
        error.status === 429 // Rate limit
      );
    }
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt >= maxRetries || !shouldRetry(error)) {
        break;
      }
      
      // Calculate delay with exponential backoff and jitter
      delay = Math.min(delay * 1.5 * (1 + Math.random() * 0.2), maxDelay);
      
      console.log(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${Math.round(delay)}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // If we get here, all retries failed
  throw lastError;
};

/**
 * Formats error messages for display
 * @param {Error} error - The error object
 * @returns {Object} - Formatted error with title and message
 */
export const formatError = (error) => {
  if (error instanceof ApiError) {
    return {
      title: `API Error (${error.status || 'Unknown'})`,
      message: error.message,
      details: error.details
    };
  }
  
  if (error instanceof ValidationError) {
    return {
      title: 'Validation Error',
      message: error.message,
      field: error.field
    };
  }
  
  if (error instanceof AuthenticationError) {
    return {
      title: 'Authentication Error',
      message: error.message,
      provider: error.provider
    };
  }
  
  // Handle network errors
  if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
    return {
      title: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection.'
    };
  }
  
  // Default error format
  return {
    title: error.name || 'Error',
    message: error.message || 'An unexpected error occurred'
  };
};

/**
 * Creates a global error handler for unhandled promise rejections
 * @param {Function} errorCallback - Function to call with formatted error
 */
export const setupGlobalErrorHandler = (errorCallback) => {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    const formattedError = formatError(event.reason);
    errorCallback(formattedError);
  });
  
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    const formattedError = formatError(event.error || new Error(event.message));
    errorCallback(formattedError);
  });
};
