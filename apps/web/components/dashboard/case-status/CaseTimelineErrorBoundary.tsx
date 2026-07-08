"use client";

import { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { captureErrorBoundaryTriggered } from "@/lib/posthog-client";
import {
  formatBoundaryErrorMessage,
  shouldReportBoundaryError,
} from "@/lib/posthog/error-boundary-report";

type Props = {
  children: ReactNode;
  /** Short label for console diagnostics (e.g. "timeline", "analytics"). */
  area?: string;
  message?: string;
};

type State = {
  hasError: boolean;
};

function PanelErrorFallback({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-900 dark:text-amber-100">{message}</p>
    </div>
  );
}

function reportPanelError(
  area: string | undefined,
  error: Error,
  reportedRef: { current: boolean }
): void {
  if (reportedRef.current || !shouldReportBoundaryError(error)) return;
  reportedRef.current = true;
  console.warn(
    `Case status panel render failed${area ? ` (${area})` : ""}:`,
    error
  );
  captureErrorBoundaryTriggered({
    route:
      typeof window !== "undefined" ? window.location.pathname : "/dashboard/case-status",
    component_area: "case_status",
    ...(area ? { panel_area: area } : {}),
    error_message: formatBoundaryErrorMessage(error),
  });
}

/** Isolates a dashboard panel so one bad subtree does not crash the route. */
export class CaseStatusPanelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  private reportedRef = { current: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    reportPanelError(this.props.area, error, this.reportedRef);
  }

  render() {
    if (this.state.hasError) {
      return (
        <PanelErrorFallback
          message={
            this.props.message ??
            "Unable to display this section. Your case data is still saved — try refreshing the page."
          }
        />
      );
    }

    return this.props.children;
  }
}

/** Isolates timeline rendering failures so malformed history does not crash the page. */
export class CaseTimelineErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  private reportedRef = { current: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    reportPanelError(this.props.area ?? "timeline", error, this.reportedRef);
  }

  render() {
    if (this.state.hasError) {
      return (
        <PanelErrorFallback message="Unable to display case timeline. Your case status is still saved — try refreshing the page." />
      );
    }

    return this.props.children;
  }
}
