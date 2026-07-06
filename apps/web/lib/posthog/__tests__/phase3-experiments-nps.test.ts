import { describe, expect, it } from "vitest";
import {
  getPricingCtaCopy,
  normalizePricingCtaVariant,
} from "@/lib/posthog/pricing-cta-experiment";
import {
  isAccountOldEnough,
  isWithinNpsCooldown,
  resolveNpsCategory,
} from "@/lib/posthog/nps-survey";

describe("pricing-cta-experiment", () => {
  it("normalizes known variants", () => {
    expect(normalizePricingCtaVariant("control")).toBe("control");
    expect(normalizePricingCtaVariant("urgency")).toBe("urgency");
  });

  it("falls back to control for unknown values", () => {
    expect(normalizePricingCtaVariant("test")).toBe("control");
    expect(normalizePricingCtaVariant(null)).toBe("control");
  });

  it("returns copy per variant", () => {
    expect(getPricingCtaCopy("control")).toBe("Start 7-Day Free Trial");
    expect(getPricingCtaCopy("urgency")).toBe(
      "Start tracking before your deadline"
    );
  });
});

describe("nps-survey helpers", () => {
  it("maps score to NPS category", () => {
    expect(resolveNpsCategory(0)).toBe("detractor");
    expect(resolveNpsCategory(6)).toBe("detractor");
    expect(resolveNpsCategory(7)).toBe("passive");
    expect(resolveNpsCategory(8)).toBe("passive");
    expect(resolveNpsCategory(9)).toBe("promoter");
    expect(resolveNpsCategory(10)).toBe("promoter");
  });

  it("checks account age", () => {
    const old = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
    const young = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(isAccountOldEnough(old, 14)).toBe(true);
    expect(isAccountOldEnough(young, 14)).toBe(false);
  });

  it("respects cooldown window", () => {
    const recent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const stale = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
    expect(isWithinNpsCooldown(recent, 90)).toBe(true);
    expect(isWithinNpsCooldown(stale, 90)).toBe(false);
    expect(isWithinNpsCooldown(null, 90)).toBe(false);
  });
});
