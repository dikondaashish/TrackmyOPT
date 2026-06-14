'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { captureErrorBoundaryTriggered } from '@/lib/posthog-client';

export default function CaseStatusError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureErrorBoundaryTriggered({
      route: '/dashboard/case-status',
      component_area: 'case_status',
      ...(error.digest ? { error_digest: error.digest } : {}),
    });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[360px] max-w-lg flex-col items-center justify-center p-6 text-center">
      <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/20">
        <svg
          className="h-8 w-8 text-amber-600 dark:text-amber-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Couldn&apos;t load case status
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        We hit a display issue while showing your USCIS case. Your case data is
        still saved — try refreshing this page.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
