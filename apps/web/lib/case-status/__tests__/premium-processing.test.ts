import { describe, expect, it } from "vitest";
import { addBusinessDays, businessDaysBetween, formatIsoDate } from "../business-days";
import { detectPpStart, getPpClock } from "../premium-processing";

describe("addBusinessDays", () => {
  it("skips weekends", () => {
    // Friday 2026-05-08 + 1 business day = Monday 2026-05-11
    const start = new Date("2026-05-08T12:00:00.000Z");
    expect(formatIsoDate(addBusinessDays(start, 1))).toBe("2026-05-11");
  });
});

describe("detectPpStart", () => {
  it("prefers manual date", () => {
    expect(
      detectPpStart({
        manualPpStart: "2026-05-12",
        statusHistory: [
          { status: "Changed to Premium Processing", date: "2026-05-10" },
        ],
        currentStatus: null,
      })
    ).toBe("2026-05-12");
  });

  it("detects earliest PP history entry", () => {
    expect(
      detectPpStart({
        statusHistory: [
          { status: "Changed to Premium Processing", date: "2026-05-12" },
          { status: "Case Was Received", date: "2026-04-01" },
        ],
        currentStatus: null,
      })
    ).toBe("2026-05-12");
  });
});

describe("getPpClock", () => {
  it("flags overdue after deadline", () => {
    const clock = getPpClock("2026-05-12", new Date("2026-06-14T12:00:00.000Z"));
    expect(clock.isOverdue).toBe(true);
    expect(clock.daysOverdue).toBeGreaterThan(0);
  });

  it("shows days remaining before deadline", () => {
    const clock = getPpClock("2026-05-12", new Date("2026-05-12T12:00:00.000Z"));
    expect(clock.isOverdue).toBe(false);
    expect(clock.daysRemaining).toBeGreaterThan(0);
  });
});

describe("businessDaysBetween", () => {
  it("counts business days between dates", () => {
    const a = new Date("2026-05-12T12:00:00.000Z");
    const b = new Date("2026-05-14T12:00:00.000Z");
    expect(businessDaysBetween(a, b)).toBe(2);
  });
});
