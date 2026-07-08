import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  isBrowserPostHogReady,
} from "@/lib/posthog-client";

type CaptureFn = () => void;

const POSTHOG_READY_POLL_MS = 100;
const POSTHOG_READY_MAX_ATTEMPTS = 50;

/**
 * Fire a PostHog client capture once analytics consent is granted and PostHog is ready.
 * Retries briefly when consent exists but posthog-js has not finished initializing.
 */
export function captureOnceWhenConsented(capture: CaptureFn): () => void {
  if (typeof window === "undefined") return () => {};

  let done = false;
  let pollTimer: ReturnType<typeof setTimeout> | null = null;
  let attempts = 0;

  const tryCapture = (): boolean => {
    if (done) return true;
    if (!hasAnalyticsConsent()) return false;
    if (!isBrowserPostHogReady()) return false;
    done = true;
    capture();
    return true;
  };

  const scheduleRetry = () => {
    if (done || attempts >= POSTHOG_READY_MAX_ATTEMPTS) return;
    attempts += 1;
    pollTimer = setTimeout(() => {
      if (!tryCapture()) scheduleRetry();
    }, POSTHOG_READY_POLL_MS);
  };

  const run = () => {
    if (!tryCapture()) scheduleRetry();
  };

  run();

  const onConsent = (event: Event) => {
    const accepted = (event as CustomEvent<{ accepted: boolean }>).detail?.accepted;
    if (accepted) run();
  };

  window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onConsent);
  return () => {
    window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onConsent);
    if (pollTimer) clearTimeout(pollTimer);
  };
}
