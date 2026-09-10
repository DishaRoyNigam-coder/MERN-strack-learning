// src/components/ErrorBoundary.jsx

import React from 'react';
import './ErrorBoundary.css';

/**
 * ErrorBoundary
 *
 * Catches JavaScript errors anywhere in its child component tree.
 * Displays a fallback UI instead of crashing the whole app.
 *
 * @param {ReactNode} children - The child components to wrap
 * @param {ReactNode} fallback - Custom fallback UI (optional)
 * @param {Function} onError - Callback when an error is caught (optional)
 * @param {string} name - Name of the boundary (for debugging)
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
    this.boundaryName = props.name || 'ErrorBoundary';
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error(`🔴 [${this.boundaryName}] Error caught:`, error);
    console.error('📍 Component stack:', errorInfo?.componentStack || 'No stack available');

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info for display
    this.setState({ errorInfo });
  }

  // Reset the error state (for retry functionality)
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided, otherwise use default
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p className="error-boundary-message">
            {error?.message || 'An unexpected error occurred.'}
          </p>

          {process.env.NODE_ENV === 'development' && errorInfo && (
            <details className="error-boundary-details">
              <summary>🔍 View Error Details</summary>
              <pre>{errorInfo.componentStack || 'No stack trace available.'}</pre>
            </details>
          )}

          <button className="error-boundary-retry" onClick={this.handleReset}>
            🔄 Try Again
          </button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;