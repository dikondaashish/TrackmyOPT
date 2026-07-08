import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const consentState = vi.hoisted(() => ({ accepted: false, posthogReady: false }));

vi.mock("@/lib/cookie-consent", () => ({
  hasAnalyticsConsent: () => consentState.accepted,
}));

vi.mock("@/lib/posthog-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/posthog-client")>();
  return {
    ...actual,
    isBrowserPostHogReady: () => consentState.posthogReady,
  };
});

import { captureOnceWhenConsented } from "@/lib/posthog/capture-with-consent";

describe("captureOnceWhenConsented", () => {
  beforeEach(() => {
    consentState.accepted = false;
    consentState.posthogReady = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not capture without consent", () => {
    const capture = vi.fn();
    captureOnceWhenConsented(capture);
    expect(capture).not.toHaveBeenCalled();
  });

  it("retries until PostHog is ready after consent", () => {
    vi.useFakeTimers();
    const capture = vi.fn();

    captureOnceWhenConsented(capture);
    expect(capture).not.toHaveBeenCalled();

    consentState.accepted = true;
    consentState.posthogReady = false;
    vi.advanceTimersByTime(500);
    expect(capture).not.toHaveBeenCalled();

    consentState.posthogReady = true;
    vi.advanceTimersByTime(200);
    expect(capture).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);
    expect(capture).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("captures immediately when consent and PostHog are ready", () => {
    consentState.accepted = true;
    consentState.posthogReady = true;
    const capture = vi.fn();

    captureOnceWhenConsented(capture);
    expect(capture).toHaveBeenCalledTimes(1);
  });
});
