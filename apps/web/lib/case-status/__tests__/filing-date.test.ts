import { describe, expect, it } from "vitest";
import {
  deriveReceivedDateFromHistory,
  normalizeFilingDateToIso,
  resolveReceivedDate,
} from "../filing-date";

describe("normalizeFilingDateToIso", () => {
  it("accepts yyyy-mm-dd", () => {
    expect(normalizeFilingDateToIso("2026-05-12")).toBe("2026-05-12");
  });

  it("parses long-form USCIS dates", () => {
    expect(normalizeFilingDateToIso("May 12, 2026")).toBe("2026-05-12");
  });
});

describe("deriveReceivedDateFromHistory", () => {
  it("returns earliest received entry", () => {
    expect(
      deriveReceivedDateFromHistory([
        { status: "We approved your Form I-765.", date: "2026-06-01" },
        { status: "We received your Form I-765.", date: "2026-05-01" },
        { status: "Case Was Received", date: "2026-05-10" },
      ])
    ).toBe("2026-05-01");
  });

  it("returns null when no received entry", () => {
    expect(
      deriveReceivedDateFromHistory([
        { status: "We approved your Form I-765.", date: "2026-06-01" },
      ])
    ).toBeNull();
  });
});

describe("resolveReceivedDate", () => {
  it("prefers USCIS date, then history, then existing", () => {
    expect(
      resolveReceivedDate({
        uscisReceivedDate: "January 15, 2024",
        statusHistory: [{ status: "We received your Form I-765.", date: "2024-01-10" }],
        existingReceivedDate: "2024-01-05",
      })
    ).toBe("2024-01-15");

    expect(
      resolveReceivedDate({
        uscisReceivedDate: null,
        statusHistory: [{ status: "We received your Form I-765.", date: "2024-01-10" }],
        existingReceivedDate: "2024-01-05",
      })
    ).toBe("2024-01-10");

    expect(
      resolveReceivedDate({
        uscisReceivedDate: null,
        statusHistory: [],
        existingReceivedDate: "2024-01-05",
      })
    ).toBe("2024-01-05");
  });
});
