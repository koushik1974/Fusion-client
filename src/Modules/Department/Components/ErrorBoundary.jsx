import React from 'react';

/**
 * ErrorBoundary component that catches JavaScript errors in child components
 * and displays a fallback UI instead of crashing the whole application.
 * 
 * This improves application resilience and provides user-friendly error messages.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Optionally log to external error reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // This could send error logs to a server or error tracking service
    // like Sentry, LogRocket, etc.
    const errorLog = {
      message: error.toString(),
      stack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
    
    // Optionally post to error logging endpoint
    // fetch('/api/log-error', { method: 'POST', body: JSON.stringify(errorLog) });
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #f5222d',
          borderRadius: '4px',
          backgroundColor: '#fff1f0',
          color: '#f5222d',
        }}>
          <h2 style={{ marginTop: 0 }}>⚠️ Something went wrong</h2>
          
          <details style={{ whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
              Error Details (click to expand)
            </summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>

          <p>The application encountered an unexpected error. Please try one of the following:</p>
          <ul>
            <li>
              <button 
                onClick={this.resetError}
                style={{
                  padding: '8px 16px',
                  marginRight: '8px',
                  backgroundColor: '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Try Again
              </button>
            </li>
            <li>
              <a 
                href="/"
                style={{ color: '#1890ff', textDecoration: 'none' }}
              >
                Return to Home
              </a>
            </li>
            <li>
              <a 
                href="/help"
                style={{ color: '#1890ff', textDecoration: 'none' }}
              >
                Contact Support
              </a>
            </li>
          </ul>

          {this.state.errorCount > 3 && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fff7e6',
              borderRadius: '4px',
              color: '#ad6800',
            }}>
              <strong>Note:</strong> This error has occurred multiple times. 
              Please clear your browser cache or try using a different browser.
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
