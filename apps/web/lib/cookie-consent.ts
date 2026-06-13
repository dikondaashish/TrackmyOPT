/** Shared cookie / analytics consent storage (browser only). */

export const COOKIE_CONSENT_KEY = "trackmyopt_cookie_consent";
export const COOKIE_CONSENT_TIMESTAMP_KEY = "trackmyopt_cookie_consent_ts";
export const COOKIE_CONSENT_EXPIRY_DAYS = 365;

export type CookieConsentStatus = "accepted" | "declined" | null;

export function getStoredCookieConsent(): CookieConsentStatus {
  if (typeof window === "undefined") return null;
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY) as CookieConsentStatus;
  const timestamp = localStorage.getItem(COOKIE_CONSENT_TIMESTAMP_KEY);
  if (!consent || !timestamp) return null;

  const expiryMs = COOKIE_CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  if (Date.now() - parseInt(timestamp, 10) > expiryMs) {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_CONSENT_TIMESTAMP_KEY);
    return null;
  }
  return consent;
}

export function setStoredCookieConsent(status: "accepted" | "declined"): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, status);
  localStorage.setItem(COOKIE_CONSENT_TIMESTAMP_KEY, Date.now().toString());
}

/** Accept All = product analytics (PostHog) + advertising (AdSense). */
export function hasAnalyticsConsent(): boolean {
  return getStoredCookieConsent() === "accepted";
}
