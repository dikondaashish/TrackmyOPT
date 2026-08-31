import { describe, expect, it } from "vitest";
import {
  DEDICATED_ATS_SCAN_LIMIT,
  DEDICATED_RESUME_LIMIT,
  FREE_ATS_SCAN_LIMIT,
  FREE_RESUME_LIMIT,
  canFundResumeAction,
  hasActivePaidResumePlan,
  PRO_ATS_SCAN_LIMIT,
  PRO_RESUME_LIMIT,
  RESUME_GENERATE_CREDIT_COST,
  RESUME_REGENERATE_CREDIT_COST,
  resolveAtsScanLimitForTier,
  resolveResumeLimitForTier,
  resumeEntitlementFromProfile,
} from "@/lib/usage-limit";

describe("resolveResumeLimitForTier", () => {
  it("uses free limit for free / null / unknown (no premium_status bypass)", () => {
    expect(resolveResumeLimitForTier("free")).toBe(FREE_RESUME_LIMIT);
    expect(resolveResumeLimitForTier(null)).toBe(FREE_RESUME_LIMIT);
    expect(resolveResumeLimitForTier("unknown")).toBe(FREE_RESUME_LIMIT);
  });

  it("maps pro and dedicated quotas", () => {
    expect(resolveResumeLimitForTier("pro")).toBe(PRO_RESUME_LIMIT);
    expect(resolveResumeLimitForTier("dedicated")).toBe(DEDICATED_RESUME_LIMIT);
    expect(resolveResumeLimitForTier("PRO")).toBe(PRO_RESUME_LIMIT);
  });
});

describe("hasActivePaidResumePlan", () => {
  it("allows credit top-ups only for active Pro and Dedicated accounts", () => {
    const future = new Date(Date.now() + 60_000).toISOString();

    expect(
      hasActivePaidResumePlan({
        plan_tier: "pro",
        premium_status: true,
        subscription_expires_at: future,
      })
    ).toBe(true);
    expect(
      hasActivePaidResumePlan({
        plan_tier: "dedicated",
        premium_status: true,
        subscription_expires_at: null,
      })
    ).toBe(true);
  });

  it("rejects free, inactive, and expired accounts", () => {
    const past = new Date(Date.now() - 60_000).toISOString();

    expect(hasActivePaidResumePlan({ plan_tier: "free", premium_status: true })).toBe(false);
    expect(hasActivePaidResumePlan({ plan_tier: "pro", premium_status: false })).toBe(false);
    expect(
      hasActivePaidResumePlan({
        plan_tier: "pro",
        premium_status: true,
        subscription_expires_at: past,
      })
    ).toBe(false);
  });
});

describe("resolveAtsScanLimitForTier", () => {
  it("caps free ATS scans", () => {
    expect(resolveAtsScanLimitForTier("free")).toBe(FREE_ATS_SCAN_LIMIT);
  });

  it("gives paid tiers high ATS cap", () => {
    expect(resolveAtsScanLimitForTier("pro")).toBeGreaterThan(FREE_ATS_SCAN_LIMIT);
    expect(resolveAtsScanLimitForTier("dedicated")).toBe(DEDICATED_ATS_SCAN_LIMIT);
    expect(DEDICATED_ATS_SCAN_LIMIT).toBeGreaterThan(PRO_ATS_SCAN_LIMIT);
  });
});

describe("resumeEntitlementFromProfile", () => {
  it("gives the free quota when plan_tier is still pro but the subscription is dead", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(
      resumeEntitlementFromProfile({
        plan_tier: "pro",
        premium_status: false,
      })
    ).toEqual({ tier: "free", limit: FREE_RESUME_LIMIT, canBuyCredits: false });
    expect(
      resumeEntitlementFromProfile({
        plan_tier: "pro",
        premium_status: true,
        subscription_expires_at: past,
      })
    ).toEqual({ tier: "free", limit: FREE_RESUME_LIMIT, canBuyCredits: false });
  });

  it("keeps the dedicated quota only while premium is active", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(
      resumeEntitlementFromProfile({
        plan_tier: "dedicated",
        premium_status: true,
        subscription_expires_at: future,
      })
    ).toEqual({
      tier: "dedicated",
      limit: DEDICATED_RESUME_LIMIT,
      canBuyCredits: true,
    });
  });
});

describe("canFundResumeAction", () => {
  it("uses the same cost math as reserve (usage + cost, leftover credits)", () => {
    expect(canFundResumeAction(49.5, 50, 0, RESUME_GENERATE_CREDIT_COST)).toBe(false);
    expect(canFundResumeAction(49.5, 50, 1, RESUME_GENERATE_CREDIT_COST)).toBe(true);
    expect(canFundResumeAction(50, 50, 0.5, RESUME_REGENERATE_CREDIT_COST)).toBe(true);
    expect(canFundResumeAction(50, 50, 0.5, RESUME_GENERATE_CREDIT_COST)).toBe(false);
    expect(canFundResumeAction(0, 1, 0, RESUME_GENERATE_CREDIT_COST)).toBe(true);
  });
});
