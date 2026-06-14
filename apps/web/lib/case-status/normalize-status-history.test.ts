import { describe, expect, it } from "vitest";
import {
  normalizeStatusHistory,
  withNormalizedStatusHistory,
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
});
