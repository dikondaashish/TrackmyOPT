import {
  calendarDateISO,
  employmentWindowStats,
  estimatedStemEndISO,
  localTodayISO,
} from '@/lib/immigration/calendar-days';
import {
  addDays,
  calculateUnemploymentDays,
  formatDate,
  isoToMMDDYYYY,
} from '@/lib/immigration/opt-calculations';

export interface EmploymentSpan {
  id: string;
  employer_name: string;
  employer_domain?: string | null;
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
  const from = calendarDateISO(start);
  const to = end ? calendarDateISO(end) : localTodayISO();
  if (!from || !to) return '—';
  const days = Math.max(0, (Date.parse(to) - Date.parse(from)) / 86400000 + 1);
  if (days < 30) return days + ' days';
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months + ' month' + (months > 1 ? 's' : '');
  }
  return Math.floor(days / 365) + 'y ' + Math.floor((days % 365) / 30) + 'm';
}

export function toEmploymentInputDate(
  value: string | null | undefined
): string {
  const iso = value ? calendarDateISO(value) : null;
  return iso ? isoToMMDDYYYY(iso) : '';
}

export function mapEmploymentSpans(raw: EmploymentSpan[]): EmploymentSpan[] {
  return raw.map((s) => ({ ...s, is_current: s.is_current ?? !s.end_date }));
}

export function computeEmploymentStats(
  spans: EmploymentSpan[],
  optStartDate: string | undefined,
  optEndDate: string | undefined,
  stemStartDate?: string,
  asOfISO = localTodayISO(),
  stemEndDate?: string
): EmploymentStats {
  const start = optStartDate ? calendarDateISO(optStartDate) : null;
  const end = optEndDate ? calendarDateISO(optEndDate) : null;
  if (!start || !end) return EMPTY_EMPLOYMENT_STATS;
  const stem = stemStartDate ? calendarDateISO(stemStartDate) : null;
  const activeStem = stem && stem <= asOfISO ? stem : null;
  const confirmedStemEnd = stemEndDate ? calendarDateISO(stemEndDate) : null;
  const initialEnd = stem ? [end, addDays(stem, -1)].sort()[0] : end;
  const initial = employmentWindowStats(start, initialEnd, spans, asOfISO);
  const extension = activeStem
    ? employmentWindowStats(
        activeStem,
        confirmedStemEnd ?? estimatedStemEndISO(activeStem),
        spans,
        asOfISO
      )
    : null;
  const continuous =
    activeStem && Date.parse(activeStem) === Date.parse(initialEnd) + 86400000
      ? employmentWindowStats(
          start,
          confirmedStemEnd ?? estimatedStemEndISO(activeStem),
          spans,
          asOfISO
        )
      : null;
  // Same authoritative count as the summary. Employment unions are counted
  // separately per authorization, so overlapping jobs cannot erase gaps.
  const compliance = calculateUnemploymentDays(
    start,
    end,
    spans,
    stem,
    confirmedStemEnd,
    asOfISO
  );
  return {
    totalEmployedDays:
      initial.totalEmployedDays + (extension?.totalEmployedDays || 0),
    totalUnemployedDays: compliance.used,
    longestGap:
      continuous?.longestGap ??
      Math.max(initial.longestGap, extension?.longestGap || 0),
    currentStreak: (continuous || extension || initial).currentStreak,
  };
}
