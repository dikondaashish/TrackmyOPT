import { describe, expect, it } from "vitest";
import { addDaysIso, daysSinceEpochMs, parseValidDate } from "./safe-dates";

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
});
