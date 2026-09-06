import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RISKY_MARKETING_PHRASES } from "@/lib/legal/legal-config";

const WEB_ROOT = join(process.cwd());
const PRICING_MODAL_PATHS = [
  join(WEB_ROOT, "components/pricing/PricingModal.tsx"),
  join(WEB_ROOT, "components/pricing/PricingModalBenefitTicker.tsx"),
  join(WEB_ROOT, "components/pricing/PricingModalPlanCard.tsx"),
  join(WEB_ROOT, "components/pricing/PricingModalBillingToggle.tsx"),
  join(WEB_ROOT, "components/pricing/PricingModalTrustFooter.tsx"),
] as const;
const PLAN_FEATURES_PATH = join(WEB_ROOT, "lib/pricing/plan-features.ts");

const PRICING_UI_BLOCKED = [
  ...RISKY_MARKETING_PHRASES,
  "instant status change alerts",
  "personalized strategy plan",
  "auto-converts",
  "3-day money-back period applies, then",
] as const;

function readPricingModalTree(): string {
  return PRICING_MODAL_PATHS.map((path) => readFileSync(path, "utf8")).join("\n");
}

describe("pricing modal copy compliance", () => {
  it("pricing UI avoids blocked marketing phrases", () => {
    const content = [readPricingModalTree(), readFileSync(PLAN_FEATURES_PATH, "utf8")]
      .join("\n")
      .toLowerCase();
    const violations: string[] = [];
    for (const phrase of PRICING_UI_BLOCKED) {
      if (content.includes(phrase)) {
        violations.push(phrase);
      }
    }
    expect(violations).toEqual([]);
  });

  it("plan features include safer labels", () => {
    const content = readFileSync(PLAN_FEATURES_PATH, "utf8");
    expect(content).toContain("Daily Status Change Alerts");
    expect(content).toContain("Personalized support plan");
    expect(content).toContain("Daily USCIS Auto-Checks");
    expect(content).not.toContain("Application Completeness Check");
  });

  it("PricingModal links Terms, Privacy, and Refund Policy near consent", () => {
    const content = readPricingModalTree();
    expect(content).toContain('href="/terms"');
    expect(content).toContain('href="/privacy"');
    expect(content).toContain('href="/refund-policy"');
    expect(content).toContain("By continuing, you agree");
  });

  it("PricingModal still gates checkout on consent and recurringBillingAccepted", () => {
    const content = readPricingModalTree();
    expect(content).toContain("!proConsent");
    expect(content).toContain("!dedicatedConsent");
    expect(content).toContain("recurringBillingAccepted: true");
    expect(content).toContain("/api/premium/create-checkout");
  });
});
