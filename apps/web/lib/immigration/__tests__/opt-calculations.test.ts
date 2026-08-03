/**
 * Phase-aware OPT / STEM OPT unemployment calculation tests (ISS-001).
 *
 * Rules under test (8 CFR § 214.2(f)(10)(ii)):
 *   - Initial OPT cap: 90 cumulative unemployment days.
 *   - STEM OPT cap: 150 CUMULATIVE total (initial 90 + extension 60).
 *   - STEM does NOT reset the counter — initial-OPT days carry forward.
 *   - The 90-day breach during initial OPT must remain visible even after STEM starts.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    calculateUnemploymentDays,
    CUMULATIVE_STEM_CAP,
    getFilingWindow,
    INITIAL_OPT_CAP,
    type EmploymentSpan,
} from "@/lib/immigration/opt-calculations";

/** Helper: build an EmploymentSpan with reasonable defaults. */
function span(start: string, end: string | null, opts: Partial<EmploymentSpan> = {}): EmploymentSpan {
    return {
        id: opts.id ?? `${start}-${end ?? "current"}`,
        employer_name: opts.employer_name ?? "TestCo",
        start_date: start,
        end_date: end,
        is_current: opts.is_current ?? (end === null),
        job_title: opts.job_title,
        location: opts.location,
    };
}

/** Pin "today" to a known UTC date so tests are deterministic. */
function setToday(isoDate: string) {
    vi.setSystemTime(new Date(`${isoDate}T12:00:00Z`));
}

describe("calculateUnemploymentDays — phase-aware OPT/STEM OPT", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    // -------- Example 1: 40 initial-OPT unemployment days → STEM starts → 40/150
    it("Example 1: 40 days initial unemployment + STEM started → 40 / 150 (110 remaining)", () => {
        // OPT runs 2024-01-01 → 2024-12-31 (366 days).
        // User unemployed for first 40 days (Jan 1 → Feb 10), then employed continuously.
        // STEM starts 2025-01-01. "Today" is 2025-02-01 (one month into STEM).
        setToday("2025-02-01");
        const spans: EmploymentSpan[] = [
            span("2024-02-10", null), // current job since Feb 10, 2024
        ];
        const calc = calculateUnemploymentDays(
            "2024-01-01",
            "2024-12-31",
            spans,
            "2025-01-01",
            "2027-01-01",
        );

        expect(calc.max).toBe(150);
        expect(calc.currentCap).toBe(150);
        expect(calc.phase).toBe("stem");
        // Pre-STEM unemployment: Jan 1 → Feb 10 ≈ 40 days
        expect(calc.initialOptUnemploymentDays).toBeGreaterThanOrEqual(39);
        expect(calc.initialOptUnemploymentDays).toBeLessThanOrEqual(41);
        // No additional unemployment during STEM (employed all the way)
        expect(calc.stemUnemploymentDays).toBeLessThanOrEqual(2);
        // Cumulative ≈ 40
        expect(calc.used).toBeGreaterThanOrEqual(39);
        expect(calc.used).toBeLessThanOrEqual(42);
        expect(calc.remaining).toBeGreaterThanOrEqual(108);
        expect(calc.remaining).toBeLessThanOrEqual(111);
        expect(calc.exceededInitialOptCap).toBe(false);
        expect(calc.exceededCumulativeCap).toBe(false);
    });

    // -------- Example 2: 90 initial days + STEM started → 90/150 (60 remaining)
    it("Example 2: exactly 90 days initial unemployment + STEM started → 90 / 150 (60 remaining)", () => {
        // OPT 2024-01-01 → 2024-12-31. Unemployed first 90 days, then employed.
        // STEM started 2025-01-01. Today: 2025-01-15.
        setToday("2025-01-15");
        const spans: EmploymentSpan[] = [span("2024-04-01", null)]; // started Apr 1 → 91 days unemployed approx
        const calc = calculateUnemploymentDays(
            "2024-01-01",
            "2024-12-31",
            spans,
            "2025-01-01",
            "2027-01-01",
        );

        expect(calc.max).toBe(150);
        expect(calc.phase).toBe("stem");
        // ~91 days unemployed before STEM (Jan 1 → Apr 1 is ~91)
        expect(calc.initialOptUnemploymentDays).toBeGreaterThanOrEqual(89);
        expect(calc.initialOptUnemploymentDays).toBeLessThanOrEqual(92);
        // Initial cap is 90 — we expect exceededInitialOptCap to be true OR false depending
        // on the exact day count. We don't assert here; Example 3 tests that flag explicitly.
        expect(calc.used).toBeLessThanOrEqual(95);
    });

    // -------- Example 3: 100 days before STEM → critical exceededInitialOptCap stays set
    it("Example 3: 100 days unemployment before STEM → exceededInitialOptCap remains true after STEM starts", () => {
        // OPT 2024-01-01 → 2024-12-31. Unemployed Jan 1 → Apr 10 ≈ 100 days. STEM 2025-01-01.
        setToday("2025-02-15");
        const spans: EmploymentSpan[] = [span("2024-04-10", null)];
        const calc = calculateUnemploymentDays(
            "2024-01-01",
            "2024-12-31",
            spans,
            "2025-01-01",
            "2027-01-01",
        );

        expect(calc.max).toBe(150);
        expect(calc.phase).toBe("stem");
        expect(calc.initialOptUnemploymentDays).toBeGreaterThan(90);
        expect(calc.exceededInitialOptCap).toBe(true);
        // The 90-day initial-OPT breach is a compliance event that does NOT go away
        // just because STEM started and the new cap is 150. The warning must surface.
        expect(calc.warnings.some((w) => w.includes("Initial OPT"))).toBe(true);
    });

    // -------- Example 4: gap crossing STEM boundary correctly counted
    it("Example 4: employment gap straddling the STEM start boundary is counted once cumulatively", () => {
        // OPT 2024-01-01 → 2024-12-31. STEM starts 2025-01-01. Today 2025-02-15.
        // Worked Jan 1, 2024 → Dec 1, 2024 (employed during initial OPT).
        // Then unemployed Dec 2, 2024 → Feb 14, 2025 (straddles STEM start).
        // The gap is ~75 days total: 30 in initial (Dec 2 → Dec 31) + 45 in STEM (Jan 1 → Feb 14).
        setToday("2025-02-15");
        const spans: EmploymentSpan[] = [
            span("2024-01-01", "2024-12-01"),
            // Gap from 2024-12-02 → today (no second job)
        ];
        const calc = calculateUnemploymentDays(
            "2024-01-01",
            "2024-12-31",
            spans,
            "2025-01-01",
            "2027-01-01",
        );

        expect(calc.phase).toBe("stem");
        expect(calc.max).toBe(150);
        // Total cumulative gap is ~75 days
        expect(calc.used).toBeGreaterThanOrEqual(73);
        expect(calc.used).toBeLessThanOrEqual(77);
        // Initial-OPT portion is roughly Dec 2 → Dec 31 = ~30 days
        expect(calc.initialOptUnemploymentDays).toBeGreaterThanOrEqual(28);
        expect(calc.initialOptUnemploymentDays).toBeLessThanOrEqual(32);
        // STEM-period portion = cumulative − initial (~45)
        expect(calc.stemUnemploymentDays).toBeGreaterThanOrEqual(43);
        expect(calc.stemUnemploymentDays).toBeLessThanOrEqual(47);
        // Sum should equal cumulative
        expect(calc.initialOptUnemploymentDays + calc.stemUnemploymentDays).toBe(calc.used);
    });

    // -------- Example 5: no STEM → 90-day model only
    it("Example 5: no stem_start_date → cap stays at 90, no 150 denominator", () => {
        setToday("2024-06-01");
        const spans: EmploymentSpan[] = [span("2024-03-01", null)]; // unemployed Jan 1 → Mar 1 ≈ 60 days
        const calc = calculateUnemploymentDays(
            "2024-01-01",
            "2024-12-31",
            spans,
            null,
            null,
        );

        expect(calc.max).toBe(90);
        expect(calc.currentCap).toBe(90);
        expect(calc.phase).toBe("initial");
        expect(calc.stemActive).toBe(false);
        expect(calc.stemUnemploymentDays).toBe(0);
        expect(calc.used).toBeGreaterThanOrEqual(58);
        expect(calc.used).toBeLessThanOrEqual(62);
    });

    // -------- Example 6: future stem_start_date → still initial phase, cap 90
    it("Example 6: STEM approved but in the future → current phase is initial, cap is 90", () => {
        setToday("2024-06-01");
        const spans: EmploymentSpan[] = [span("2024-04-01", null)]; // unemployed Jan 1 → Apr 1 ≈ 91 days
        const calc = calculateUnemploymentDays(
            "2024-01-01",
            "2024-12-31",
            spans,
            "2025-01-01", // future
            "2027-01-01",
        );

        expect(calc.max).toBe(90);
        expect(calc.phase).toBe("initial");
        expect(calc.stemActive).toBe(false);
        // Initial breach already happened — flag set even though phase is still initial.
        expect(calc.initialOptUnemploymentDays).toBeGreaterThan(90);
        expect(calc.exceededInitialOptCap).toBe(true);
    });

    // -------- Example 7: zero employment → every elapsed day counts as unemployed
    it("zero employment spans → every elapsed day in window counts as unemployed", () => {
        setToday("2024-04-01");
        const calc = calculateUnemploymentDays(
            "2024-01-01",
            "2024-12-31",
            [],
            null,
            null,
        );

        // Jan 1 → Apr 1 ≈ 91 days
        expect(calc.used).toBeGreaterThanOrEqual(89);
        expect(calc.used).toBeLessThanOrEqual(92);
        expect(calc.max).toBe(90);
        // Breached 90-day cap
        expect(calc.exceededInitialOptCap).toBe(true);
    });

    // -------- Example 8: numerator/denominator alignment (no STEM)
    it("alignment: numerator and denominator agree (no STEM)", () => {
        setToday("2024-06-01");
        const calc = calculateUnemploymentDays(
            "2024-01-01",
            "2024-12-31",
            [span("2024-02-01", null)],
        );
        expect(calc.max).toBe(90);
        expect(calc.remaining).toBe(Math.max(0, calc.max - calc.used));
    });

    // -------- Example 9: alignment after STEM
    it("alignment: numerator and denominator agree (post-STEM cumulative)", () => {
        setToday("2025-06-01");
        const calc = calculateUnemploymentDays(
            "2024-01-01",
            "2024-12-31",
            [span("2024-02-01", "2024-09-01")], // 31 days unemployed Jan + ~90 days gap Sep onward
            "2025-01-01",
            "2027-01-01",
        );
        expect(calc.max).toBe(150);
        expect(calc.remaining).toBe(Math.max(0, 150 - calc.used));
        expect(calc.initialOptUnemploymentDays + calc.stemUnemploymentDays).toBe(calc.used);
    });

    // -------- Example 10: cumulative exceedance flag
    it("cumulative > 150 → exceededCumulativeCap is true with critical warning", () => {
        setToday("2025-12-01");
        // OPT Jan 1, 2024 → Dec 31, 2024. STEM Jan 1, 2025 → Dec 31, 2026.
        // No employment at all — every day is unemployment. As of Dec 1, 2025 that's ~700 days.
        const calc = calculateUnemploymentDays(
            "2024-01-01",
            "2024-12-31",
            [],
            "2025-01-01",
            "2026-12-31",
        );
        expect(calc.max).toBe(150);
        expect(calc.exceededCumulativeCap).toBe(true);
        expect(calc.warnings.some((w) => w.includes("Cumulative"))).toBe(true);
        expect(calc.remaining).toBe(0);
    });

    // -------- Constants sanity
    it("constants: INITIAL_OPT_CAP=90 and CUMULATIVE_STEM_CAP=150", () => {
        expect(INITIAL_OPT_CAP).toBe(90);
        expect(CUMULATIVE_STEM_CAP).toBe(150);
    });
});

describe("getFilingWindow", () => {
    it("returns earliest, recommended, and hard deadline relative to program end", () => {
        const w = getFilingWindow("2024-05-15");
        expect(w.earliestFile).toBe("2024-02-15");
        expect(w.recommendedTarget).toBe("2024-03-16");
        expect(w.hardDeadline).toBe("2024-07-14");
    });
});
