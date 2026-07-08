import posthog from "posthog-js";
import { getStoredCookieConsent } from "@/lib/cookie-consent";
import { ANALYTICS_CONSENT_CHANGE_EVENT } from "@/lib/posthog-client";
import { POSTHOG_SESSION_RECORDING } from "@/lib/posthog/session-replay-privacy";

/** Benign React DOM teardown races (fast navigation, extensions, portal cleanup). */
export function isBenignReactDomTeardownError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("removechild") &&
    (lower.includes("null") ||
      lower.includes("undefined") ||
      lower.includes("not an object"))
  );
}

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

/** Pull exception text from every shape posthog-js may emit. */
export function extractExceptionMessages(
  properties: Record<string, unknown> | undefined
): string {
  if (!properties) return "";

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

  return parts.join(" ");
}

export function shouldDropExceptionEvent(
  properties: Record<string, unknown> | undefined
): boolean {
  const text = extractExceptionMessages(properties);
  return (
    isBenignReactDomTeardownError(text) || isBenignWebSocketError(text)
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

function isPostHogReady(): boolean {
  return typeof window !== "undefined" && typeof posthog?.capture === "function";
}

function dispatchAnalyticsConsentChange(accepted: boolean): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ANALYTICS_CONSENT_CHANGE_EVENT, { detail: { accepted } })
  );
}

/** Apply stored banner choice to PostHog (client-only). */
export function applyPostHogConsentFromStorage(): void {
  if (!isPostHogReady()) return;
  const consent = getStoredCookieConsent();
  if (consent === "accepted") {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
  }
}

export function setPostHogAnalyticsConsent(accepted: boolean): void {
  if (!isPostHogReady()) return;
  if (accepted) {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
  }
  dispatchAnalyticsConsentChange(accepted);
}

/**
 * Initialize PostHog in the browser.
 * - Opted out until user chooses Accept All (product analytics consent).
 * - Session replay uses input/text masking for immigration-sensitive UI.
 * - Server-side PostHog (API routes) is unaffected.
 */
export function initPostHogBrowser(): void {
  try {
    const posthogToken = resolvePostHogToken();
    if (!posthogToken || typeof window === "undefined") return;

    const alreadyLoaded = Boolean((posthog as { __loaded?: boolean }).__loaded);
    if (alreadyLoaded) {
      applyPostHogConsentFromStorage();
      return;
    }

    posthog.init(posthogToken, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2026-01-30",
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
      opt_out_capturing_by_default: true,
      session_recording: POSTHOG_SESSION_RECORDING,
      before_send: (event) => {
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
        applyPostHogConsentFromStorage();
      },
    });
  } catch (error) {
    console.warn("Third-party init failed: PostHog", error);
  }
}
