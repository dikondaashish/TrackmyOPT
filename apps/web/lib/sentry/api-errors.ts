import * as Sentry from '@sentry/nextjs';

// A POST handler may delegate to GET and return the same response. Report once.
const reportedResponses = new WeakSet<Response>();

/** Header on a 5xx caused by a provider outage that was already reported. */
export const UPSTREAM_UNAVAILABLE_HEADER = 'X-Upstream-Unavailable';

/**
 * Marks a 5xx whose cause was already reported elsewhere (for example a
 * provider outage reported once as a grouped warning), so the wrapper does
 * not open a second, per-route issue for it.
 */
export function reportedElsewhere<T extends Response>(response: T): T {
  reportedResponses.add(response);
  return response;
}

/** Report handled server failures without reading requests or response bodies. */
export function withSentryApiErrors<
  Args extends unknown[],
  Result extends Response,
>(
  handler: (...args: Args) => Promise<Result>,
  route: string,
  method: string
): (...args: Args) => Promise<Result>;
export function withSentryApiErrors<
  Args extends unknown[],
  Result extends Response,
>(
  handler: (...args: Args) => Result,
  route: string,
  method: string
): (...args: Args) => Result;
export function withSentryApiErrors<
  Args extends unknown[],
  Result extends Response,
>(
  handler: (...args: Args) => Result | Promise<Result>,
  route: string,
  method: string
): (...args: Args) => Result | Promise<Result> {
  const report = (response: Result): Result => {
    if (response.status >= 500 && !reportedResponses.has(response)) {
      reportedResponses.add(response);
      try {
        // Callers supply a static route pattern, never a URL or record ID.
        // sentryOptions groups these by route and status (apiErrorFingerprint).
        Sentry.captureMessage(
          `${method} ${route} returned HTTP ${response.status}`,
          'error'
        );
      } catch {
        // Monitoring must never replace a customer response with its own error.
      }
    }
    return response;
  };
  return (...args: Args) => {
    // Thrown errors remain unchanged for Next.js/Sentry's exception handler.
    const response = handler(...args);
    return response instanceof Promise
      ? response.then(report)
      : report(response);
  };
}
