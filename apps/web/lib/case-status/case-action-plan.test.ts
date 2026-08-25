import { describe, expect, it } from "vitest";
import { buildCaseActionPlan } from "./case-action-plan";

describe("buildCaseActionPlan", () => {
  it("makes an RFE the single urgent priority", () => {
    const plan = buildCaseActionPlan({
      statusText: "Request for Evidence Was Sent",
      daysSinceFiled: 60,
    });

    expect(plan.priority).toBe("urgent");
    expect(plan.title).toMatch(/response/i);
    expect(plan.actions[0]?.href).toBe("/dashboard/documents");
    expect(plan.officialSource.href).toContain("uscis.gov");
  });

  it("does not promise an approval date for a pending case", () => {
    const plan = buildCaseActionPlan({
      statusText: "Case Is Being Actively Reviewed By USCIS",
      daysSinceFiled: 80,
    });

    expect(plan.priority).toBe("monitor");
    expect(`${plan.title} ${plan.summary}`).not.toMatch(/will be approved|approval date/i);
    expect(plan.actions.some((action) => action.href.includes("processing-times"))).toBe(true);
  });

  it("routes approved OPT users to dates and document storage", () => {
    const plan = buildCaseActionPlan({
      statusText: "Case Was Approved",
      daysSinceFiled: 35,
    });

    expect(plan.priority).toBe("complete");
    expect(plan.actions.map((action) => action.href)).toEqual(
      expect.arrayContaining(["/dashboard/opt-dates", "/dashboard/documents"])
    );
  });
});
