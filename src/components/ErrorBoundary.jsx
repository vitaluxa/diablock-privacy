import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Reload the page to reset the app
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-red-500 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl md:text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-red-400">
                Something went wrong
              </h2>
              <p className="text-gray-400 text-sm md:text-base mb-4">
                The game encountered an unexpected error. Don't worry, your progress is saved!
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-4 p-4 bg-gray-900 rounded-lg overflow-auto max-h-40 text-xs">
                <div className="text-red-400 font-bold mb-2">Error:</div>
                <div className="text-gray-300">{this.state.error.toString()}</div>
                {this.state.errorInfo && (
                  <>
                    <div className="text-red-400 font-bold mt-2 mb-2">Stack:</div>
                    <div className="text-gray-400 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


