import posthog from "posthog-js";
import { getStoredCookieConsent } from "@/lib/cookie-consent";
import { ANALYTICS_CONSENT_CHANGE_EVENT } from "@/lib/posthog-client";
import { POSTHOG_SESSION_RECORDING } from "@/lib/posthog/session-replay-privacy";

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
      loaded: () => {
        applyPostHogConsentFromStorage();
      },
    });
  } catch (error) {
    console.warn("Third-party init failed: PostHog", error);
  }
}
