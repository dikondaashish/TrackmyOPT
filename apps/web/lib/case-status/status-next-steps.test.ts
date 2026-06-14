import { describe, expect, it } from "vitest";
import { getStatusNextSteps } from "./status-next-steps";

describe("getStatusNextSteps", () => {
  it("routes approved cases to OPT dates", () => {
    const steps = getStatusNextSteps("approved", 30);
    expect(steps[0]?.href).toBe("/dashboard/opt-dates");
  });

  it("routes RFE cases to documents", () => {
    const steps = getStatusNextSteps("rfe", 10);
    expect(steps.some((s) => s.href === "/dashboard/documents")).toBe(true);
  });

  it("adds processing time link for long pending waits", () => {
    const steps = getStatusNextSteps("pending", 60);
    expect(steps.some((s) => s.external && s.href.includes("processing-times"))).toBe(
      true
    );
  });
});
