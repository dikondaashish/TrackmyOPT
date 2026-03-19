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
    if (!employmentSpans || employmentSpans.length === 0) {
        const used = Math.max(0, Math.ceil((effectiveEnd.getTime() - start.getTime()) / MS_PER_DAY));
        return { used, max };
    }

    const spansSorted = [...employmentSpans]
        .map((s) => ({
            ...s,
            start: toUTCDate(s.start_date),
            end: s.end_date ? toUTCDate(s.end_date) : null,
        }))
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    // We consider "employment" days as days within [employmentStart, employmentEnd] (inclusive).
    // Unemployment days are the gaps between employment blocks within [optStart, effectiveEnd].
    let used = 0;
    let cursor = start;

    for (const span of spansSorted) {
        const spanStart = span.start;
        if (spanStart.getTime() > effectiveEnd.getTime()) break;

        // If employment starts after the cursor, everything from cursor to (spanStart - 1 day) is unemployment.
        if (spanStart.getTime() > cursor.getTime()) {
            const gapEnd = new Date(spanStart.getTime() - MS_PER_DAY);
            if (gapEnd.getTime() >= cursor.getTime()) {
                used += Math.ceil((gapEnd.getTime() - cursor.getTime()) / MS_PER_DAY) + 1;
            }
        }

        // Move cursor forward past this employment block.
        const rawEnd = span.end ? span.end : effectiveEnd;
        const spanEndInclusive = rawEnd.getTime() < effectiveEnd.getTime() ? rawEnd : effectiveEnd;
        // cursor becomes the day after employment ends.
        cursor = new Date(spanEndInclusive.getTime() + MS_PER_DAY);
    }

    // Tail unemployment gap after last employment until effectiveEnd.
    if (cursor.getTime() <= effectiveEnd.getTime()) {
        used += Math.ceil((effectiveEnd.getTime() - cursor.getTime()) / MS_PER_DAY) + 1;
    }

    used = Math.max(0, used);
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

