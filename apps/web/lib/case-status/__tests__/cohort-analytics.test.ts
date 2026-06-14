import { describe, expect, it } from "vitest";
import {
  categorizeStatus,
  computeCohortAnalytics,
  type CohortCase,
} from "../cohort-analytics";

function mkCase(partial: Partial<CohortCase>): CohortCase {
  return {
    receiptNumber: "IOE9822487119",
    serial: 9822487119,
    currentStatus: null,
    caseType: "I-765",
    statusDate: null,
    receivedDate: null,
    isValid: true,
    category: "in_progress",
    isCenter: false,
    ...partial,
  };
}

describe("categorizeStatus", () => {
  it("flags invalid when not valid", () => {
    expect(categorizeStatus("Case Was Approved", false)).toBe("invalid");
  });
  it("detects approved and denied", () => {
    expect(categorizeStatus("Case Was Approved", true)).toBe("approved");
    expect(categorizeStatus("Case Was Denied", true)).toBe("denied");
    expect(categorizeStatus("Case Was Received", true)).toBe("in_progress");
  });
});

describe("computeCohortAnalytics", () => {
  it("computes approval rate from completed cases", () => {
    const cases = [
      mkCase({ category: "approved", currentStatus: "Case Was Approved", isCenter: true }),
      mkCase({ category: "approved", currentStatus: "Card Was Mailed" }),
      mkCase({ category: "denied", currentStatus: "Case Was Denied" }),
      mkCase({ category: "in_progress", currentStatus: "Case Was Received" }),
      mkCase({ category: "invalid", isValid: false }),
    ];
    const result = computeCohortAnalytics({ cases, totalRequested: 10 });

    expect(result.totalValid).toBe(4);
    expect(result.completedCount).toBe(3);
    expect(result.approvalRatePct).toBe(67);
    expect(result.pending).toBe(5);
  });

  it("predicts using same case type", () => {
    const cases = [
      mkCase({ isCenter: true, category: "in_progress", caseType: "I-765" }),
      mkCase({ category: "approved", caseType: "I-765" }),
      mkCase({ category: "denied", caseType: "N-400" }),
    ];
    const result = computeCohortAnalytics({ cases, totalRequested: 3 });
    expect(result.prediction.caseType).toBe("I-765");
    expect(result.prediction.probabilityPct).toBe(100);
  });
});
