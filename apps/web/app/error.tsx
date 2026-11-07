'use client';

import { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';
import { usePathname } from 'next/navigation';
import {
  captureErrorBoundaryTriggered,
} from '@/lib/posthog-client';
import {
  formatBoundaryErrorMessage,
  shouldReportBoundaryError,
} from '@/lib/posthog/error-boundary-report';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const reportedRef = useRef(false);

  useEffect(() => {
    if (reportedRef.current || !shouldReportBoundaryError(error)) return;
    reportedRef.current = true;

    Sentry.captureException(error);
    captureErrorBoundaryTriggered({
      route: pathname || 'unknown',
      component_area: 'global',
      ...(error.digest ? { error_digest: error.digest } : {}),
      error_message: formatBoundaryErrorMessage(error),
    });
  }, [error, pathname]);

  return (
    <div className="flex min-h-[400px] items-center justify-center bg-surface p-4 sm:p-6">
      <div className="flex w-full max-w-md flex-col items-center rounded-xl border border-border bg-card px-6 py-10 text-center shadow-elevated sm:px-10">
      <div className="rounded-full bg-red-50 p-3 dark:bg-red-950">
        <svg
          className="h-8 w-8 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="mt-5 text-xl font-semibold text-foreground">
        Something went wrong!
      </h2>
      <p className="mt-2 leading-relaxed text-muted-foreground">
        We encountered an unexpected error. Our team has been notified.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-button transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Try again
      </button>
      </div>
    </div>
  );
}
