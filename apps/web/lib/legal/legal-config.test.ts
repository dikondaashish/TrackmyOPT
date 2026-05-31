import { describe, expect, it } from "vitest";
import {
  buildCheckoutDisclosures,
  DEDICATED_MONEY_BACK_DAYS,
  LEGAL_FOOTER_LINKS,
  LEGAL_POLICY_VERSIONS,
  PRO_TRIAL_DAYS,
  USCIS_API_DISCLOSURE,
} from "./legal-config";

describe("legal-config", () => {
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

  it("exposes USCIS API disclosure without product endorsement wording", () => {
    expect(USCIS_API_DISCLOSURE).toMatch(/authorized access/i);
    expect(USCIS_API_DISCLOSURE.toLowerCase()).not.toMatch(/uscis approved/);
  });

  it("footer includes security and contact", () => {
    const labels = LEGAL_FOOTER_LINKS.map((l) => l.href);
    expect(labels).toContain("/security");
    expect(labels).toContain("/contact");
  });
});
