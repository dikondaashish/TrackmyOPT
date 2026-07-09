import { describe, expect, it } from "vitest";
import {
  computeCohortAnalytics,
  excludeQuarantinedCases,
  type CohortCase,
} from "@/lib/case-status/cohort-analytics";

function mkCase(partial: Partial<CohortCase>): CohortCase {
  return {
    receiptNumber: "IOE9822487119",
    serial: 9822487119,
    currentStatus: "Case Was Received",
    caseType: "I-765",
    statusDate: null,
    receivedDate: null,
    isValid: true,
    category: "in_progress",
    isCenter: false,
    ...partial,
  };
}

describe("quarantined cohort cache rows", () => {
  it("excludeQuarantinedCases removes quarantined rows", () => {
    const cases = [
      mkCase({ receiptNumber: "IOE0000000001" }),
      mkCase({ receiptNumber: "IOE0000000002", quarantined: true }),
    ];
    expect(excludeQuarantinedCases(cases)).toHaveLength(1);
  });

  it("computeCohortAnalytics returns zero scanned when all quarantined", () => {
    const analytics = computeCohortAnalytics({
      cases: [
        mkCase({ quarantined: true }),
        mkCase({ receiptNumber: "IOE0000000002", quarantined: true }),
      ],
      totalRequested: 10,
    });
    expect(analytics.totalScanned).toBe(0);
    expect(analytics.totalValid).toBe(0);
  });
});
