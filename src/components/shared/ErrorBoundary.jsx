import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from 'shared-ui';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[ErrorBoundary] Component crashed:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-100 bg-rose-50/20 backdrop-blur-xs shadow-xs space-y-4">
          <div className="p-3.5 bg-rose-100/60 text-rose-700 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-900">
              {this.props.title || "Component Render Failed"}
            </h3>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              {this.props.message || "An unexpected error occurred in this interactive widget. You can retry rendering it."}
            </p>
            {this.state.error && (
              <pre className="mt-2 p-2 bg-rose-950 text-rose-200 font-mono text-[9px] rounded-lg max-w-xs overflow-x-auto text-left">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
          </div>
          <Button
            size="sm"
            onClick={this.handleReset}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs gap-1.5 flex items-center shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Component
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
