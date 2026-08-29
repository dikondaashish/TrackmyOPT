import {
  calculateUnemploymentDays,
  type EmploymentSpan,
} from '@/lib/immigration/opt-calculations';

export type StoredOptStatus = {
  opt_start_date: string | null;
  opt_ead_end_date: string | null;
  stem_start_date: string | null;
};

export type RunwayContext = {
  remaining: number;
  used: number;
  max: 90 | 150;
  phase: 'initial' | 'stem';
  stemActive: boolean;
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Read-only view of the existing OPT tracker. Job-board activity is never an
 * input: only saved OPT dates and employment spans affect this calculation.
 */
export function getRunwayContext(
  optStatus: StoredOptStatus | null,
  employmentSpans: EmploymentSpan[],
  asOf = new Date(),
): RunwayContext | null {
  if (!optStatus?.opt_start_date || !optStatus.opt_ead_end_date) return null;

  const asOfDate = isoDate(asOf);
  if (optStatus.opt_start_date > asOfDate) return null;

  const calculation = calculateUnemploymentDays(
    optStatus.opt_start_date,
    optStatus.opt_ead_end_date,
    employmentSpans,
    optStatus.stem_start_date,
    undefined,
    asOfDate,
  );

  if (calculation.phase === 'post') return null;

  return {
    remaining: calculation.remaining,
    used: calculation.used,
    max: calculation.max,
    phase: calculation.phase,
    stemActive: calculation.stemActive,
  };
}

export function isRecentlyPosted(firstSeenAt: string, asOf = new Date()) {
  const firstSeen = new Date(firstSeenAt).getTime();
  const now = asOf.getTime();
  const ageMs = now - firstSeen;
  return ageMs >= 0 && ageMs <= 7 * 24 * 60 * 60 * 1000;
}

export function isHighPriorityThisWeek(runway: RunwayContext | null) {
  return Boolean(runway && runway.remaining <= 30);
}
