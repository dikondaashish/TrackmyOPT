/** Shared cookie / analytics consent storage (browser only). */

import {
  safeStorageGet,
  safeStorageRemove,
  safeStorageSet,
} from "@/lib/safe-storage";

export const COOKIE_CONSENT_KEY = "trackmyopt_cookie_consent";
export const COOKIE_CONSENT_TIMESTAMP_KEY = "trackmyopt_cookie_consent_ts";
const COOKIE_CONSENT_EXPIRY_DAYS = 365;
export const OPEN_PRIVACY_CHOICES_EVENT = "trackmyopt:open-privacy-choices";

export type CookieConsentStatus = "accepted" | "declined" | null;

export function getStoredCookieConsent(): CookieConsentStatus {
  const consent = safeStorageGet(COOKIE_CONSENT_KEY) as CookieConsentStatus;
  const timestamp = safeStorageGet(COOKIE_CONSENT_TIMESTAMP_KEY);
  if (!consent || !timestamp) return null;

  const expiryMs = COOKIE_CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  if (Date.now() - parseInt(timestamp, 10) > expiryMs) {
    safeStorageRemove(COOKIE_CONSENT_KEY);
    safeStorageRemove(COOKIE_CONSENT_TIMESTAMP_KEY);
    return null;
  }
  return consent;
}

/**
 * Storage is unavailable in privacy modes and embedded webviews. The banner
 * still applies the choice for this session; it just cannot be remembered.
 */
export function setStoredCookieConsent(status: "accepted" | "declined"): void {
  if (!safeStorageSet(COOKIE_CONSENT_KEY, status)) return;
  safeStorageSet(COOKIE_CONSENT_TIMESTAMP_KEY, Date.now().toString());
}

/** Accept All = product analytics (PostHog) + advertising (AdSense). */
export function hasAnalyticsConsent(): boolean {
  return getStoredCookieConsent() === "accepted";
}

/** Reopen the consent panel from footer links, profile menu, etc. */
export function requestOpenPrivacyChoices(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_PRIVACY_CHOICES_EVENT));
}
