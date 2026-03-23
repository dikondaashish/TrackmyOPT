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

export function calculateUnemploymentDays(
    optStartDate: string,
    optEadEndDate: string,
    employmentSpans: EmploymentSpan[]
): { used: number; max: number } {
    const today = toUTCDate(new Date());
    const start = toUTCDate(optStartDate);
    const end = toUTCDate(optEadEndDate);
    const effectiveEnd = end.getTime() < today.getTime() ? end : today;

    const max = 90;

    // Total elapsed days within OPT window up to today.
    const totalDays = Math.max(
        0,
        Math.ceil((effectiveEnd.getTime() - start.getTime()) / MS_PER_DAY)
    );

    if (!employmentSpans || employmentSpans.length === 0) {
        return { used: totalDays, max };
    }

    // Clamp each span to the OPT window, then merge overlapping intervals.
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
    return { used, max };
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

