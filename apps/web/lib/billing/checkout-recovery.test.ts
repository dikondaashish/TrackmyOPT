import { describe, expect, it } from "vitest";
import {
  CHECKOUT_RECOVERY_MAX_AGE_MS,
  CHECKOUT_RECOVERY_MIN_AGE_MS,
  getCheckoutRecoveryWindowBounds,
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
