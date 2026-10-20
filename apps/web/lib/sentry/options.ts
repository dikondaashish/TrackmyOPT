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
// Diagnostic tags our own code sets with static codes (never user data).
// Any other tag, including ones third-party code sets, is dropped.
const DIAGNOSTIC_TAGS = new Set([
  'db_error_code',
  'db_operation',
  'extension_code',
  'extension_version',
  'job_board_dispatch_reason',
  'job_board_dispatch_status',
  'job_board_health',
  'job_board_worker',
  'linkedin_post',
  'policy_news',
  'policy_news_source',
  'source',
  'uscis_status',
]);
const MAX_TAG_LENGTH = 64;

function diagnosticTags(tags: ErrorEvent['tags']): ErrorEvent['tags'] {
  const kept = Object.entries(tags ?? {}).flatMap(([key, value]) =>
    DIAGNOSTIC_TAGS.has(key) &&
    (typeof value === 'string' || typeof value === 'number')
      ? [[key, scrubText(String(value)).slice(0, MAX_TAG_LENGTH)] as const]
      : []
  );
  return kept.length ? Object.fromEntries(kept) : undefined;
}

export function scrubSentryEvent(
  event: ErrorEvent,
  hint: EventHint
): ErrorEvent {
  hint.attachments = [];
  return {
    // Custom grouping (setFingerprint) and our diagnostic tags survive the
    // scrub; without them every report from one call site merged into one
    // issue (TRACKMYOPT-1G held Oracle, failed-source and missing-run kinds).
    fingerprint: event.fingerprint?.map((part) =>
      scrubText(String(part)).slice(0, 200)
    ),
    tags: diagnosticTags(event.tags),
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
// MetaMask's injected provider reports as `app:///scripts/inpage.js`
// (TRACKMYOPT-1Y); our own scripts are always served from /_next/.
const FOREIGN_SCRIPT =
  /^(?:chrome|moz|safari(?:-web)?|ms-browser)-extension:\/\/|userscript|^<anonymous>$|^app:\/\/\/scripts\/inpage\.js$/i;
const EXPLICIT_FOREIGN_SCRIPT =
  /^(?:chrome|moz|safari(?:-web)?|ms-browser)-extension:\/\/|userscript|^app:\/\/\/scripts\/inpage\.js$/i;

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
const BUNDLE_FRAME = /\/_next\//i;
// In the browser the SDK is part of our minified bundle, so its frames are
// `/_next/` chunks until Sentry applies source maps. When the SDK wrapped a
// browser callback (addEventListener, setTimeout, ...) its wrapper is the
// outermost frame, so a leading run of bundle frames is the SDK, not our code.
const SDK_WRAPPED_CALLBACK = /^auto\.browser\.browserapierrors\./;

const frameFiles = (event: ErrorEvent) =>
  (event.exception?.values ?? []).flatMap((exception) =>
    (exception.stacktrace?.frames ?? [])
      .map((frame) => frame.filename ?? frame.abs_path)
      .filter((file): file is string => Boolean(file))
      .filter((file) => !SENTRY_SDK_FRAME.test(file))
  );

/** True when every non-SDK frame belongs to an ad or other third-party script. */
export function isThirdPartyScriptEvent(event: ErrorEvent): boolean {
  let files = frameFiles(event);
  const wrapped = (event.exception?.values ?? []).some((exception) =>
    SDK_WRAPPED_CALLBACK.test(exception.mechanism?.type ?? '')
  );
  if (wrapped) {
    const firstForeign = files.findIndex((file) => !BUNDLE_FRAME.test(file));
    files = firstForeign < 0 ? [] : files.slice(firstForeign);
  }
  return files.length > 0 && files.every((file) => THIRD_PARTY_SCRIPT.test(file));
}

// Chrome's built-in page translator runs as script evaluated in the page
// (`<anonymous>` frames) and logs its own failures with console.error, which
// captureConsole would report as a TrackMyOPT issue.
const BROWSER_FEATURE_CONSOLE = /^Web translate error\b/;

/** True for a browser feature's own console.error logged from injected script. */
export function isBrowserFeatureConsoleEvent(event: ErrorEvent): boolean {
  const values = event.exception?.values ?? [];
  const fromConsole = values.some(
    (v) => v.mechanism?.type === 'auto.core.capture_console'
  );
  const messages = [
    event.message,
    event.logentry?.message,
    ...values.map((v) => v.value),
  ].filter((m): m is string => Boolean(m));
  return (
    fromConsole &&
    messages.length > 0 &&
    messages.every((m) => BROWSER_FEATURE_CONSOLE.test(m)) &&
    frameFiles(event).some((file) => file === '<anonymous>')
  );
}

// Node.js prints its own runtime notices (e.g. "(node:8) ExperimentalWarning:
// vm.USE_MAIN_CONTEXT_DEFAULT_LOADER ...", TRACKMYOPT-1T) to stderr through
// console.error, which captureConsole would report as a TrackMyOPT issue.
// Only experimental/deprecation notices are dropped; other process warnings
// (for example MaxListenersExceededWarning) still report.
const NODE_RUNTIME_NOTICE =
  /^\(node:\d+\) (?:\[[A-Z0-9_]+\] )?(?:ExperimentalWarning|DeprecationWarning):/;

/** True for a Node.js experimental or deprecation notice logged to the console. */
export function isNodeRuntimeNoticeEvent(event: ErrorEvent): boolean {
  const values = event.exception?.values ?? [];
  const fromConsole = values.some(
    (v) => v.mechanism?.type === 'auto.core.capture_console'
  );
  const messages = [
    event.message,
    event.logentry?.message,
    ...values.map((v) => v.value),
  ].filter((m): m is string => Boolean(m));
  return (
    fromConsole &&
    messages.length > 0 &&
    messages.every((m) => NODE_RUNTIME_NOTICE.test(m))
  );
}

// Our code always runs from bundled `/_next/` script files. The served HTML is
// at most 22 lines (`/`) and our only inline scripts are JSON-LD/one-liners, so
// a frame on a page document beyond line 50 is script the browser or host app
// evaluated against the page URL (e.g. the iOS Google app), not TrackMyOPT.
// Safari can also report such script with no URL at all ("undefined:194:70",
// TRACKMYOPT-1Q); a frame without a script URL cannot be one of our bundles.
const SCRIPT_FILE = /\/_next\/|turbopack:|\.[cm]?js(?:[?#]|$)/i;
const INJECTED_MIN_LINE = 50;
const isPageDocumentFrame = (file: string) =>
  /^(?:app|https?):\/\//i.test(file) && !SCRIPT_FILE.test(file);

/**
 * True when every stack frame is on a page document, or has no script URL,
 * past line 50. Frameless errors and any error touching a bundle frame still
 * report.
 */
export function isInjectedPageScriptEvent(event: ErrorEvent): boolean {
  const frames = (event.exception?.values ?? []).flatMap(
    (v) => v.stacktrace?.frames ?? []
  );
  let pageFrames = 0;
  for (const frame of frames) {
    const file = frame.filename ?? frame.abs_path ?? '';
    if (file === '[native code]' || file === '<anonymous>') continue;
    const unlocated = !file || file === 'undefined';
    if (
      !(unlocated || isPageDocumentFrame(file)) ||
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

// Leaving a page rejects pending promises with this DOMException
// (TRACKMYOPT-22); nothing failed for the visitor.
const PAGE_UNLOAD_ABORT = /^Promise was rejected because the browsing context is going away$/;

/** True for a frameless unhandled AbortError raised while a page unloads. */
export function isPageUnloadAbortEvent(event: ErrorEvent): boolean {
  const values = event.exception?.values ?? [];
  return (
    values.length > 0 &&
    values.every(
      (v) =>
        v.type === 'AbortError' &&
        PAGE_UNLOAD_ABORT.test(v.value ?? '') &&
        !(v.stacktrace?.frames ?? []).length
    )
  );
}

// iOS in-app browsers (WKWebView hosts such as social apps) reject their own
// native-bridge promises with this message (TRACKMYOPT-2A). TrackMyOPT never
// uses webkit.messageHandlers, so a frameless rejection is the host app's.
const IN_APP_BRIDGE_REJECTION = /^Script message handler is unavailable$/;

/** True for a frameless unhandled rejection from an iOS in-app browser bridge. */
export function isInAppBrowserBridgeEvent(event: ErrorEvent): boolean {
  const values = event.exception?.values ?? [];
  return (
    values.length > 0 &&
    values.every(
      (v) =>
        v.mechanism?.type === 'auto.browser.global_handlers.onunhandledrejection' &&
        IN_APP_BRIDGE_REJECTION.test(v.value ?? '') &&
        !(v.stacktrace?.frames ?? []).length
    )
  );
}

// Supabase auth-js logs a definitive refresh failure with console.error
// (GoTrueClient _recoverAndRefresh). A refresh token that was already used or
// revoked (TRACKMYOPT-1Z) signs the visitor out: an expected auth outcome.
const EXPECTED_AUTH_REFRESH =
  /^Invalid Refresh Token: (?:Already Used|Refresh Token Not Found)$/;

/** True for Supabase's console report of an expired or reused refresh token. */
export function isExpectedAuthRefreshEvent(event: ErrorEvent): boolean {
  const values = event.exception?.values ?? [];
  return (
    values.length > 0 &&
    values.some((v) => v.mechanism?.type === 'auto.core.capture_console') &&
    values.every(
      (v) => v.type === 'AuthApiError' && EXPECTED_AUTH_REFRESH.test(v.value ?? '')
    )
  );
}

// During a USCIS outage /api/case-status/refresh answers 503, already
// reported once server-side as "USCIS case-status API unavailable"; other
// failures there answer 502 and still report from the browser.
const PROVIDER_OUTAGE_ROUTE = /\/api\/case-status\/refresh(?:[?#]|$)/;

/** True for the browser's report of the refresh route's USCIS-outage 503. */
export function isProviderOutageHttpEvent(event: ErrorEvent): boolean {
  const values = event.exception?.values ?? [];
  return (
    values.some((v) => v.mechanism?.type === 'auto.http.client.fetch') &&
    event.contexts?.response?.status_code === 503 &&
    PROVIDER_OUTAGE_ROUTE.test(event.request?.url ?? '')
  );
}

// withSentryApiErrors reports every handled 5xx from one call site, so Sentry
// grouped all routes into a single issue (TRACKMYOPT-P held both a private
// answers 500 and a case refresh 502). Group by method, route and status.
const API_HTTP_ERROR =
  /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) (\/\S+) returned HTTP (\d{3})$/;

/** Sets a per-route fingerprint on withSentryApiErrors reports. */
export function applyApiErrorFingerprint(event: ErrorEvent): void {
  const match = API_HTTP_ERROR.exec(event.message ?? event.logentry?.message ?? '');
  if (match) event.fingerprint = ['api-http-error', match[1], match[2], match[3]];
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
        isBrowserFeatureConsoleEvent(event) ||
        isNodeRuntimeNoticeEvent(event) ||
        isInjectedPageScriptEvent(event) ||
        isAnalyticsTransportFailure(event) ||
        isPageUnloadAbortEvent(event) ||
        isInAppBrowserBridgeEvent(event) ||
        isExpectedAuthRefreshEvent(event) ||
        isProviderOutageHttpEvent(event)
      )
        return null;
      applyApiErrorFingerprint(event);
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
