import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  CASE_STATUS_DISCLAIMER,
  EXTENSION_AUTOFILL_SUPPORT_NOTICE,
  LEGAL_FOOTER_LINKS,
  LEGAL_POLICY_VERSIONS,
  RISKY_MARKETING_PHRASES,
  USCIS_API_DISCLOSURE,
} from "./legal-config";

const WEB_ROOT = join(process.cwd());

function collectFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry === "dist") continue;
      collectFiles(full, acc);
    } else if (/\.(tsx|ts)$/.test(entry) && !entry.endsWith(".test.ts") && !entry.endsWith(".test.tsx")) {
      acc.push(full);
    }
  }
  return acc;
}

/** Public marketing surfaces to scan for risky phrases. */
const MARKETING_SCAN_ROOTS = [
  "app/features",
  "app/how-it-works",
  "app/pricing",
  "components/landing",
  "components/features",
  "components/pricing",
  "lib/notifications",
].map((p) => join(WEB_ROOT, p));

describe("marketing copy compliance scan", () => {
  it("USCIS_API_DISCLOSURE does not imply product USCIS approval", () => {
    const lower = USCIS_API_DISCLOSURE.toLowerCase();
    expect(lower).not.toContain("uscis approved");
    expect(lower).not.toContain("authorized access");
    expect(lower).toContain("uscis case status api access");
    expect(lower).toContain("not affiliated");
  });

  it("footer links include required legal pages", () => {
    const hrefs = LEGAL_FOOTER_LINKS.map((l) => l.href);
    expect(hrefs).toContain("/privacy");
    expect(hrefs).toContain("/terms");
    expect(hrefs).toContain("/refund-policy");
    expect(hrefs).toContain("/disclaimer");
    expect(hrefs).toContain("/cookie-policy");
    expect(hrefs).toContain("/security");
    expect(hrefs).toContain("/contact");
  });

  it("legal config seeds all policy version keys", () => {
    const required: (keyof typeof LEGAL_POLICY_VERSIONS)[] = [
      "privacy_policy",
      "terms_of_service",
      "refund_policy",
      "disclaimer",
      "cookie_policy",
      "subscription_billing_terms",
      "security_page",
    ];
    for (const key of required) {
      expect(LEGAL_POLICY_VERSIONS[key]).toBeTruthy();
    }
  });

  it("public marketing files avoid risky phrases", () => {
    const files: string[] = [];
    for (const root of MARKETING_SCAN_ROOTS) {
      try {
        collectFiles(root, files);
      } catch {
        // path may not exist in all test environments
      }
    }

    const violations: string[] = [];
    for (const file of files) {
      const content = readFileSync(file, "utf8").toLowerCase();
      for (const phrase of RISKY_MARKETING_PHRASES) {
        if (content.includes(phrase)) {
          violations.push(`${file}: "${phrase}"`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("privacy page includes attorney-required clauses", () => {
    const privacy = readFileSync(join(WEB_ROOT, "app/privacy/page.tsx"), "utf8").toLowerCase();
    expect(privacy).toContain("inactive for 24 months");
    expect(privacy).toContain("merger, acquisition");
    expect(privacy).toContain("security breach");
    expect(privacy).toContain("request opt-out");
    expect(privacy).toContain("extension_autofill_support_notice");
    expect(privacy).not.toContain("features that remain unavailable");
    expect(EXTENSION_AUTOFILL_SUPPORT_NOTICE).toContain("Guided Autopilot");
    expect(EXTENSION_AUTOFILL_SUPPORT_NOTICE).toContain("never submits");
  });

  it("pricing FAQ does not claim encrypted end-to-end", () => {
    const pricing = readFileSync(
      join(WEB_ROOT, "components/pricing/PricingData.ts"),
      "utf8"
    ).toLowerCase();
    expect(pricing).not.toContain("encrypted end-to-end");
    expect(pricing).toContain("pci dss level 1");
  });

  it("case-status disclaimer constant is unchanged", () => {
    expect(CASE_STATUS_DISCLAIMER).toContain(
      "Always verify important updates through official USCIS channels"
    );
  });
});
