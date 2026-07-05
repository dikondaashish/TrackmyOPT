import { describe, expect, it } from "vitest";
import { daysSinceSignupDate, isActivatedUser } from "@/lib/posthog/activation";

describe("activation helpers", () => {
  it("computes days since signup date", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(daysSinceSignupDate(today)).toBe(0);
    expect(daysSinceSignupDate("invalid")).toBeNull();
    expect(daysSinceSignupDate(null)).toBeNull();
  });

  it("requires onboarding, receipt, and status for activation", () => {
    expect(
      isActivatedUser({
        onboardingCompleted: true,
        hasReceipt: true,
        hasStatus: true,
      })
    ).toBe(true);

    expect(
      isActivatedUser({
        onboardingCompleted: false,
        hasReceipt: true,
        hasStatus: true,
      })
    ).toBe(false);

    expect(
      isActivatedUser({
        onboardingCompleted: true,
        hasReceipt: false,
        hasStatus: true,
      })
    ).toBe(false);
  });
});
