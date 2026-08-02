import { describe, expect, it } from "vitest";
import { FREE_H1B_SPONSOR_LIMIT } from "@/lib/career/h1b/constants";
import { FREE_ATS_SCAN_LIMIT } from "@/lib/usage-limit";
import {
  FREE_COVER_LETTERS_MONTHLY_LIMIT,
  FREE_SCREENING_DRAFTS_MONTHLY_LIMIT,
} from "@/lib/ai-generation-limits";
import {
  DEDICATED_PLAN_CARD_FEATURES,
  FREE_ATS_SCAN_LIMIT_DISPLAY,
  FREE_COVER_LETTER_LIMIT_DISPLAY,
  FREE_SCREENING_DRAFT_LIMIT_DISPLAY,
  FREE_PLAN_CARD_FEATURES,
  PLAN_COMPARISON_FEATURES,
  PRO_PLAN_CARD_FEATURES,
  getPlanBullets,
  getPlanCardFeatures,
} from "./plan-features";

describe("plan-features", () => {
  it("comparison grid lists every category with tier columns", () => {
    expect(PLAN_COMPARISON_FEATURES.length).toBeGreaterThanOrEqual(6);
    for (const category of PLAN_COMPARISON_FEATURES) {
      expect(category.category.length).toBeGreaterThan(0);
      expect(category.features.length).toBeGreaterThan(0);
      for (const row of category.features) {
        expect(row.name.length).toBeGreaterThan(0);
        expect(["boolean", "string"]).toContain(typeof row.free);
        expect(["boolean", "string"]).toContain(typeof row.pro);
        expect(["boolean", "string"]).toContain(typeof row.dedicated);
      }
    }
  });

  it("modal card features are non-empty per plan", () => {
    expect(getPlanCardFeatures("free").length).toBeGreaterThan(8);
    expect(getPlanCardFeatures("pro").length).toBeGreaterThan(8);
    expect(getPlanCardFeatures("dedicated").length).toBeGreaterThanOrEqual(4);
  });

  it("settings bullets derive from card features", () => {
    expect(getPlanBullets("free").length).toBe(
      FREE_PLAN_CARD_FEATURES.filter((f) => !f.isHeader).length
    );
    expect(getPlanBullets("pro")[0]).toBe("Everything in Free");
    expect(getPlanBullets("dedicated")[0]).toBe("Everything in Pro");
  });

  it("pro and dedicated include tier upgrade headers", () => {
    expect(PRO_PLAN_CARD_FEATURES[0].text).toMatch(/everything in free/i);
    expect(DEDICATED_PLAN_CARD_FEATURES[0].text).toMatch(/everything in pro/i);
  });

  it("free limits match server-enforced constants", () => {
    expect(FREE_ATS_SCAN_LIMIT_DISPLAY).toBe(FREE_ATS_SCAN_LIMIT);
    expect(FREE_SCREENING_DRAFT_LIMIT_DISPLAY).toBe(
      FREE_SCREENING_DRAFTS_MONTHLY_LIMIT
    );
    expect(FREE_COVER_LETTER_LIMIT_DISPLAY).toBe(
      FREE_COVER_LETTERS_MONTHLY_LIMIT
    );
    const flat = PLAN_COMPARISON_FEATURES.flatMap((c) => c.features);
    expect(flat.some((r) => r.name.includes(String(FREE_H1B_SPONSOR_LIMIT)))).toBe(
      true
    );
    const ats = flat.find((r) => r.name === "ATS Resume Scanner");
    expect(ats?.free).toBe(`${FREE_ATS_SCAN_LIMIT}/mo`);
    expect(flat.some((r) => r.name === "Exclusive Partner Offers")).toBe(false);
    expect(
      FREE_PLAN_CARD_FEATURES.some((f) => /5 Jobs|100 Companies/i.test(f.text))
    ).toBe(false);
  });

  it("marks daily auto-checks as Pro-only", () => {
    const auto = PLAN_COMPARISON_FEATURES.flatMap((c) => c.features).find(
      (r) => r.name === "Daily USCIS Auto-Checks"
    );
    expect(auto?.free).toBe(false);
    expect(auto?.pro).toBe(true);
  });

  it("Dedicated advertises attorney scheduling only, never legal advice", () => {
    const blob = JSON.stringify([
      ...DEDICATED_PLAN_CARD_FEATURES,
      ...getPlanBullets("dedicated"),
    ]).toLowerCase();
    expect(blob).toMatch(/priority email support/);

    // The attorney benefit is real but narrow: we send appointment slots and
    // the subscriber books one. Any mention of an attorney must stay tied to
    // scheduling — TrackMyOPT is not a law firm and provides no legal advice.
    if (blob.includes("attorney")) {
      expect(blob).toMatch(/attorney consultation scheduling/);
    }

    // Claims we do not deliver, and which would make the plan misleading.
    expect(blob).not.toMatch(/legal advice|immigration advice/);
    expect(blob).not.toMatch(/24\/7|1-on-1|unlimited/);
    expect(blob).not.toMatch(/guaranteed|guarantee[d]? (?:appointment|slot|outcome)/);
  });
});
