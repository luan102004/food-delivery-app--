// src/components/shared/ErrorBoundary.tsx - NEW FILE
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary Caught:', error, errorInfo);
    
    // Log to error reporting service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertTriangle className="w-16 h-16 text-red-600" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-bold text-center mb-4 text-gray-900">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-gray-600 text-center mb-6">
                We're sorry, but something unexpected happened. Our team has been notified and we're working on it.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <summary className="cursor-pointer font-semibold text-sm text-gray-700 mb-2">
                    🐛 Error Details (Development Only)
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-gray-600 mb-1">Error Message:</div>
                      <pre className="text-xs bg-red-50 p-3 rounded border border-red-200 overflow-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-1">Component Stack:</div>
                        <pre className="text-xs bg-gray-100 p-3 rounded border border-gray-300 overflow-auto max-h-48">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={this.handleReset}
                  className="flex-1 sm:flex-initial"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={this.handleReload}
                  className="flex-1 sm:flex-initial"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reload Page
                </Button>
                
                <Button
                  variant="primary"
                  size="lg"
                  onClick={this.handleGoHome}
                  className="flex-1 sm:flex-initial"
                >
                  <Home className="w-5 h-5" />
                  Go Home
                </Button>
              </div>

              {/* Help Text */}
              <p className="text-center text-sm text-gray-500 mt-6">
                If the problem persists, please contact support at{' '}
                <a 
                  href="mailto:support@foodhub.vn" 
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  support@foodhub.vn
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

