import { parseOptDateInput } from '@/lib/immigration/opt-dates-page-utils';
import { formatDate } from '@/lib/immigration/opt-calculations';

export interface EmploymentSpan {
  id: string;
  employer_name: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  job_title?: string;
  location?: string;
}

export interface EmploymentStats {
  totalEmployedDays: number;
  totalUnemployedDays: number;
  currentStreak: number;
  longestGap: number;
}

export const EMPTY_EMPLOYMENT_STATS: EmploymentStats = {
  totalEmployedDays: 0,
  totalUnemployedDays: 0,
  currentStreak: 0,
  longestGap: 0,
};

export { formatDate as formatEmploymentDate };

export function calculateEmploymentDuration(
  start: string,
  end: string | null
): string {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days < 30) return `${days} days`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);
  return `${years}y ${remainingMonths}m`;
}

export function toEmploymentInputDate(
  dateStr: string | null | undefined
): string {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${month}/${day}/${year}`;
}

export function mapEmploymentSpans(raw: EmploymentSpan[]): EmploymentSpan[] {
  return raw.map((s) => ({
    ...s,
    is_current: s.is_current ?? !s.end_date,
  }));
}

export function computeEmploymentStats(
  spans: EmploymentSpan[],
  optStartDate: string | undefined,
  optEndDate: string | undefined
): EmploymentStats {
  if (!optStartDate) return EMPTY_EMPLOYMENT_STATS;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const optStart = parseOptDateInput(optStartDate);
  if (!optStart) return EMPTY_EMPLOYMENT_STATS;

  const optEndParsed = optEndDate ? parseOptDateInput(optEndDate) : null;
  const optEnd = optEndParsed ?? today;
  const effectiveEnd = optEnd < today ? optEnd : today;

  const sortedSpans = [...spans].sort(
    (a, b) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  let totalEmployed = 0;
  let longestGap = 0;
  let lastEndDate = optStart;

  sortedSpans.forEach((span) => {
    const spanStart = new Date(span.start_date);
    const spanEnd = span.end_date ? new Date(span.end_date) : today;

    if (spanStart > lastEndDate) {
      const gapDays = Math.ceil(
        (spanStart.getTime() - lastEndDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (gapDays > longestGap) longestGap = gapDays;
    }

    const effectiveSpanEnd = spanEnd < effectiveEnd ? spanEnd : effectiveEnd;
    const effectiveSpanStart = spanStart > optStart ? spanStart : optStart;
    if (effectiveSpanEnd > effectiveSpanStart) {
      totalEmployed += Math.ceil(
        (effectiveSpanEnd.getTime() - effectiveSpanStart.getTime()) /
          (1000 * 60 * 60 * 24)
      );
    }

    if (spanEnd > lastEndDate) lastEndDate = spanEnd;
  });

  if (lastEndDate < effectiveEnd) {
    const finalGapDays = Math.ceil(
      (effectiveEnd.getTime() - lastEndDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (finalGapDays > longestGap) longestGap = finalGapDays;
  }

  const currentSpan = sortedSpans.find((s) => {
    if (!s.is_current) return false;
    const start = new Date(s.start_date);
    const end = s.end_date ? new Date(s.end_date) : null;
    return start <= today && (!end || end >= today);
  });
  let currentStreak = 0;
  if (currentSpan) {
    currentStreak = Math.ceil(
      (today.getTime() - new Date(currentSpan.start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    );
  } else {
    const endedSpans = sortedSpans
      .map((s) => (s.end_date ? new Date(s.end_date) : null))
      .filter((d): d is Date => !!d && d <= today);

    const lastEmploymentEnd =
      endedSpans.length > 0
        ? new Date(Math.max(...endedSpans.map((d) => d.getTime())))
        : optStart;

    currentStreak = Math.max(
      0,
      Math.ceil(
        (today.getTime() - lastEmploymentEnd.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
  }

  const totalOPTDays = Math.max(
    0,
    Math.ceil(
      (effectiveEnd.getTime() - optStart.getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  const totalUnemployed = Math.max(0, totalOPTDays - totalEmployed);

  return {
    totalEmployedDays: totalEmployed,
    totalUnemployedDays: totalUnemployed,
    currentStreak,
    longestGap,
  };
}
