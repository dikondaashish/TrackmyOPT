export type ISODateString = string;

interface OPTDates {
    program_end_date: ISODateString;
    dso_recommendation_date?: ISODateString | null;
    opt_ead_end_date: ISODateString;
    opt_start_date: ISODateString;
    stem_start_date?: ISODateString | null;
    created_at?: ISODateString;
    updated_at?: ISODateString;
}

export interface EmploymentSpan {
    id: string;
    employer_name: string;
    start_date: ISODateString;
    end_date: ISODateString | null;
    is_current: boolean;
    job_title?: string;
    location?: string;
}

type UnemploymentStatusLevel = "ok" | "warning" | "critical";

interface UnemploymentStatus {
    level: UnemploymentStatusLevel;
    label: string;
}

interface CalculatedOPTDates {
    earliestFileDate: string;
    recommendedTarget: string;
    mustArriveBy: string;
    optStartEarliest: string;
    optStartLatest: string;
    nextDeadline?: {
        daysLeft: number;
        label: string;
        date: string;
    };
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toUTCDate(dateLike: string | Date): Date {
    const d = typeof dateLike === "string" ? new Date(dateLike) : new Date(dateLike);
    // Normalize to midnight UTC for stable day-diff behavior.
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function addDays(dateLike: string | Date, days: number): string {
    const d = toUTCDate(dateLike);
    const next = new Date(d.getTime() + days * MS_PER_DAY);
    // Keep as ISO date string (yyyy-mm-dd) so other UI pieces can format consistently.
    return next.toISOString().slice(0, 10);
}

export function isoToMMDDYYYY(dateStr: string): string {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
}

export function formatDate(dateLike: string | Date): string {
    const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
    if (Number.isNaN(d.getTime())) return String(dateLike);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatDateRange(start: string | Date, end: string | Date): string {
    return `${formatDate(start)} - ${formatDate(end)}`;
}

export function calculateOPTDates(optDates: OPTDates): CalculatedOPTDates {
    const todayISO = new Date().toISOString().slice(0, 10);
    const programEnd = optDates.program_end_date;

    // Common OPT guideline defaults:
    // - Earliest file: up to 90 days before program end.
    // - Safe target: ~60 days before program end.
    // - Hard receive deadline: if DSO recommendation exists, use +30 days; otherwise use +30 from program end.
    const earliestFileDate = addDays(programEnd, -90);
    const recommendedTarget = addDays(programEnd, -60);
    const mustArriveBy = addDays(
        optDates.dso_recommendation_date ?? programEnd,
        30
    );

    // OPT start window:
    // - Earliest start: day after program end.
    // - Latest start: up to 60 days after program end.
    const optStartEarliest = addDays(programEnd, 1);
    const optStartLatest = addDays(programEnd, 60);

    const candidates: Array<{ date: string; label: string }> = [
        { date: earliestFileDate, label: "Earliest filing date" },
        { date: recommendedTarget, label: "Recommended submission date" },
        { date: mustArriveBy, label: "Hard deadline (must arrive by)" },
    ];

    const today = toUTCDate(todayISO);
    const next = candidates
        .map((c) => ({ ...c, diffDays: Math.ceil((toUTCDate(c.date).getTime() - today.getTime()) / MS_PER_DAY) }))
        .filter((c) => c.diffDays >= 0)
        .sort((a, b) => toUTCDate(a.date).getTime() - toUTCDate(b.date).getTime())[0];

    return {
        earliestFileDate,
        recommendedTarget,
        mustArriveBy,
        optStartEarliest,
        optStartLatest,
        nextDeadline: next
            ? { daysLeft: next.diffDays, label: next.label, date: next.date }
            : undefined,
    };
}

/**
 * Hard caps from 8 CFR § 214.2(f)(10)(ii).
 * - Initial post-completion OPT: 90 cumulative unemployment days.
 * - STEM OPT extension: +60 additional days, for a CUMULATIVE 150 across the
 *   entire OPT + STEM OPT period. STEM does NOT reset the counter.
 */
export const INITIAL_OPT_CAP = 90 as const;
export const CUMULATIVE_STEM_CAP = 150 as const;

type OptPhase = "initial" | "stem" | "post";

export interface UnemploymentBreakdown {
    /**
     * The compliance number: cumulative unemployment days across the entire
     * OPT + STEM OPT window up to today (or window end, whichever is earlier).
     */
    used: number;
    /**
     * Authoritative cap for the user's CURRENT phase:
     *  - 90  → no STEM, or STEM is approved but has not started yet.
     *  - 150 → STEM has started (or already ended; cap stays at 150).
     */
    max: 90 | 150;
    /** Alias of `max` — convenience for UI code reading "currentCap". */
    currentCap: 90 | 150;
    initialOptCap: typeof INITIAL_OPT_CAP;
    cumulativeStemCap: typeof CUMULATIVE_STEM_CAP;
    /** Phase the user is in right now. */
    phase: OptPhase;
    /** Cumulative days remaining before hitting `max` (clamped to 0). */
    remaining: number;
    /** Whether STEM OPT is currently active (today between stemStart and stemEnd). */
    stemActive: boolean;
    /** Unemployment days incurred during the initial OPT phase ONLY. */
    initialOptUnemploymentDays: number;
    /** Unemployment days incurred during the STEM OPT phase only (0 if STEM not started). */
    stemUnemploymentDays: number;
    /**
     * True if the user accumulated more than 90 unemployment days during the
     * initial OPT phase. This stays true even after STEM starts so the
     * earlier compliance violation is never hidden by the higher 150 cap.
     */
    exceededInitialOptCap: boolean;
    /** True if cumulative usage already exceeds the 150-day cumulative cap. */
    exceededCumulativeCap: boolean;
    /** Human-readable critical/caution warnings. */
    warnings: string[];
}

/**
 * Compute unemployed days within `[windowStart, windowEnd]` using a
 * merge-and-subtract approach against employment spans.
 *
 * Definition: total elapsed days in window minus the union of employed
 * intervals clipped to that window.
 */
function computeUnemployedInWindow(
    windowStart: Date,
    windowEnd: Date,
    spans: EmploymentSpan[],
    todayRef: Date,
): number {
    if (windowEnd.getTime() <= windowStart.getTime()) return 0;

    const totalDays = Math.max(
        0,
        Math.ceil((windowEnd.getTime() - windowStart.getTime()) / MS_PER_DAY),
    );

    if (!spans || spans.length === 0) return totalDays;

    const intervals: Array<[number, number]> = [];
    for (const span of spans) {
        const spanStart = toUTCDate(span.start_date);
        const spanEnd = span.end_date ? toUTCDate(span.end_date) : todayRef;

        const clampedStart = spanStart.getTime() > windowStart.getTime() ? spanStart : windowStart;
        const clampedEnd = spanEnd.getTime() < windowEnd.getTime() ? spanEnd : windowEnd;

        if (clampedEnd.getTime() >= clampedStart.getTime()) {
            intervals.push([clampedStart.getTime(), clampedEnd.getTime()]);
        }
    }

    if (intervals.length === 0) return totalDays;

    intervals.sort((a, b) => a[0] - b[0]);
    const merged: Array<[number, number]> = [];
    for (const [s, e] of intervals) {
        const last = merged[merged.length - 1];
        if (!last || s > last[1] + MS_PER_DAY) {
            merged.push([s, e]);
        } else {
            last[1] = Math.max(last[1], e);
        }
    }

    const employedDays = merged.reduce(
        (sum, [s, e]) => sum + Math.ceil((e - s) / MS_PER_DAY),
        0,
    );

    return Math.max(0, totalDays - employedDays);
}

/**
 * Phase-aware OPT/STEM OPT unemployment calculation.
 *
 * Returns a structured breakdown so the UI can show:
 *  - Cumulative compliance number ("X / 150" once STEM starts)
 *  - The initial-OPT portion separately
 *  - The STEM-period portion separately
 *  - Critical flags when the initial-90 was breached BEFORE STEM started
 *    (STEM approval does NOT erase that compliance event)
 *
 * Backward-compatible: `used`, `max`, `phase`, `remaining`, `stemActive` are
 * preserved with the same semantics as before.
 *
 * USCIS rule references:
 *  - 8 CFR § 214.2(f)(10)(ii)(C): 90 days initial OPT.
 *  - 8 CFR § 214.2(f)(10)(ii)(E)(8): cumulative 150 across OPT + STEM OPT.
 */
export function calculateUnemploymentDays(
    optStartDate: string,
    optEadEndDate: string,
    employmentSpans: EmploymentSpan[],
    stemStartDate?: string | null,
    stemEndDate?: string | null,
    asOfDate?: string | Date,
): UnemploymentBreakdown {
    const today = toUTCDate(asOfDate ?? new Date());
    const start = toUTCDate(optStartDate);
    const initialEnd = toUTCDate(optEadEndDate);

    // STEM extends the cumulative window. If no STEM, window ends at OPT EAD end.
    const hasStem = !!stemStartDate;
    const stemStart = hasStem ? toUTCDate(stemStartDate!) : null;
    const stemEnd = stemEndDate
        ? toUTCDate(stemEndDate)
        : stemStart
            ? toUTCDate(
                new Date(
                    Date.UTC(
                        stemStart.getUTCFullYear() + 2,
                        stemStart.getUTCMonth(),
                        stemStart.getUTCDate(),
                    ),
                ),
            )
            : null; // STEM is 24 months by default

    const stemHasStarted = !!(stemStart && today.getTime() >= stemStart.getTime());
    const stemActive = !!(
        stemStart &&
        today.getTime() >= stemStart.getTime() &&
        stemEnd &&
        today.getTime() <= stemEnd.getTime()
    );

    // Cumulative-counting window. Uses STEM end if STEM started, else OPT EAD end.
    const cumulativeWindowEnd = stemHasStarted ? (stemEnd ?? initialEnd) : initialEnd;
    const cumulativeEffectiveEnd =
        cumulativeWindowEnd.getTime() < today.getTime() ? cumulativeWindowEnd : today;

    // Initial-phase end: STEM start − 1 day if STEM exists, else OPT EAD end.
    // For "how much initial-phase unemployment has the user actually incurred so far"
    // we also clamp by today (they can't have unemployment days in the future).
    const initialPhaseEnd = stemStart
        ? new Date(Math.min(stemStart.getTime() - MS_PER_DAY, today.getTime()))
        : new Date(Math.min(initialEnd.getTime(), today.getTime()));

    // Phase the user is in right now
    let phase: OptPhase;
    if (today.getTime() > cumulativeWindowEnd.getTime()) {
        phase = "post";
    } else if (stemActive) {
        phase = "stem";
    } else {
        phase = "initial";
    }

    // Cap rule:
    //  - If STEM has NOT started (no STEM at all OR STEM is in the future), cap = 90.
    //  - Once STEM has started (or already ended), cap = 150 cumulative.
    const max: 90 | 150 = stemHasStarted ? 150 : 90;

    // Cumulative usage: from OPT start to whichever phase end is "current".
    const cumulativeUsed = computeUnemployedInWindow(
        start,
        cumulativeEffectiveEnd,
        employmentSpans,
        today,
    );

    // Initial-OPT-only usage: from OPT start to initialPhaseEnd.
    // We always compute this so the UI can show "Initial OPT: A / 90" even
    // when the user is currently in the STEM phase, and so the
    // exceededInitialOptCap flag is correct even if STEM has since started.
    const initialOptUnemploymentDays = computeUnemployedInWindow(
        start,
        initialPhaseEnd,
        employmentSpans,
        today,
    );

    // STEM-period usage = cumulative − initial. Guard against negative due to
    // rounding edge cases.
    const stemUnemploymentDays = Math.max(0, cumulativeUsed - initialOptUnemploymentDays);

    const exceededInitialOptCap = initialOptUnemploymentDays > INITIAL_OPT_CAP;
    const exceededCumulativeCap = cumulativeUsed > CUMULATIVE_STEM_CAP;

    const warnings: string[] = [];
    if (exceededInitialOptCap) {
        warnings.push(
            `Initial OPT unemployment exceeded 90 days (used ${initialOptUnemploymentDays}). This is an F-1 status violation regardless of whether STEM was later approved.`,
        );
    }
    if (exceededCumulativeCap) {
        warnings.push(
            `Cumulative OPT/STEM unemployment exceeded 150 days (used ${cumulativeUsed}). Risk of SEVIS termination — contact your DSO immediately.`,
        );
    }
    // Soft caution: within 25% of the current cap
    if (!exceededCumulativeCap && cumulativeUsed >= Math.floor(max * 0.75)) {
        warnings.push(
            `You have used ${cumulativeUsed} of ${max} unemployment days. Find qualifying employment soon to avoid risk.`,
        );
    }

    return {
        used: cumulativeUsed,
        max,
        currentCap: max,
        initialOptCap: INITIAL_OPT_CAP,
        cumulativeStemCap: CUMULATIVE_STEM_CAP,
        phase,
        remaining: Math.max(0, max - cumulativeUsed),
        stemActive,
        initialOptUnemploymentDays,
        stemUnemploymentDays,
        exceededInitialOptCap,
        exceededCumulativeCap,
        warnings,
    };
}

export function getUnemploymentStatus(used: number, max: number): UnemploymentStatus {
    const ratio = max > 0 ? used / max : 0;
    if (ratio >= 1) {
        return {
            level: "critical",
            label: "Limit exceeded — OPT status termination risk",
        };
    }
    if (ratio >= 0.75) {
        return {
            level: "warning",
            label: "Approaching your unemployment limit",
        };
    }
    return {
        level: "ok",
        label: "Within unemployment limit",
    };
}

/**
 * Single source of truth for OPT filing window edges.
 * Earliest: 90 days before program end.
 * Hard deadline: 60 days after program end (USCIS must receive within 60 days
 * of the DSO recommendation, which is typically within 30 days of program end).
 */
export function getFilingWindow(programEndDate: string | Date): {
    earliestFile: string;
    recommendedTarget: string;
    hardDeadline: string;
} {
    return {
        earliestFile: addDays(programEndDate, -90),
        recommendedTarget: addDays(programEndDate, -60),
        hardDeadline: addDays(programEndDate, 60),
    };
}

/**
 * Day-difference helper using UTC-normalized dates to avoid DST/timezone bugs.
 */
export function daysBetween(a: string | Date, b: string | Date): number {
    const da = toUTCDate(a).getTime();
    const db = toUTCDate(b).getTime();
    return Math.ceil((db - da) / MS_PER_DAY);
}
