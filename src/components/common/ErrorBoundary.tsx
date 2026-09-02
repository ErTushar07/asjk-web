import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-content-border shadow-brand-lg text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner border border-rose-100">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
                Al Shujaiat Foundation Platform
              </span>
              <h2 className="text-2xl font-black text-content-primary">
                Something Went Wrong
              </h2>
              <p className="text-xs text-content-secondary leading-relaxed">
                An unexpected interface issue occurred. Our technical systems have logged this event. Please reload or return to the main homepage.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-surface-soft p-3 rounded-xl text-[11px] font-mono text-content-muted text-left truncate border border-content-border">
                {this.state.error.message || 'Unknown application state error'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="btn-primary flex-1 !py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn-outline flex-1 !py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Home Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
