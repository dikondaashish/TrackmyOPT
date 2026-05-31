import { describe, expect, it } from "vitest";
import { getPoliciesNeedingConsent } from "./policy-consent";

describe("getPoliciesNeedingConsent", () => {
  const versions = [
    {
      policy_type: "privacy_policy",
      current_version: "2026-05-31",
      requires_consent: true,
      change_summary: null,
      effective_date: "2026-05-31",
    },
    {
      policy_type: "cookie_policy",
      current_version: "2026-05-31",
      requires_consent: false,
      change_summary: null,
      effective_date: "2026-05-31",
    },
    {
      policy_type: "terms_of_service",
      current_version: "2026-05-31",
      requires_consent: true,
      change_summary: null,
      effective_date: "2026-05-31",
    },
  ];

  it("returns policies with requires_consent missing user consent", () => {
    const pending = getPoliciesNeedingConsent(versions, [
      { policy_type: "privacy_policy", policy_version: "2026-05-31" },
    ]);
    expect(pending.map((p) => p.type)).toEqual(["terms_of_service"]);
  });

  it("returns empty when all required consents exist", () => {
    const pending = getPoliciesNeedingConsent(versions, [
      { policy_type: "privacy_policy", policy_version: "2026-05-31" },
      { policy_type: "terms_of_service", policy_version: "2026-05-31" },
    ]);
    expect(pending).toEqual([]);
  });

  it("ignores cookie_policy when requires_consent is false", () => {
    const pending = getPoliciesNeedingConsent(versions, []);
    expect(pending.some((p) => p.type === "cookie_policy")).toBe(false);
  });
});
