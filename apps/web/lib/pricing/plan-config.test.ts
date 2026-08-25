import { describe, expect, it } from "vitest";
import { DEDICATED_ATTORNEY_BENEFIT, PRO_PAID_INTRO } from "./plan-config";

describe("commercial plan configuration", () => {
  it("defines the once-per-account $0.99 seven-day Pro introduction", () => {
    expect(PRO_PAID_INTRO).toEqual({
      price: 0.99,
      durationDays: 7,
      usesPerAccount: 1,
    });
  });

  it("requires seven continuous Dedicated days before attorney booking", () => {
    expect(DEDICATED_ATTORNEY_BENEFIT.minimumContinuousPlanDays).toBe(7);
  });
});
