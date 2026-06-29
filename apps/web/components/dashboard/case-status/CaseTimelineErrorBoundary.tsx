"use client";

import { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

/** Isolates timeline rendering failures so malformed history does not crash the page. */
export class CaseTimelineErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.warn("Case timeline render failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 dark:text-amber-100">
            Unable to display case timeline. Your case status is still saved — try refreshing the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
