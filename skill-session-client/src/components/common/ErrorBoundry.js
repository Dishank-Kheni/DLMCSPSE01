// src/components/common/ErrorBoundary.js
import { Button, Result } from 'antd';
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="Sorry, an error occurred while rendering this page."
          extra={[
            <Button key="home" onClick={this.handleReset} type="primary">
              Back to Home
            </Button>
          ]}
        >
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: 20, textAlign: 'left' }}>
              <h4>Error Details:</h4>
              <div style={{ 
                padding: 15, 
                background: '#f5f5f5', 
                borderRadius: 4,
                maxHeight: 300,
                overflow: 'auto'
              }}>
                <p>{this.state.error && this.state.error.toString()}</p>
                <div>
                  {this.state.errorInfo && 
                    this.state.errorInfo.componentStack.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </Result>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;