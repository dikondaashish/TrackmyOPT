import { describe, expect, it } from "vitest";
import {
  DEDICATED_PLAN_CARD_FEATURES,
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
    expect(getPlanCardFeatures("dedicated").length).toBeGreaterThan(4);
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
});
