'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  captureErrorBoundaryTriggered,
} from '@/lib/posthog-client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    captureErrorBoundaryTriggered({
      route: pathname || 'unknown',
      component_area: 'global',
      ...(error.digest ? { error_digest: error.digest } : {}),
    });
  }, [error, pathname]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
        <svg
          className="h-8 w-8 text-red-600 dark:text-red-500"
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
      <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Something went wrong!
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        We encountered an unexpected error. Our team has been notified.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Try again
      </button>
    </div>
  );
}
