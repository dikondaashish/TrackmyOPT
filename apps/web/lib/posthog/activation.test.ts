import { describe, expect, it } from "vitest";
import {
  daysSinceSignupDate,
  hasSuccessfulCaseCheck,
  isActivatedUser,
  isWithinActivationWindow,
  resolveActivationState,
  ACTIVATION_WINDOW_HOURS,
} from "@/lib/posthog/activation";

describe("activation helpers", () => {
  it("computes days since signup date", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(daysSinceSignupDate(today)).toBe(0);
    expect(daysSinceSignupDate("invalid")).toBeNull();
    expect(daysSinceSignupDate(null)).toBeNull();
  });

  it("Phase 4: activates on receipt + successful check (no onboarding required)", () => {
    expect(
      isActivatedUser({
        hasReceipt: true,
        hasSuccessfulCheck: true,
        onboardingCompleted: false,
      })
    ).toBe(true);

    expect(
      isActivatedUser({
        hasReceipt: false,
        hasSuccessfulCheck: true,
      })
    ).toBe(false);

    expect(
      isActivatedUser({
        hasReceipt: true,
        hasSuccessfulCheck: false,
      })
    ).toBe(false);
  });

  it("detects successful case checks", () => {
    expect(
      hasSuccessfulCaseCheck({
        last_checked_at: new Date().toISOString(),
        current_status: "Case Was Received",
      })
    ).toBe(true);
    expect(
      hasSuccessfulCaseCheck({
        last_checked_at: new Date().toISOString(),
        current_status: "Status will be fetched shortly...",
      })
    ).toBe(false);
    expect(hasSuccessfulCaseCheck(null)).toBe(false);
  });

  it("measures the 24h activation window from signup", () => {
    const now = Date.now();
    expect(
      isWithinActivationWindow(new Date(now - 60 * 60 * 1000).toISOString(), now)
    ).toBe(true);
    expect(
      isWithinActivationWindow(
        new Date(now - (ACTIVATION_WINDOW_HOURS + 1) * 60 * 60 * 1000).toISOString(),
        now
      )
    ).toBe(false);
  });

  it("resolveActivationState ignores onboarding", () => {
    expect(
      resolveActivationState({ hasReceipt: false, hasSuccessfulCheck: false })
    ).toBe("no_receipt");
    expect(
      resolveActivationState({ hasReceipt: true, hasSuccessfulCheck: false })
    ).toBe("receipt_pending_status");
    expect(
      resolveActivationState({ hasReceipt: true, hasSuccessfulCheck: true })
    ).toBe("activated");
  });
});
