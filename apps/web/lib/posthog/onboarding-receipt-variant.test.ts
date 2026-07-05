import { describe, expect, it } from "vitest";
import {
  isReceiptStepSkippable,
  normalizeOnboardingReceiptVariant,
  shouldDeferReceiptStep,
} from "@/lib/posthog/onboarding-receipt-variant";

describe("onboarding-receipt-variant", () => {
  it("normalizes known variants", () => {
    expect(normalizeOnboardingReceiptVariant("control")).toBe("control");
    expect(normalizeOnboardingReceiptVariant("deferred")).toBe("deferred");
    expect(normalizeOnboardingReceiptVariant("required")).toBe("required");
  });

  it("falls back to control for unknown values", () => {
    expect(normalizeOnboardingReceiptVariant("test")).toBe("control");
    expect(normalizeOnboardingReceiptVariant(true)).toBe("control");
    expect(normalizeOnboardingReceiptVariant(null)).toBe("control");
  });

  it("gates skip and defer behavior", () => {
    expect(isReceiptStepSkippable("control")).toBe(true);
    expect(isReceiptStepSkippable("deferred")).toBe(true);
    expect(isReceiptStepSkippable("required")).toBe(false);

    expect(shouldDeferReceiptStep("deferred")).toBe(true);
    expect(shouldDeferReceiptStep("control")).toBe(false);
    expect(shouldDeferReceiptStep("required")).toBe(false);
  });
});
