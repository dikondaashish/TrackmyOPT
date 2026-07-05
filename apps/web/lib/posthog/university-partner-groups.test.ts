import { describe, expect, it } from "vitest";
import { normalizePartnerGroupKey, toPartnerGroupProperties } from "@/lib/posthog/university-partner-groups";

describe("university-partner-groups", () => {
  it("normalizes referral codes for group keys", () => {
    expect(normalizePartnerGroupKey("NYU-2026!")).toBe("nyu-2026");
    expect(normalizePartnerGroupKey("")).toBe("");
  });

  it("maps referral rows to PostHog group properties", () => {
    expect(
      toPartnerGroupProperties({
        code: "nyu",
        name: "NYU Campus",
        clicks: 10,
        signups: 3,
        premiumConversions: 1,
        isActive: true,
      })
    ).toEqual({
      partner_name: "NYU Campus",
      referral_clicks: 10,
      referral_signups: 3,
      premium_conversions: 1,
      is_active: true,
    });
  });
});
