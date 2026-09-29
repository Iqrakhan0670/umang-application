import React from "react";

// Wrap any section that might crash. Instead of the whole page going blank,
// only this section shows the error message, so the cause is visible.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`[ErrorBoundary: ${this.props.label || "section"}]`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-rose-700 mb-1">
            {this.props.label || "This section"} could not load
          </p>
          <p className="text-rose-600 font-mono text-xs break-words">
            {String(this.state.error?.message || this.state.error)}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}