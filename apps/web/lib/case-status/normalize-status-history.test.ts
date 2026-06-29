import { describe, expect, it } from "vitest";
import {
  normalizeStatusHistory,
  withNormalizedStatusHistory,
  buildStatusHistoryFromUscis,
} from "./normalize-status-history";

describe("normalizeStatusHistory", () => {
  it("returns [] for null input", () => {
    expect(normalizeStatusHistory(null)).toEqual([]);
  });

  it("returns [] for empty array", () => {
    expect(normalizeStatusHistory([])).toEqual([]);
  });

  it("returns [] for non-array values", () => {
    expect(normalizeStatusHistory("IOE123")).toEqual([]);
    expect(normalizeStatusHistory({ status: "x" })).toEqual([]);
    expect(normalizeStatusHistory(undefined)).toEqual([]);
  });

  it("passes through one valid entry", () => {
    expect(
      normalizeStatusHistory([{ status: "Case Was Received", date: "2026-01-01" }])
    ).toEqual([{ status: "Case Was Received", date: "2026-01-01" }]);
  });

  it("filters out entries missing status", () => {
    expect(
      normalizeStatusHistory([{ date: "2026-01-01", description: "No status field" }])
    ).toEqual([]);
    expect(
      normalizeStatusHistory([{ status: 123, date: "2026-01-01" }])
    ).toEqual([]);
  });

  it("returns only valid entries from mixed valid/invalid arrays", () => {
    expect(
      normalizeStatusHistory([
        null,
        { date: "2026-01-01" },
        { status: "Case Was Received", date: "2026-01-01" },
        { completedText: "Approved", date: "2026-02-01", description: "Done" },
        { status: "", date: "2026-03-01" },
      ])
    ).toEqual([
      { status: "Case Was Received", date: "2026-01-01" },
      { status: "Approved", date: "2026-02-01", description: "Done" },
    ]);
  });

  it("maps timestamp and label aliases", () => {
    expect(
      normalizeStatusHistory([
        {
          status: "Case Was Received",
          timestamp: "2026-01-01",
          label: "Received by USCIS",
        },
      ])
    ).toEqual([
      {
        status: "Case Was Received",
        date: "2026-01-01",
        description: "Received by USCIS",
      },
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
