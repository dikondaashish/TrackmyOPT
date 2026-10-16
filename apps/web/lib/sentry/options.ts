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

// Google AdSense (blog pages only) and similar ad/measurement scripts throw on
// their own inside our pages, and an `executors/<n>.js` script that is not one
// of our files (TrackMyOPT bundles are served from /_next/). Sentry's global
// handlers wrap them, so the SDK's own frames appear beside theirs; ignore those.
const THIRD_PARTY_SCRIPT =
  /\/pagead\/|googlesyndication\.com|doubleclick\.net|adtrafficquality\.google|\/executors\/\d+\.js(?:[?#]|$)/i;
const SENTRY_SDK_FRAME = /[/+]@?sentry[+/]|\/@sentry\//i;

/** True when every non-SDK frame belongs to an ad or other third-party script. */
export function isThirdPartyScriptEvent(event: ErrorEvent): boolean {
  const files = (event.exception?.values ?? []).flatMap((exception) =>
    (exception.stacktrace?.frames ?? [])
      .map((frame) => frame.filename ?? frame.abs_path)
      .filter((file): file is string => Boolean(file))
      .filter((file) => !SENTRY_SDK_FRAME.test(file))
  );
  return files.length > 0 && files.every((file) => THIRD_PARTY_SCRIPT.test(file));
}

// Our code always runs from bundled `/_next/` script files. The served HTML is
// at most 22 lines (`/`) and our only inline scripts are JSON-LD/one-liners, so
// a frame on a page document beyond line 50 is script the browser or host app
// evaluated against the page URL (e.g. the iOS Google app), not TrackMyOPT.
const SCRIPT_FILE = /\/_next\/|turbopack:|\.[cm]?js(?:[?#]|$)/i;
const INJECTED_MIN_LINE = 50;
const isPageDocumentFrame = (file: string) =>
  /^(?:app|https?):\/\//i.test(file) && !SCRIPT_FILE.test(file);

/**
 * True when every located stack frame is on a page document past line 50.
 * Frameless errors and any error touching a bundle frame still report.
 */
export function isInjectedPageScriptEvent(event: ErrorEvent): boolean {
  const frames = (event.exception?.values ?? []).flatMap(
    (v) => v.stacktrace?.frames ?? []
  );
  let pageFrames = 0;
  for (const frame of frames) {
    const file = frame.filename ?? frame.abs_path ?? '';
    if (file === '[native code]' || file === '<anonymous>') continue;
    if (
      !isPageDocumentFrame(file) ||
      !((frame.lineno ?? 0) > INJECTED_MIN_LINE)
    )
      return false;
    pageFrames++;
  }
  return pageFrames > 0;
}

// The browser's own wording when a request never reached a server (Chrome, Safari,
// Firefox). Sentry may append the host, e.g. "Failed to fetch (www.trackmyopt.com)".
const NETWORK_FAILURE =
  /^(?:failed to fetch|load failed|networkerror when attempting to fetch resource\.?)(?: \(([^)]*)\))?$/i;
// Fixed TrackMyOPT diagnostics for a request that received no HTTP response,
// e.g. "OPT tools: failed to load plan status (stage=network, status=none)".
const NETWORK_DIAGNOSTIC = /\(stage=network, status=none\)$/;

/** True when every exception is a request that failed before any HTTP response. */
export function isBrowserNetworkFailure(event: ErrorEvent): boolean {
  const values = event.exception?.values ?? [];
  if (values.length === 0) return NETWORK_DIAGNOSTIC.test(event.message ?? '');
  return values.every(
    (v) =>
      (v.type === 'TypeError' && NETWORK_FAILURE.test(v.value ?? '')) ||
      NETWORK_DIAGNOSTIC.test(v.value ?? '')
  );
}

/** Origin of the failed request: Sentry names cross-origin hosts in the message. */
export function networkFailureOrigin(
  event: ErrorEvent,
  pageOrigin: string
): string {
  for (const v of event.exception?.values ?? []) {
    const host = NETWORK_FAILURE.exec(v.value ?? '')?.[1];
    if (host && /^[a-z0-9.-]+(?::\d+)?$/i.test(host)) return `https://${host}`;
  }
  return pageOrigin;
}

const PROBE_TIMEOUT_MS = 5_000;
const PROBE_RETRY_DELAY_MS = 2_000;
const probeOnce = async (origin: string) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    // An opaque response proves the host answered; no data is read or sent.
    await fetch(`${origin}/`, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
};

/** True when the host answers now or after one short retry. */
export async function isOriginReachable(origin: string): Promise<boolean> {
  if (await probeOnce(origin)) return true;
  await new Promise((resolve) => setTimeout(resolve, PROBE_RETRY_DELAY_MS));
  return probeOnce(origin);
}

/** True for a caught fetch rejection that never received an HTTP response. */
export function isBrowserNetworkError(error: unknown): boolean {
  return error instanceof TypeError && NETWORK_FAILURE.test(error.message);
}

type BrowserState = { offline: boolean; hidden: boolean; origin?: string };
const browserState = (): BrowserState | null =>
  typeof navigator === 'undefined' ||
  typeof document === 'undefined' ||
  typeof window === 'undefined'
    ? null
    : {
        offline: navigator.onLine === false,
        hidden: document.visibilityState === 'hidden',
        origin: window.location.origin,
      };
// Repeated failures against a reachable host are persistent (e.g. blocked or
// misconfigured requests), not a dropped connection, so they still report.
const MAX_TRANSIENT_NETWORK_FAILURES = 2;
let networkFailureReported = false;
let transientNetworkFailures = 0;
let networkProbe: Promise<boolean> | null = null;
export function resetNetworkFailureReporting() {
  networkFailureReported = false;
  transientNetworkFailures = 0;
  networkProbe = null;
}

/**
 * A visitor's lost connection is not a TrackMyOPT failure: drop it when the
 * browser is offline or the page is hidden. Otherwise probe the failed host:
 * if it answers, the request was lost on the visitor's connection and is
 * dropped; if it stays unreachable (an outage) or keeps failing while
 * reachable, report it. At most one network failure is reported per page load,
 * so one outage cannot fan out into an event for every widget on the page.
 * Server 5xx responses are reported separately and are unaffected.
 *
 * Returns `true` to drop, or a promise of that decision while probing.
 */
export function shouldDropNetworkFailure(
  event: ErrorEvent,
  state: BrowserState | null = browserState(),
  isReachable: (origin: string) => Promise<boolean> = isOriginReachable
): boolean | Promise<boolean> {
  if (!state || !isBrowserNetworkFailure(event)) return false;
  if (state.offline || state.hidden || networkFailureReported || networkProbe)
    return true;
  const probe = isReachable(networkFailureOrigin(event, state.origin ?? ''))
    .catch(() => false)
    .then((reachable) => {
      const transient =
        reachable &&
        ++transientNetworkFailures <= MAX_TRANSIENT_NETWORK_FAILURES;
      if (!transient) networkFailureReported = true;
      return transient;
    })
    .finally(() => {
      if (networkProbe === probe) networkProbe = null;
    });
  networkProbe = probe;
  return probe;
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
  if (state.offline || state.hidden || networkFailureReported || networkProbe)
    return false;
  networkFailureReported = true;
  return true;
}

// posthog-node reports its own delivery problems through console.error, which
// captureConsole turns into issues. A batch lost to a network error/timeout or
// to the bounded shutdown wait is third-party analytics transport, not a
// TrackMyOPT failure. PostHog HTTP errors (e.g. a rejected key) still report.
const POSTHOG_SHUTDOWN_TIMEOUT =
  /^\[PostHog\] Timeout while shutting down PostHog\b/;
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
    beforeSend: (event, hint) => {
      if (
        isForeignScriptEvent(event) ||
        isThirdPartyScriptEvent(event) ||
        isInjectedPageScriptEvent(event) ||
        isAnalyticsTransportFailure(event)
      )
        return null;
      const drop = shouldDropNetworkFailure(event);
      if (typeof drop === 'boolean')
        return drop ? null : scrubSentryEvent(event, hint);
      return drop.then((dropped) =>
        dropped ? null : scrubSentryEvent(event, hint)
      );
    },
    beforeSendTransaction: () => null,
    beforeSendLog: () => null,
    beforeSendMetric: () => null,
  };
}
