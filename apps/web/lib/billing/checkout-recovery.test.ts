import { describe, expect, it } from "vitest";
import {
  CHECKOUT_RECOVERY_MAX_AGE_MS,
  CHECKOUT_RECOVERY_MIN_AGE_MS,
  getCheckoutRecoveryWindowBounds,
  resolveCheckoutResumeUrl,
} from "./checkout-recovery";

describe("getCheckoutRecoveryWindowBounds", () => {
  const now = Date.parse("2026-06-01T12:00:00.000Z");

  it("uses 2h minimum and 72h maximum age", () => {
    const { minCreatedAt, maxCreatedAt } = getCheckoutRecoveryWindowBounds(now);
    expect(maxCreatedAt).toBe("2026-06-01T10:00:00.000Z");
    expect(minCreatedAt).toBe("2026-05-29T12:00:00.000Z");
  });

  it("exports expected window constants", () => {
    expect(CHECKOUT_RECOVERY_MIN_AGE_MS).toBe(2 * 60 * 60 * 1000);
    expect(CHECKOUT_RECOVERY_MAX_AGE_MS).toBe(72 * 60 * 60 * 1000);
  });
});

describe("resolveCheckoutResumeUrl", () => {
  it("reuses an open Stripe Checkout session URL", () => {
    const result = resolveCheckoutResumeUrl({
      appBaseUrl: "https://www.trackmyopt.com",
      planId: "pro",
      billingInterval: "year",
      stripeSession: {
        status: "open",
        url: "https://checkout.stripe.com/c/pay/cs_test_123",
      },
    });
    expect(result.kind).toBe("open_session");
    expect(result.url).toBe("https://checkout.stripe.com/c/pay/cs_test_123");
  });

  it("falls back to annual Pro checkout when session expired", () => {
    const result = resolveCheckoutResumeUrl({
      appBaseUrl: "https://www.trackmyopt.com/",
      planId: "pro",
      billingInterval: "year",
      stripeSession: { status: "expired", url: null },
    });
    expect(result.kind).toBe("fresh_checkout");
    expect(result.url).toBe(
      "https://www.trackmyopt.com/premium/checkout?planId=pro&interval=year"
    );
  });

  it("defaults interval to year when unknown", () => {
    const result = resolveCheckoutResumeUrl({
      appBaseUrl: "https://www.trackmyopt.com",
      planId: null,
      billingInterval: null,
      stripeSession: null,
    });
    expect(result.url).toContain("interval=year");
    expect(result.url).toContain("planId=pro");
  });
});
