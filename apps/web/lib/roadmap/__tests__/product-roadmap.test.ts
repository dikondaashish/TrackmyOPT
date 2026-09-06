import { describe, expect, it } from "vitest";
import { ROADMAP_PHASES } from "../product-roadmap";

describe("ROADMAP_PHASES", () => {
  it("defines five implementation phases", () => {
    expect(ROADMAP_PHASES).toHaveLength(5);
    expect(ROADMAP_PHASES[0]?.id).toBe(1);
    expect(ROADMAP_PHASES[4]?.status).toBe("in_progress");
  });
});
