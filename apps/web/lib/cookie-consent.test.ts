import { afterEach, describe, expect, it } from "vitest";
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_TIMESTAMP_KEY,
  getStoredCookieConsent,
  hasAnalyticsConsent,
  setStoredCookieConsent,
} from "@/lib/cookie-consent";

const realStorage = window.localStorage;

function stubLocalStorage(value: Storage | null) {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value,
  });
}

afterEach(() => {
  stubLocalStorage(realStorage);
  window.localStorage.clear();
});

describe("cookie consent storage", () => {
  it("round-trips a stored choice", () => {
    setStoredCookieConsent("accepted");

    expect(getStoredCookieConsent()).toBe("accepted");
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it("expires a choice older than the retention window", () => {
    const twoYearsAgo = Date.now() - 730 * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    window.localStorage.setItem(COOKIE_CONSENT_TIMESTAMP_KEY, String(twoYearsAgo));

    expect(getStoredCookieConsent()).toBeNull();
    expect(window.localStorage.getItem(COOKIE_CONSENT_KEY)).toBeNull();
  });

  // Privacy modes and embedded webviews expose localStorage as null; reading it
  // directly threw "Cannot read properties of null (reading 'getItem')" and took
  // consent bootstrap (and PostHog init) down with it.
  it("returns null instead of throwing when localStorage is null", () => {
    stubLocalStorage(null);

    expect(() => getStoredCookieConsent()).not.toThrow();
    expect(getStoredCookieConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
    expect(() => setStoredCookieConsent("accepted")).not.toThrow();
  });

  it("survives a storage object whose access throws", () => {
    stubLocalStorage({
      getItem() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
      setItem() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
      removeItem() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    } as unknown as Storage);

    expect(getStoredCookieConsent()).toBeNull();
    expect(() => setStoredCookieConsent("declined")).not.toThrow();
  });
});
