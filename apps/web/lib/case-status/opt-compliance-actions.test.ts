import { describe, expect, it } from "vitest";
import { buildOptComplianceActions } from "./opt-compliance-actions";

describe("buildOptComplianceActions", () => {
  it("never invents completed compliance work", () => {
    const actions = buildOptComplianceActions({});
    expect(actions.every((action) => action.status !== "done")).toBe(true);
  });

  it("anchors the STEM annual evaluation to the STEM start date", () => {
    const actions = buildOptComplianceActions({
      stemStartDate: "2026-07-01",
      stemEndDate: "2028-06-30",
    });
    const annual = actions.find((action) => action.id === "stem-annual-evaluation");
    const final = actions.find((action) => action.id === "stem-final-evaluation");

    expect(annual?.dueDate).toBe("2027-07-11");
    expect(final?.dueDate).toBe("2028-07-10");
  });

  it("does not derive employment reporting deadlines from the USCIS filing date", () => {
    const actions = buildOptComplianceActions({ uscisFiledDate: "2026-04-01" });
    const employment = actions.find((action) => action.id === "report-employment-change");
    expect(employment?.dueDate).toBeUndefined();
  });
});
