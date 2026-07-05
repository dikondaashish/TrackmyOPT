import { describe, expect, it, vi, beforeEach } from "vitest";

const captureMock = vi.fn();
const identifyMock = vi.fn();
const resetMock = vi.fn();

vi.mock("posthog-js", () => ({
  default: {
    capture: (...args: unknown[]) => captureMock(...args),
    identify: (...args: unknown[]) => identifyMock(...args),
    reset: (...args: unknown[]) => resetMock(...args),
  },
}));

import {
  captureUserSignedIn,
  captureUserSignedUp,
  captureSignOut,
  identifyLoginSessionUser,
} from "./posthog-client";

describe("posthog-client auth helpers", () => {
  beforeEach(() => {
    captureMock.mockClear();
    identifyMock.mockClear();
    resetMock.mockClear();
  });

  it("identifyLoginSessionUser sets activation_state and signup_date", () => {
    identifyLoginSessionUser({
      id: "user-1",
      created_at: "2026-06-15T12:00:00.000Z",
      app_metadata: { provider: "google" },
    });

    expect(identifyMock).toHaveBeenCalledWith("user-1", {
      plan_tier: "free",
      premium_status: false,
      onboarding_completed: false,
      is_stem_eligible: false,
      activation_state: "onboarding_incomplete",
      signup_date: "2026-06-15",
      provider: "google",
    });
  });

  it("captureUserSignedUp includes capture_source", () => {
    captureUserSignedUp({ provider: "email", referred_by: "ref123" });
    expect(captureMock).toHaveBeenCalledWith(
      "user_signed_up",
      expect.objectContaining({
        capture_source: "client",
        provider: "email",
        referred_by: "ref123",
      })
    );
  });

  it("captureUserSignedIn includes capture_source", () => {
    captureUserSignedIn({ provider: "email" });
    expect(captureMock).toHaveBeenCalledWith(
      "user_signed_in",
      expect.objectContaining({
        capture_source: "client",
        provider: "email",
      })
    );
  });

  it("captureSignOut includes capture_source and resets identity", async () => {
    vi.useFakeTimers();
    const signOutPromise = captureSignOut("sidebar");
    await vi.runAllTimersAsync();
    await signOutPromise;
    vi.useRealTimers();

    expect(captureMock).toHaveBeenCalledWith(
      "user_signed_out",
      expect.objectContaining({
        capture_source: "client",
        source: "sidebar",
      })
    );
    expect(resetMock).toHaveBeenCalled();
  });
});
