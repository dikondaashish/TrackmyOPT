export type ISODateString = string;

export interface OPTDates {
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

export type UnemploymentStatusLevel = "ok" | "warning" | "critical";

export interface UnemploymentStatus {
    level: UnemploymentStatusLevel;
    label: string;
}

export interface CalculatedOPTDates {
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

function addDays(dateLike: string | Date, days: number): string {
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
 * Phase-aware OPT/STEM OPT unemployment calculation.
 *
 * USCIS rules (8 CFR § 214.2(f)(10)):
 *  - Initial post-completion OPT: hard cap of 90 cumulative unemployment days.
 *  - STEM OPT extension: an ADDITIONAL 60 days, for a cumulative 150 days
 *    across the entire OPT + STEM OPT period.
 *
 * Behavior:
 *  - When `stem_start_date` is absent or in the future, returns the 90-day model.
 *  - When STEM has started (or already passed), max becomes 150 and the unemployment
 *    count spans the entire OPT + STEM window (the regulation is cumulative).
 *  - Merging of overlapping/adjacent employment intervals is preserved.
 *
 * NOTE: USCIS counts cumulatively across the FULL OPT authorization period.
 * We compute "unemployment used so far" as (elapsed days in window) − (employed days in window).
 */
export function calculateUnemploymentDays(
    optStartDate: string,
    optEadEndDate: string,
    employmentSpans: EmploymentSpan[],
    stemStartDate?: string | null,
    stemEndDate?: string | null
): {
    used: number;
    max: number;
    /** Indicates which phase the user is currently in or 'post' if window has ended. */
    phase: "initial" | "stem" | "post";
    /** Days remaining before the user hits their cap (clamped to 0). */
    remaining: number;
    /** Whether STEM OPT is currently active. */
    stemActive: boolean;
} {
    const today = toUTCDate(new Date());
    const start = toUTCDate(optStartDate);
    const initialEnd = toUTCDate(optEadEndDate);

    // STEM extends the cumulative window. If no STEM, window ends at OPT EAD end.
    const hasStem = !!stemStartDate;
    const stemStart = hasStem ? toUTCDate(stemStartDate!) : null;
    const stemEnd = stemEndDate
        ? toUTCDate(stemEndDate)
        : stemStart
            ? toUTCDate(new Date(Date.UTC(stemStart.getUTCFullYear() + 2, stemStart.getUTCMonth(), stemStart.getUTCDate())))
            : null; // STEM is 24 months by default

    // The "window end" for cumulative counting is whichever phase end is active.
    const stemActive = !!(stemStart && today.getTime() >= stemStart.getTime() && stemEnd && today.getTime() <= stemEnd.getTime());
    const windowEnd = stemEnd ?? initialEnd;
    const effectiveEnd = windowEnd.getTime() < today.getTime() ? windowEnd : today;

    // Phase the user is in right now
    let phase: "initial" | "stem" | "post";
    if (today.getTime() > windowEnd.getTime()) {
        phase = "post";
    } else if (stemActive) {
        phase = "stem";
    } else {
        phase = "initial";
    }

    // Cap: 90 during initial, 150 cumulative once STEM has started (per regulation).
    // If user is approved for STEM but hasn't started yet, we still show 90 until STEM begins
    // — the +60 allowance only attaches with STEM approval/start.
    const max = stemStart && today.getTime() >= stemStart.getTime() ? 150 : 90;

    // Total elapsed days within OPT/STEM window up to today.
    const totalDays = Math.max(
        0,
        Math.ceil((effectiveEnd.getTime() - start.getTime()) / MS_PER_DAY)
    );

    if (!employmentSpans || employmentSpans.length === 0) {
        const used = totalDays;
        return { used, max, phase, remaining: Math.max(0, max - used), stemActive };
    }

    // Clamp each span to the OPT/STEM window, then merge overlapping intervals.
    const intervals: Array<[number, number]> = [];

    for (const span of employmentSpans) {
        const spanStart = toUTCDate(span.start_date);
        const spanEnd = span.end_date ? toUTCDate(span.end_date) : today;

        const clampedStart = spanStart.getTime() > start.getTime() ? spanStart : start;
        const clampedEnd = spanEnd.getTime() < effectiveEnd.getTime() ? spanEnd : effectiveEnd;

        if (clampedEnd.getTime() >= clampedStart.getTime()) {
            intervals.push([clampedStart.getTime(), clampedEnd.getTime()]);
        }
    }

    let employedDays = 0;

    if (intervals.length > 0) {
        intervals.sort((a, b) => a[0] - b[0]);
        const merged: Array<[number, number]> = [];

        for (const [s, e] of intervals) {
            const last = merged[merged.length - 1];
            // Merge if overlapping or adjacent (within 1 day).
            if (!last || s > last[1] + MS_PER_DAY) {
                merged.push([s, e]);
            } else {
                last[1] = Math.max(last[1], e);
            }
        }

        employedDays = merged.reduce(
            (sum, [s, e]) => sum + Math.ceil((e - s) / MS_PER_DAY),
            0
        );
    }

    const used = Math.max(0, totalDays - employedDays);
    return { used, max, phase, remaining: Math.max(0, max - used), stemActive };
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
export function getFilingWindow(programEndDate: string): {
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

