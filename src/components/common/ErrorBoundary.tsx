import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, Sparkles, MessageCircle, ShieldCheck, Wrench, ChevronDown } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Al Shujaiat Foundation - Runtime error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleWhatsAppSupport = () => {
    const msg = encodeURIComponent(
      'Hello Al Shujaiat Foundation, I was surfing the website and noticed a feature in development phase.'
    );
    window.open(`https://wa.me/919419301319?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-content-border dark:border-slate-800 shadow-brand-xl text-center space-y-6 animate-fadeIn">
            {/* Development Phase Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mx-auto">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Active Development Phase</span>
            </div>

            {/* Central Graphic */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-brand-purple/20 via-brand-pink/20 to-amber-500/20 blur-xl" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-purple to-brand-pink text-white flex items-center justify-center shadow-brand-md">
                <Wrench className="w-9 h-9" />
              </div>
            </div>

            {/* Title & User-friendly Notice */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-content-primary tracking-tight">
                In Development Phase · Will Be Back Soon
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed max-w-lg mx-auto">
                Thank you for visiting Al Shujaiat Foundation Jammu & Kashmir. This part of our platform is currently in active development or undergoing regular maintenance and enhancements. If something is temporarily not working while you are surfing the site, we are actively improving it and will be back soon!
              </p>
            </div>

            {/* Highlights Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left bg-surface-soft dark:bg-slate-800/60 p-4 rounded-2xl border border-content-border dark:border-slate-800">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-brand-purple dark:text-purple-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-content-primary">Active Upgrades</h4>
                  <p className="text-[11px] text-content-muted">Features & optimizations are actively being deployed.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-content-primary">100% Safe & Secure</h4>
                  <p className="text-[11px] text-content-muted">Donations & records remain completely protected.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleGoHome}
                className="btn-primary flex-1 !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-brand-sm"
              >
                <Home className="w-4 h-4" />
                <span>Return to Homepage</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="btn-outline flex-1 !py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
            </div>

            {/* Support / WhatsApp Help */}
            <div className="pt-2 border-t border-content-border dark:border-slate-800">
              <button
                type="button"
                onClick={this.handleWhatsAppSupport}
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Need immediate assistance? Contact our team on WhatsApp</span>
              </button>
            </div>

            {/* Collapsible Diagnostic info for technical inspection */}
            {this.state.error && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] text-content-muted hover:text-content-secondary flex items-center gap-1 mx-auto"
                >
                  <span>{this.state.showDetails ? 'Hide' : 'View'} technical details</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`} />
                </button>

                {this.state.showDetails && (
                  <div className="mt-2 bg-slate-900 text-slate-200 p-3 rounded-xl text-[11px] font-mono text-left overflow-x-auto border border-slate-700 max-h-36">
                    {this.state.error.message || String(this.state.error)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
