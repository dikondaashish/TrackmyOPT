import { describe, expect, it } from "vitest";
import {
  addDaysIso,
  countBusinessDaysOverdue,
  daysSinceEpochMs,
  daysSinceNow,
  formatDisplayDateShort,
  formatDisplayDateTime,
  formatRelativePast,
  parseDateOnlyAtNoon,
  parseValidDate,
  startOfLocalDayMs,
} from "./safe-dates";

describe("safe-dates", () => {
  it("parseValidDate rejects invalid strings", () => {
    expect(parseValidDate(null)).toBeNull();
    expect(parseValidDate("")).toBeNull();
    expect(parseValidDate("not-a-date")).toBeNull();
  });

  it("parseValidDate accepts ISO strings", () => {
    const d = parseValidDate("2026-01-15T00:00:00.000Z");
    expect(d).not.toBeNull();
    expect(d!.getUTCFullYear()).toBe(2026);
  });

  it("addDaysIso returns null for invalid input", () => {
    expect(addDaysIso("bogus", 10)).toBeNull();
  });

  it("addDaysIso adds days without throwing", () => {
    const iso = addDaysIso("2026-01-01", 115);
    expect(iso).toMatch(/^2026-/);
  });

  it("daysSinceEpochMs returns 0 for invalid dates", () => {
    expect(daysSinceEpochMs("invalid", Date.now())).toBe(0);
  });

  it("formatDisplayDateShort returns em dash for invalid input", () => {
    expect(formatDisplayDateShort(null)).toBe("—");
    expect(formatDisplayDateShort("not-a-date")).toBe("—");
  });

  it("formatDisplayDateTime returns em dash for invalid input", () => {
    expect(formatDisplayDateTime("")).toBe("—");
  });

  it("daysSinceNow returns non-negative whole days", () => {
    const now = Date.parse("2026-03-10T12:00:00.000Z");
    expect(daysSinceNow("2026-03-08T12:00:00.000Z", now)).toBe(2);
    expect(daysSinceNow("invalid", now)).toBe(0);
  });

  it("countBusinessDaysOverdue skips weekends", () => {
    const friday = "2026-03-06T12:00:00.000Z";
    const monday = Date.parse("2026-03-09T12:00:00.000Z");
    expect(countBusinessDaysOverdue(friday, monday)).toBe(1);
  });

  it("parseDateOnlyAtNoon accepts YYYY-MM-DD", () => {
    const d = parseDateOnlyAtNoon("2026-01-15");
    expect(d).not.toBeNull();
    expect(d!.getHours()).toBe(12);
  });

  it("formatRelativePast handles recent and stale timestamps", () => {
    const now = Date.parse("2026-03-10T12:00:00.000Z");
    expect(formatRelativePast("2026-03-10T11:59:00.000Z", now)).toBe("1 min ago");
    expect(formatRelativePast("2026-03-01T12:00:00.000Z", now)).toMatch(/Mar/);
  });

  it("startOfLocalDayMs returns midnight local for epoch", () => {
    const noon = Date.parse("2026-03-10T12:00:00.000Z");
    const start = startOfLocalDayMs(noon);
    const d = new Date(start);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });
});
