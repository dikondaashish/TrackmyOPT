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

// Our code always runs from bundled `/_next/` script files. A stack made only of
// page-document frames comes from script the browser or host app evaluated
// against the page URL (e.g. iOS in-app browsers), not from TrackMyOPT.
const SCRIPT_FILE = /\/_next\/|\.[cm]?js(?:[?#]|$)/i;
const STACK_OVERFLOW = /^maximum call stack size exceeded\.?$/i;
const isPageDocumentFrame = (file: string) =>
  /^(?:app|https?):\/\//i.test(file) && !SCRIPT_FILE.test(file);

/**
 * True for a stack overflow whose every frame is attributed to the page
 * document. TrackMyOPT ships no multi-line inline scripts, so such frames
 * (e.g. `app:///login:200`) cannot be ours; recursion in our bundles keeps
 * `/_next/` frames and is still reported.
 */
export function isInjectedStackOverflow(event: ErrorEvent): boolean {
  const values = event.exception?.values ?? [];
  if (
    values.length === 0 ||
    !values.every(
      (v) => v.type === 'RangeError' && STACK_OVERFLOW.test(v.value ?? '')
    )
  )
    return false;
  const files = values.flatMap((v) =>
    (v.stacktrace?.frames ?? []).map(
      (frame) => frame.filename ?? frame.abs_path ?? ''
    )
  );
  return (
    files.some(isPageDocumentFrame) &&
    files.every(
      (file) =>
        isPageDocumentFrame(file) ||
        file === '[native code]' ||
        file === '<anonymous>'
    )
  );
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

type BrowserState = { offline: boolean; hidden: boolean; origin: string };
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
  const probe = isReachable(networkFailureOrigin(event, state.origin))
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
      if (isForeignScriptEvent(event) || isInjectedStackOverflow(event))
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
