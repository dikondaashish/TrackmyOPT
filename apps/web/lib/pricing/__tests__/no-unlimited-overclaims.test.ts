import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { PRO_ATS_SCAN_LIMIT } from "@/lib/usage-limit";
import { PRO_RESUME_LIMIT } from "@/lib/usage-limit";

/**
 * plan-features.ts is the single source of truth for pricing copy, but two
 * marketing pages hardcode their own numbers instead of importing it:
 * PricingComparison.tsx (rendered on /pricing) and premium-worth-it/page.tsx.
 * Both previously said "Unlimited AI resume generation and ATS scanning" or
 * "Unlimited" ATS scans, when the server caps Pro at PRO_RESUME_LIMIT/mo
 * resumes and PRO_ATS_SCAN_LIMIT/mo scans. A customer disputing a charge can
 * point at that gap between advertised and delivered.
 *
 * This does not re-check plan-features.ts itself — see the "Pro ATS scan cap"
 * test in plan-features.test.ts for that. It only guards the two files that
 * do not import from plan-features and could drift back independently.
 */
const ROOT = path.join(process.cwd());
const CHECKED_FILES = [
  "components/pricing/PricingComparison.tsx",
  "app/premium-worth-it/page.tsx",
];

describe("marketing copy never overclaims Pro's real caps", () => {
  for (const relativePath of CHECKED_FILES) {
    it(`${relativePath} does not say resume generation or ATS scanning is unlimited`, () => {
      const content = fs.readFileSync(path.join(ROOT, relativePath), "utf8").toLowerCase();

      // "unlimited" is fine elsewhere in this codebase (H-1B sponsor browsing
      // has no cap), so this checks the specific overclaim rather than
      // banning the word outright.
      expect(content).not.toMatch(/unlimited (ai )?resume generation/);
      expect(content).not.toMatch(/unlimited ats scan/);
      expect(content).not.toMatch(/ats (resume )?scanner[^a-z]*unlimited/);
    });
  }

  it("the real Pro caps used in this test are the server-enforced ones", () => {
    // Sanity check so the numbers in this file's own comment cannot drift
    // silently from the constants that actually gate usage.
    expect(PRO_RESUME_LIMIT).toBe(500);
    expect(PRO_ATS_SCAN_LIMIT).toBe(10_000);
  });
});
