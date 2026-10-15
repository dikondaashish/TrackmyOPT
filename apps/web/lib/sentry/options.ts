import type { ErrorEvent, EventHint, init, StackFrame } from '@sentry/nextjs';
import { sanitize } from '@/lib/secure-logger';

/** Remove URL credentials, queries, fragments, and private record identifiers. */
function scrubText(value: string): string {
  // SDK errors can embed entire serialized sessions, including truncated JSON.
  // Redact the payload as a whole; field-pattern filtering cannot remove names,
  // identity metadata, documents, or AI text whose contents we cannot predict.
  const payloadStart = value.search(
    /\{|\[(?=\s*(?:"|\{|\d|true\b|false\b|null\b))/
  );
  const diagnostic =
    payloadStart < 0
      ? value
      : `${value.slice(0, payloadStart)}[REDACTED_PAYLOAD]`;
  const withoutQueries = diagnostic.replace(
    /https?:\/\/[^\s"'<>]+/g,
    (value) => {
      try {
        const url = new URL(value);
        return `${url.origin}${url.pathname}`;
      } catch {
        return '[REDACTED_URL]';
      }
    }
  );
  return String(sanitize(withoutQueries)).replace(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
    '[REDACTED_ID]'
  );
}

function scrubFrame(frame: StackFrame): StackFrame {
  // Keep enough for source-map resolution; exclude locals and source context.
  return {
    filename: frame.filename ? scrubText(frame.filename) : undefined,
    abs_path: frame.abs_path ? scrubText(frame.abs_path) : undefined,
    function: frame.function ? scrubText(frame.function) : undefined,
    module: frame.module ? scrubText(frame.module) : undefined,
    lineno: frame.lineno,
    colno: frame.colno,
    in_app: frame.in_app,
  };
}

/** Allow only diagnostic fields, even when a caller adds private scope data. */
export function scrubSentryEvent(
  event: ErrorEvent,
  hint: EventHint
): ErrorEvent {
  hint.attachments = [];
  return {
    type: undefined,
    event_id: event.event_id,
    timestamp: event.timestamp,
    platform: event.platform,
    level: event.level,
    release: event.release,
    environment: event.environment,
    dist: event.dist,
    sdk: event.sdk,
    debug_meta: event.debug_meta,
    message: event.message ? scrubText(event.message) : undefined,
    logentry: event.logentry
      ? {
          message: event.logentry.message
            ? scrubText(event.logentry.message)
            : undefined,
        }
      : undefined,
    exception: event.exception
      ? {
          values: event.exception.values?.map((exception) => ({
            type: exception.type ? scrubText(exception.type) : undefined,
            value: exception.value ? scrubText(exception.value) : undefined,
            stacktrace: exception.stacktrace
              ? {
                  frames: exception.stacktrace.frames?.map(scrubFrame),
                }
              : undefined,
            mechanism: exception.mechanism
              ? {
                  type: exception.mechanism.type,
                  handled: exception.mechanism.handled,
                }
              : undefined,
          })),
        }
      : undefined,
    request: event.request ? { method: event.request.method } : undefined,
    // Trace IDs correlate errors without sending user, device, or custom context.
    contexts: event.contexts?.trace
      ? {
          trace: {
            trace_id: event.contexts.trace.trace_id,
            span_id: event.contexts.trace.span_id,
          },
        }
      : undefined,
  };
}

// Browser extensions and userscript managers inject code into our pages; their
// crashes are not TrackMyOPT failures and would otherwise exhaust the quota.
const FOREIGN_SCRIPT =
  /^(?:chrome|moz|safari(?:-web)?|ms-browser)-extension:\/\/|userscript|^<anonymous>$/i;
const EXPLICIT_FOREIGN_SCRIPT =
  /^(?:chrome|moz|safari(?:-web)?|ms-browser)-extension:\/\/|userscript/i;

/** True when every stack frame belongs to injected third-party script. */
export function isForeignScriptEvent(event: ErrorEvent): boolean {
  const files = (event.exception?.values ?? []).flatMap((exception) =>
    (exception.stacktrace?.frames ?? [])
      .map((frame) => frame.filename ?? frame.abs_path)
      .filter((file): file is string => Boolean(file))
  );
  return (
    files.length > 0 &&
    files.every((file) => FOREIGN_SCRIPT.test(file)) &&
    files.some((file) => EXPLICIT_FOREIGN_SCRIPT.test(file))
  );
}

// The browser's own wording when a request never reached a server (Chrome, Safari,
// Firefox). Sentry may append the host, e.g. "Failed to fetch (www.trackmyopt.com)".
const NETWORK_FAILURE =
  /^(?:failed to fetch|load failed|networkerror when attempting to fetch resource\.?)(?: \([^)]*\))?$/i;

/** True when every exception is a request that failed before any HTTP response. */
export function isBrowserNetworkFailure(event: ErrorEvent): boolean {
  const values = event.exception?.values ?? [];
  return (
    values.length > 0 &&
    values.every(
      (v) => v.type === 'TypeError' && NETWORK_FAILURE.test(v.value ?? '')
    )
  );
}

/** True for a caught fetch rejection that never received an HTTP response. */
export function isBrowserNetworkError(error: unknown): boolean {
  return error instanceof TypeError && NETWORK_FAILURE.test(error.message);
}

type BrowserState = { offline: boolean; hidden: boolean };
const browserState = (): BrowserState | null =>
  typeof navigator === 'undefined' || typeof document === 'undefined'
    ? null
    : {
        offline: navigator.onLine === false,
        hidden: document.visibilityState === 'hidden',
      };
let networkFailureReported = false;
export function resetNetworkFailureReporting() {
  networkFailureReported = false;
}

/**
 * A visitor's lost connection is not a TrackMyOPT failure: drop it when the
 * browser is offline or the page is hidden. Otherwise keep the first network
 * failure per page load, so a real site outage still reports, but one dropped
 * connection cannot fan out into an event for every widget on the page.
 * Server 5xx responses are reported separately and are unaffected.
 */
export function shouldDropNetworkFailure(
  event: ErrorEvent,
  state: BrowserState | null = browserState()
): boolean {
  if (!isBrowserNetworkFailure(event)) return false;
  return !shouldReportCaughtNetworkFailure(state);
}

/**
 * The same policy for app code that catches a network failure and reports it
 * with its own fixed message (which `isBrowserNetworkFailure` cannot match).
 * Shares the once-per-page-load budget with uncaught network failures.
 */
export function shouldReportCaughtNetworkFailure(
  state: BrowserState | null = browserState()
): boolean {
  if (!state) return true;
  if (state.offline || state.hidden || networkFailureReported) return false;
  networkFailureReported = true;
  return true;
}

// posthog-node reports its own delivery problems through console.error, which
// captureConsole turns into issues. A batch lost to a network error/timeout or
// to the bounded shutdown wait is third-party analytics transport, not a
// TrackMyOPT failure. PostHog HTTP errors (e.g. a rejected key) still report.
const POSTHOG_SHUTDOWN_TIMEOUT = /^\[PostHog\] Timeout while shutting down PostHog\b/;
const POSTHOG_NETWORK_TYPES = new Set([
  'PostHogFetchNetworkError',
  'AbortError',
  'TimeoutError',
  'TypeError',
]);

export function isAnalyticsTransportFailure(event: ErrorEvent): boolean {
  const values = event.exception?.values ?? [];
  if (values.some((v) => v.type === 'PostHogFetchNetworkError')) {
    return values.every((v) => POSTHOG_NETWORK_TYPES.has(v.type ?? ''));
  }
  const messages = [
    event.message,
    event.logentry?.message,
    ...values.map((v) => v.value),
  ].filter((m): m is string => Boolean(m));
  return (
    messages.length > 0 &&
    messages.every((m) => POSTHOG_SHUTDOWN_TIMEOUT.test(m))
  );
}

export function sentryOptions(
  dsn: string | undefined
): Parameters<typeof init>[0] {
  return {
    dsn,
    enabled: Boolean(dsn) && process.env.NODE_ENV !== 'test',
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    sampleRate: 1,
    traceLifecycle: 'static',
    maxBreadcrumbs: 0,
    tracePropagationTargets: [],
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      graphQL: { document: false, variables: false },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      stackFrameVariables: false,
      frameContextLines: 0,
    },
    beforeSend: (event, hint) =>
      isForeignScriptEvent(event) ||
      isAnalyticsTransportFailure(event) ||
      shouldDropNetworkFailure(event)
        ? null
        : scrubSentryEvent(event, hint),
    beforeSendTransaction: () => null,
    beforeSendLog: () => null,
    beforeSendMetric: () => null,
  };
}
