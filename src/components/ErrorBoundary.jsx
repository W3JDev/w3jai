import React, { Component } from 'react';
import { formatError } from '../utils/errorHandling';

/**
 * Error Boundary component to catch and display errors in the component tree
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Call onReset prop if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      const formattedError = formatError(this.state.error);
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          formattedError,
          reset: this.handleReset
        });
      }
      
      // Default error UI
      return (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 my-4">
          <h2 className="text-lg font-semibold mb-2">{formattedError.title}</h2>
          <p className="mb-3">{formattedError.message}</p>
          {formattedError.details && (
            <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-40 mb-3">
              {typeof formattedError.details === 'string' 
                ? formattedError.details 
                : JSON.stringify(formattedError.details, null, 2)}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
