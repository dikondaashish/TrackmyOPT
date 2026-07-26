import { describe, expect, it } from "vitest";
import {
  buildCheckoutDisclosures,
  CASE_STATUS_DISCLAIMER,
  DEDICATED_MONEY_BACK_DAYS,
  getPricingModalDedicatedConsentLabel,
  getPricingModalProConsentLabel,
  LEGAL_FOOTER_LINKS,
  LEGAL_POLICY_VERSIONS,
  PRIVACY_CHOICES_VERSION_ID,
  formatPolicyVersionLabel,
  PLAN_DISPLAY_PRICES,
  PRO_TRIAL_DAYS,
  USCIS_API_DISCLOSURE,
} from "./legal-config";

describe("legal-config", () => {

  it("dates the attorney-reviewed privacy choices disclosures independently", () => {
    expect(LEGAL_POLICY_VERSIONS.privacy_policy).toBe(
      PRIVACY_CHOICES_VERSION_ID
    );
    expect(LEGAL_POLICY_VERSIONS.cookie_policy).toBe(
      PRIVACY_CHOICES_VERSION_ID
    );
    expect(formatPolicyVersionLabel("cookie_policy")).toContain(
      "July 26, 2026"
    );
  });

  it("uses consistent policy version ids", () => {
    expect(LEGAL_POLICY_VERSIONS.refund_policy).toBe(LEGAL_POLICY_VERSIONS.terms_of_service);
  });

  it("builds pro trial disclosures", () => {
    const d = buildCheckoutDisclosures({
      planId: "pro",
      interval: "year",
      includeProTrial: true,
    });
    expect(d.headline).toContain("auto-renewing");
    expect(d.trialLine).toContain(String(PRO_TRIAL_DAYS));
    expect(d.consentLabel).toContain("Privacy Policy");
  });

  it("builds dedicated disclosures with money-back note", () => {
    const d = buildCheckoutDisclosures({
      planId: "dedicated",
      interval: "month",
      includeProTrial: false,
    });
    expect(d.dedicatedRefundLine).toContain(String(DEDICATED_MONEY_BACK_DAYS));
    expect(d.trialLine).toBeNull();
    expect(d.consentLabel).toContain("Refund Policy");
    expect(d.consentLabel).toContain("Privacy Policy");
  });

  it("exposes USCIS API disclosure without authorized-access or endorsement wording", () => {
    const lower = USCIS_API_DISCLOSURE.toLowerCase();
    expect(lower).not.toContain("authorized access");
    expect(lower).not.toMatch(/uscis approved/);
    expect(lower).toContain("uscis case status api access");
    expect(lower).toContain("not affiliated");
  });

  it("case-status disclaimer matches attorney-approved wording", () => {
    expect(CASE_STATUS_DISCLAIMER).toContain(
      "Case status information is provided for convenience"
    );
    expect(CASE_STATUS_DISCLAIMER).toContain("licensed immigration attorney");
  });

  it("footer includes security and contact", () => {
    const labels = LEGAL_FOOTER_LINKS.map((l) => l.href);
    expect(labels).toContain("/security");
    expect(labels).toContain("/contact");
  });

  it("pricing modal Pro consent mentions trial, renews, and cancel", () => {
    const label = getPricingModalProConsentLabel({
      interval: "month",
      monthlyPrice: PLAN_DISPLAY_PRICES.pro.month,
      yearlyPrice: PLAN_DISPLAY_PRICES.pro.year,
      includeTrial: true,
    });
    expect(label).toContain("7-day free trial");
    expect(label).toContain("renews");
    expect(label).toContain("unless I cancel");
    expect(label).not.toContain("auto-converts");
  });

  it("pricing modal Pro annual consent uses yearly price", () => {
    const label = getPricingModalProConsentLabel({
      interval: "year",
      monthlyPrice: PLAN_DISPLAY_PRICES.pro.month,
      yearlyPrice: PLAN_DISPLAY_PRICES.pro.year,
      includeTrial: true,
    });
    expect(label).toContain("/year");
    expect(label).toContain("$49.99/year");
  });

  it("pricing modal Dedicated consent discloses charge today and money-back scope", () => {
    const monthly = getPricingModalDedicatedConsentLabel({
      interval: "month",
      monthlyPrice: PLAN_DISPLAY_PRICES.dedicated.month,
      yearlyPrice: PLAN_DISPLAY_PRICES.dedicated.year,
    });
    expect(monthly).toContain("charged today");
    expect(monthly).toContain("renews monthly");
    expect(monthly).toContain("3-day money-back guarantee");
    expect(monthly).toContain("first paid month");
    expect(monthly).not.toContain("then $");

    const annual = getPricingModalDedicatedConsentLabel({
      interval: "year",
      monthlyPrice: PLAN_DISPLAY_PRICES.dedicated.month,
      yearlyPrice: PLAN_DISPLAY_PRICES.dedicated.year,
    });
    expect(annual).toContain("charged today");
    expect(annual).toContain("renews annually");
    expect(annual).toContain("first paid term");
  });
});
