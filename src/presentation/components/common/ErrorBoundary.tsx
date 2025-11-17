import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React rendering errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
    // Reload the page to reset the app state
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-poker-felt to-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border-2 border-red-600 max-w-md">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-300 mb-4">
              The poker game encountered an unexpected error. Don't worry, this happens sometimes!
            </p>
            {this.state.error && (
              <div className="bg-gray-900 p-4 rounded mb-4 text-sm">
                <p className="text-red-400 font-mono">{this.state.error.message}</p>
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Reset Game
            </button>
            <p className="text-gray-400 text-sm mt-4 text-center">
              If this problem persists, please refresh the page.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
