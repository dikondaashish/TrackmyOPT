import { describe, expect, it } from "vitest";
import { getCaseTrackingLimit, caseLimitMessage } from "../case-limits";
import { pickPrimaryCase } from "../select-primary-case";

describe("case-limits", () => {
  it("returns higher limit for Pro", () => {
    expect(getCaseTrackingLimit(false)).toBe(1);
    expect(getCaseTrackingLimit(true)).toBe(8);
  });

  it("caseLimitMessage mentions upgrade for free", () => {
    expect(caseLimitMessage(false)).toContain("Upgrade");
  });
});

describe("pickPrimaryCase", () => {
  it("prefers is_primary flag", () => {
    const picked = pickPrimaryCase([
      { id: "a", is_primary: false, created_at: "2026-01-01" },
      { id: "b", is_primary: true, created_at: "2026-02-01" },
    ]);
    expect(picked?.id).toBe("b");
  });
});
