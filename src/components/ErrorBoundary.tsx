import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  level?: 'global' | 'dashboard' | 'widget';
  onReset?: () => void;
  customFallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    // Production telemetry / error logging
    console.error('MyArea24 ErrorBoundary caught error:', error, errorInfo);
  }

  resetError = () => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error, errorInfo, showDetails } = this.state;
    const {
      fallbackTitle,
      fallbackMessage,
      level = 'dashboard',
      customFallback,
    } = this.props;

    if (customFallback && error) {
      return customFallback(error, this.resetError);
    }

    // 1. Widget Level (Compact inline recovery)
    if (level === 'widget') {
      return (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-center my-2">
          <div className="flex items-center justify-center gap-2 text-rose-700 font-bold text-xs mb-1">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{fallbackTitle || 'Component Failed to Load'}</span>
          </div>
          <p className="text-[11px] text-slate-600 mb-3 max-w-sm mx-auto">
            {fallbackMessage || error?.message || 'A temporary visual error occurred.'}
          </p>
          <button
            type="button"
            onClick={this.resetError}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      );
    }

    // 2. Global Level (Full screen recovery)
    if (level === 'global') {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold tracking-wide uppercase">
              System Resilience Guard
            </span>

            <h1 className="text-2xl font-black text-slate-900 mt-4 mb-2">
              {fallbackTitle || 'Something Went Wrong'}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {fallbackMessage ||
                'An unexpected error occurred in MyArea24. Your session data and preferences are safe.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={this.resetError}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>

            {error && (
              <div className="text-left border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => this.setState({ showDetails: !showDetails })}
                  className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-800 py-1"
                >
                  <span>Diagnostic Details</span>
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showDetails && (
                  <pre className="mt-2 p-3 bg-slate-900 text-rose-300 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 whitespace-pre-wrap">
                    {error.toString()}
                    {'\n\n'}
                    {errorInfo?.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3. Dashboard Level (Default: In-card recovery within the page layout)
    return (
      <div className="w-full p-6 my-4 bg-white rounded-3xl shadow-card border border-slate-200/80 text-center animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 mb-1">
          {fallbackTitle || 'Unable to display this dashboard section'}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          {fallbackMessage ||
            error?.message ||
            'A temporary issue occurred while rendering this module. You can retry or explore other dashboards.'}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.resetError}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Section</span>
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Home</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-left max-w-lg mx-auto">
            <button
              type="button"
              onClick={() => this.setState({ showDetails: !showDetails })}
              className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-400 hover:text-slate-600"
            >
              <span>Technical details</span>
              {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showDetails && (
              <pre className="mt-2 p-2.5 bg-slate-50 text-slate-700 rounded-lg text-[10px] font-mono overflow-x-auto whitespace-pre-wrap border border-slate-200">
                {error.toString()}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  }
}
