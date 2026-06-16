import { describe, expect, it } from "vitest";
import {
  normalizeStatusHistory,
  withNormalizedStatusHistory,
  buildStatusHistoryFromUscis,
} from "./normalize-status-history";

describe("normalizeStatusHistory", () => {
  it("returns empty array for non-arrays", () => {
    expect(normalizeStatusHistory(null)).toEqual([]);
    expect(normalizeStatusHistory("IOE123")).toEqual([]);
    expect(normalizeStatusHistory({ status: "x" })).toEqual([]);
  });

  it("filters null entries and maps valid timeline rows", () => {
    expect(
      normalizeStatusHistory([
        null,
        { status: "Case Was Received", date: "2026-01-01" },
        { completedText: "Approved", date: "2026-02-01", description: "Done" },
      ])
    ).toEqual([
      { status: "Case Was Received", date: "2026-01-01" },
      { status: "Approved", date: "2026-02-01", description: "Done" },
    ]);
  });

  it("wraps rows with withNormalizedStatusHistory", () => {
    expect(
      withNormalizedStatusHistory({
        receipt_number: "IOE1234567890",
        status_history: [null, { status: "Pending", date: "2026-03-01" }],
      }).status_history
    ).toEqual([{ status: "Pending", date: "2026-03-01" }]);
  });

  it("stores USCIS long description on the latest matching history entry", () => {
    const history = buildStatusHistoryFromUscis(
      "Case Was Changed To A Premium Processing Case",
      "We changed your case, Receipt Number IOE9822487119, from a standard case to a premium-processing case. The premium-processing clock started on May 12, 2026.",
      [
        {
          date: "May 12, 2026",
          completedText: "Case Was Changed To A Premium Processing Case",
        },
        { date: "April 1, 2026", completedText: "Case Was Received" },
      ]
    );

    expect(history[0]?.description).toContain("Receipt Number IOE9822487119");
    expect(history[0]?.description).toContain("May 12, 2026");
    expect(history[0]?.date).toBe("May 12, 2026");
  });
});
