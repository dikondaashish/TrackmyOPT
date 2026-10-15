import posthog from "posthog-js";
import { isMonitoringCapabilityPage, redactMonitoringAnalytics } from "./monitoring-link-privacy";
import { ANALYTICS_CONSENT_CHANGE_EVENT } from "@/lib/privacy/events";
import { POSTHOG_SESSION_RECORDING } from "@/lib/posthog/session-replay-privacy";

// React DOM removeChild/insertBefore failures remain observable. A message
// alone cannot distinguish an extension mutation from a first-party defect.

/** Supabase Realtime WebSocket blocked by browser privacy settings — not a product bug. */
export function isBenignWebSocketError(message: string): boolean {
  const lower = message.toLowerCase();
  if (lower.includes("websocket not available")) return true;
  if (lower.includes("operation is insecure") && lower.includes("websocket")) return true;
  return false;
}

/** @deprecated Use isBenignWebSocketError */
export function isBenignWebSocketUnavailableError(message: string): boolean {
  return isBenignWebSocketError(message);
}

/** Pull exception values from every shape posthog-js may emit. */
function extractExceptionValues(
  properties: Record<string, unknown> | undefined
): string[] {
  if (!properties) return [];

  const parts: string[] = [];

  const values = properties.$exception_values;
  if (Array.isArray(values)) {
    for (const v of values) parts.push(String(v));
  } else if (values != null) {
    parts.push(String(values));
  }

  if (properties.$exception_message != null) {
    parts.push(String(properties.$exception_message));
  }

  const list = properties.$exception_list;
  if (Array.isArray(list)) {
    for (const item of list) {
      if (item && typeof item === "object") {
        const row = item as { value?: unknown; type?: unknown };
        if (row.value != null) parts.push(String(row.value));
        if (row.type != null) parts.push(String(row.type));
      }
    }
  }

  return parts;
}

/** Pull exception text from every shape posthog-js may emit. */
export function extractExceptionMessages(
  properties: Record<string, unknown> | undefined
): string {
  return extractExceptionValues(properties).join(" ");
}

function extractExceptionFrameSources(
  properties: Record<string, unknown> | undefined
): string[] {
  if (!properties || !Array.isArray(properties.$exception_list)) return [];

  const sources: string[] = [];
  for (const item of properties.$exception_list) {
    if (!item || typeof item !== "object") continue;
    const stacktrace = (item as { stacktrace?: unknown }).stacktrace;
    if (!stacktrace || typeof stacktrace !== "object") continue;
    const frames = (stacktrace as { frames?: unknown }).frames;
    if (!Array.isArray(frames)) continue;

    for (const frame of frames) {
      if (!frame || typeof frame !== "object") continue;
      const row = frame as Record<string, unknown>;
      for (const key of ["source", "filename", "abs_path", "module"]) {
        if (row[key] != null) sources.push(String(row[key]));
      }
    }
  }

  return sources;
}

/** Browser ResizeObserver noise — not a product defect. */
export function isBenignResizeObserverLoopError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("resizeobserver loop");
}

/** AdSense layout/push failures when the slot is too narrow, empty, or duplicate. */
export function isBenignAdSenseTagError(message: string): boolean {
  const lower = message.toLowerCase();
  if (!lower.includes("adsbygoogle")) return false;
  return (
    lower.includes("tagerror") ||
    lower.includes("fluid responsive") ||
    lower.includes("availablewidth") ||
    lower.includes("no slot size") ||
    lower.includes("already have ads in them")
  );
}

/** Network failures thrown inside AdSense are external and not app-fixable. */
export function isBenignAdSenseNetworkError(
  properties: Record<string, unknown> | undefined
): boolean {
  const hasNetworkFailure = extractExceptionValues(properties).some((value) => {
    const normalized = value.trim().toLowerCase();
    return normalized === "failed to fetch" || normalized === "load failed";
  });
  if (!hasNetworkFailure) return false;

  return extractExceptionFrameSources(properties).some((source) => {
    const normalized = source.toLowerCase();
    return (
      normalized.includes("pagead2.googlesyndication.com") ||
      normalized.includes("/pagead/js/adsbygoogle.js")
    );
  });
}

/** Browsers use this opaque placeholder when a cross-origin script hides details. */
export function isOpaqueCrossOriginScriptError(
  properties: Record<string, unknown> | undefined
): boolean {
  return extractExceptionValues(properties).some(
    (value) => value.trim().toLowerCase() === "script error."
  );
}

/** Brave iOS injects this assignment even when its wallet provider is absent.
 * https://github.com/brave/brave-browser/issues/58670
 * Require the browser/OS and page-script evidence; keep bundled or mixed errors.
 */
export function isBraveWalletInjectionError(
  properties: Record<string, unknown> | undefined
): boolean {
  if (properties?.$browser !== 'Brave' || properties.$os !== 'iOS')
    return false;
  const message =
    "undefined is not an object (evaluating 'window.ethereum.selectedAddress = undefined')";
  const values = extractExceptionValues(properties);
  const sources = extractExceptionFrameSources(properties);
  return (
    values.includes(message) &&
    values.every((value) => value === message || value === 'TypeError') &&
    sources.length > 0 &&
    sources.every(
      (source) => !/\/_next\/|turbopack:|\.[cm]?js(?:$|[?#])/i.test(source)
    )
  );
}

const INJECTED_MIN_LINE = 50;
const isPageDocumentSource = (source: string) =>
  /^(?:https?:\/\/|app:\/\/|\/)/i.test(source) &&
  !/\/_next\/|turbopack:|\.[cm]?js(?:$|[?#])/i.test(source);

/**
 * Script the browser or host app evaluates against the page URL (e.g. the iOS
 * Google app's in-app browser) reports frames on the page document itself. Our
 * served HTML is at most 22 lines and only inlines JSON-LD/one-liners, so drop
 * an exception only when every located frame is a page document past line 50.
 * Frameless errors and anything touching a bundle frame still report.
 */
export function isInjectedPageScriptError(
  properties: Record<string, unknown> | undefined
): boolean {
  if (!properties || !Array.isArray(properties.$exception_list)) return false;
  let pageFrames = 0;
  for (const item of properties.$exception_list) {
    const frames = (
      item as { stacktrace?: { frames?: unknown } } | null | undefined
    )?.stacktrace?.frames;
    if (!Array.isArray(frames)) continue;
    for (const frame of frames) {
      if (!frame || typeof frame !== 'object') return false;
      const row = frame as Record<string, unknown>;
      const source = String(row.filename ?? row.abs_path ?? row.source ?? '');
      if (source === '[native code]' || source === '<anonymous>') continue;
      if (
        !isPageDocumentSource(source) ||
        !(typeof row.lineno === 'number' && row.lineno > INJECTED_MIN_LINE)
      )
        return false;
      pageFrames++;
    }
  }
  return pageFrames > 0;
}

/**
 * Instagram / Facebook / iOS in-app browsers inject native bridges that call
 * `window.webkit.messageHandlers` on pagehide. Missing handlers throw TypeError
 * that is not first-party product code.
 */
export function isBenignWebkitMessageHandlersError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("webkit.messagehandlers") ||
    lower.includes("webkit.message_handlers")
  );
}

/**
 * Some SEO/browser tools inject a one-line probe that assumes an `og:type`
 * meta tag exists. Its page-URL-only stack frame is not TrackMyOPT bundle code.
 */
export function isBenignInjectedOpenGraphProbeError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("document.queryselector") &&
    lower.includes("meta[property=") &&
    lower.includes("og:type") &&
    lower.includes(".content") &&
    (lower.includes("null is not an object") ||
      lower.includes("cannot read properties of null"))
  );
}

/**
 * Injected page bridges (Outlook Safe Links, password managers, security
 * suites) reject with `Object Not Found Matching Id:N, MethodName:x,
 * ParamCount:y` when their host object is gone. No first-party frames.
 */
export function isBenignInjectedBridgeRejection(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("object not found matching id") &&
    lower.includes("methodname") &&
    lower.includes("paramcount")
  );
}

/** Extension content scripts leak their own globals into page error handlers. */
export function isBenignExtensionContentScriptError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("contentscriptdata") ||
    lower.includes("chrome-extension://") ||
    lower.includes("moz-extension://") ||
    lower.includes("safari-web-extension://")
  );
}

/**
 * The browser aborts in-flight promises when the user navigates away. This is
 * the expected teardown path, not a failure users can act on.
 */
export function isBenignNavigationAbortError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("browsing context is going away") ||
    (lower.includes("aborterror") && lower.includes("navigation"))
  );
}

/** Shared text heuristics for $exception and error-boundary reporting. */
export function isBenignExceptionMessage(message: string): boolean {
  return (
    isBenignWebSocketError(message) ||
    isBenignResizeObserverLoopError(message) ||
    isBenignAdSenseTagError(message) ||
    isBenignWebkitMessageHandlersError(message) ||
    isBenignInjectedOpenGraphProbeError(message) ||
    isBenignInjectedBridgeRejection(message) ||
    isBenignExtensionContentScriptError(message) ||
    isBenignNavigationAbortError(message)
  );
}

export function shouldDropExceptionEvent(
  properties: Record<string, unknown> | undefined
): boolean {
  const text = extractExceptionMessages(properties);
  return (
    isBenignExceptionMessage(text) ||
    isBraveWalletInjectionError(properties) ||
    isInjectedPageScriptError(properties) ||
    isBenignAdSenseNetworkError(properties) ||
    isOpaqueCrossOriginScriptError(properties)
  );
}

/** Routes where autocapture adds noise without product value. */
const AUTOCAPTURE_BLOCKED_PREFIXES = ["/dashboard", "/api"];

function isAutocaptureBlockedPath(pathname: string): boolean {
  return AUTOCAPTURE_BLOCKED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function shouldDropAutocaptureOnPath(pathname: string, eventName: string): boolean {
  if (eventName !== "$autocapture" && eventName !== "$rageclick" && eventName !== "$dead_click") {
    return false;
  }
  return isAutocaptureBlockedPath(pathname);
}

function resolvePostHogToken(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ||
    undefined
  );
}

export function isPostHogLoaded(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean((posthog as { __loaded?: boolean }).__loaded)
  );
}

function dispatchAnalyticsConsentChange(accepted: boolean): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ANALYTICS_CONSENT_CHANGE_EVENT, { detail: { accepted } })
  );
}

/** Last analytics permission from the privacy manager (lib/privacy). */
let analyticsConsent = false;

/** Re-apply consent after anything that resets PostHog state (e.g. reset()). */
export function reapplyPostHogConsent(): void {
  if (!isPostHogLoaded()) return;
  if (analyticsConsent) {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
  }
}

/**
 * Called only by lib/privacy/integrations.ts. PostHog is initialized on the
 * first grant, so no PostHog request, cookie, or storage exists before
 * analytics permission. A later refusal opts the loaded instance out.
 */
export function setPostHogAnalyticsConsent(accepted: boolean): void {
  analyticsConsent = accepted;
  if (accepted && !isPostHogLoaded()) initPostHogBrowser();
  reapplyPostHogConsent();
  dispatchAnalyticsConsentChange(accepted);
}

/**
 * Initialize PostHog in the browser. Do not call directly: use
 * setPostHogAnalyticsConsent so initialization stays behind consent.
 * - Starts opted out and is opted in only while analytics consent holds.
 * - Session replay uses input/text masking for immigration-sensitive UI.
 * - Server-side PostHog (API routes) is unaffected.
 */
function initPostHogBrowser(): void {
  try {
    const posthogToken = resolvePostHogToken();
    if (!posthogToken || typeof window === "undefined" || isPostHogLoaded()) return;

    posthog.init(posthogToken, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2026-01-30",
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
      opt_out_capturing_by_default: true,
      session_recording: POSTHOG_SESSION_RECORDING,
      before_send: (event) => {
        // Suppress automatic events with signed-link page payloads. Explicit
        // low-cardinality offer events still respect the user's analytics consent.
        if (typeof window !== 'undefined' && isMonitoringCapabilityPage(window.location.href) && event?.event?.startsWith('$')) return null;
        if (event?.properties) event.properties = redactMonitoringAnalytics(event.properties) as typeof event.properties;
        if (
          typeof window !== "undefined" &&
          event?.event &&
          shouldDropAutocaptureOnPath(window.location.pathname, event.event)
        ) {
          return null;
        }
        if (event?.event === "$exception" && shouldDropExceptionEvent(event.properties)) {
          return null;
        }
        return event;
      },
      loaded: () => {
        reapplyPostHogConsent();
      },
    });
  } catch (error) {
    console.warn("Third-party init failed: PostHog", error);
  }
}
