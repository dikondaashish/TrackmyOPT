import * as Sentry from '@sentry/nextjs';

// A POST handler may delegate to GET and return the same response. Report once.
const reportedResponses = new WeakSet<Response>();

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
