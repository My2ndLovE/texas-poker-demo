import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Reload the page to reset the game state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-poker-green-dark flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-red-500">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="text-6xl">⚠️</div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center text-red-400 mb-4">
              Oops! Something went wrong
            </h2>

            {/* Error Message */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-white text-sm mb-2">Error Details:</p>
              <p className="text-red-300 text-xs font-mono break-words">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>

            {/* Instructions */}
            <p className="text-gray-300 text-center mb-6 text-sm">
              Don't worry! This happens sometimes. Click the button below to restart the game.
            </p>

            {/* Reset Button */}
            <button
              onClick={this.handleReset}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              🔄 Restart Game
            </button>

            {/* Additional Help */}
            <div className="mt-4 text-center text-gray-400 text-xs">
              <p>If this problem persists, try clearing your browser cache</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
