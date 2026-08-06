import {
  COMMUNITY_ESTIMATE_SOURCE_NOTE,
  isUsableDuration,
  percentile,
  type TimelineSample,
} from "./estimate";
import { filterMatureRows, parseUtcDate } from "./weekly-trend";

/**
 * Which cohort the numbers came from. Each tier is a weaker claim than the one
 * before it, and the UI has to say which one it is showing.
 *
 * `recent`   — partner cases filed within days of the user's own filing date.
 * `seasonal` — cases filed at the same point of the calendar in earlier years.
 * `latest`   — the most recent filing weeks that have finished processing.
 *              Not the user's peers at all: a current-throughput benchmark,
 *              used when neither of the above has enough resolved reports.
 */
export type SimilarFilingBasis = "recent" | "seasonal" | "latest";

export type SimilarFilingPeers = {
  basis: SimilarFilingBasis;
  /** Days either side of the anchor date that were needed to clear the sample floor. */
  windowDays: number;
  sampleSize: number;
  medianDays: number;
  p25Days: number;
  p75Days: number;
  /** Observed inclusive span of contributing filing dates, ISO. Reported from
   *  the rows themselves rather than from the requested window, so a window
   *  partly removed by the maturity filter can't be overstated. */
  windowRange: [string, string];
  /** Filing years represented, newest first. Only meaningful for `seasonal`. */
  seasonYears: number[];
  sourceNote: string;
};

const WINDOWS = [7, 14, 21] as const;
/** How far back to look for the same calendar window. Partner history is a few
 *  years at most, and older seasons stop resembling current USCIS throughput. */
const SEASON_LOOKBACK_YEARS = [1, 2, 3] as const;
/** Below this a median is noise. Separate from the estimate cohort floor so the
 *  two can move independently. */
export const MIN_PEER_SAMPLE = 15;
const DAY_MS = 86_400_000;

/** Inclusive epoch-ms bounds on filing date. */
type Range = [number, number];

function toIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Same calendar position, `years` earlier. Feb 29 normalises into Mar 1, which
 *  the surrounding window absorbs. */
function shiftYears(ms: number, years: number): number {
  const d = new Date(ms);
  d.setUTCFullYear(d.getUTCFullYear() - years);
  return d.getTime();
}

type Cohort = {
  days: number[];
  minIso: string;
  maxIso: string;
  years: number[];
};

/** Rows whose filing date falls in any range, or null if too few. */
function collect(segment: TimelineSample[], ranges: Range[]): Cohort | null {
  if (!ranges.length) return null;

  const days: number[] = [];
  const years = new Set<number>();
  let minMs = Number.POSITIVE_INFINITY;
  let maxMs = Number.NEGATIVE_INFINITY;

  for (const row of segment) {
    if (!isUsableDuration(row.days_to_approval)) continue;
    const filedMs = parseUtcDate(row.init_date);
    if (filedMs === null) continue;
    if (!ranges.some(([lo, hi]) => filedMs >= lo && filedMs <= hi)) continue;

    days.push(row.days_to_approval);
    years.add(new Date(filedMs).getUTCFullYear());
    if (filedMs < minMs) minMs = filedMs;
    if (filedMs > maxMs) maxMs = filedMs;
  }

  if (days.length < MIN_PEER_SAMPLE) return null;
  return {
    days,
    minIso: toIso(minMs),
    maxIso: toIso(maxMs),
    years: [...years].sort((a, b) => b - a),
  };
}

/** Newest filing date in the pool that has actually resolved. */
function latestResolvedFiling(segment: TimelineSample[]): number | null {
  let latest: number | null = null;
  for (const row of segment) {
    if (!isUsableDuration(row.days_to_approval)) continue;
    const ms = parseUtcDate(row.init_date);
    if (ms === null) continue;
    if (latest === null || ms > latest) latest = ms;
  }
  return latest;
}

/**
 * Community peers who filed around the user's date.
 *
 * Uses partner timelines only (opt-tracker / opt-pulse) — never USCIS receipt
 * neighbor scanning. The maturity filter applies first: a filing week younger
 * than the cohort's own p75 contains nothing but its fastest approvals, so
 * including it would understate the wait.
 *
 * That filter is why there are three tiers. A pending case is by definition
 * recent, so for the first few months of a wait the user's own filing window is
 * entirely immature and a same-window match returns nothing. Falling back to
 * the same calendar window in earlier years keeps the filing-date claim intact
 * where the history supports it; failing that, the most recent weeks that have
 * finished processing at least describe current throughput. Each tier is a
 * weaker statement than the last, so they are tried in order and the caller is
 * told which one answered.
 */
export function buildSimilarFilingPeers(
  rows: TimelineSample[],
  opts: {
    receivedDate: string | null;
    premiumProcessing: boolean;
    nowMs?: number;
  }
): SimilarFilingPeers | null {
  const centerMs = parseUtcDate(opts.receivedDate);
  if (centerMs === null) return null;

  const segment = filterMatureRows(
    rows.filter((r) => r.premium_processing === opts.premiumProcessing),
    opts.nowMs
  );
  const latestMs = latestResolvedFiling(segment);

  const tiers: Array<{
    basis: SimilarFilingBasis;
    ranges: (windowDays: number) => Range[];
  }> = [
    {
      basis: "recent",
      ranges: (w) => [[centerMs - w * DAY_MS, centerMs + w * DAY_MS]],
    },
    {
      basis: "seasonal",
      ranges: (w) =>
        SEASON_LOOKBACK_YEARS.map((y) => {
          const anchor = shiftYears(centerMs, y);
          return [anchor - w * DAY_MS, anchor + w * DAY_MS] as Range;
        }),
    },
    {
      // Trailing span ending at the newest resolved filing, so this never
      // reaches forward into weeks the maturity filter just excluded.
      basis: "latest",
      ranges: (w) =>
        latestMs === null ? [] : [[latestMs - 2 * w * DAY_MS, latestMs]],
    },
  ];

  for (const tier of tiers) {
    for (const windowDays of WINDOWS) {
      const cohort = collect(segment, tier.ranges(windowDays));
      if (!cohort) continue;

      const sorted = cohort.days.sort((a, b) => a - b);
      return {
        basis: tier.basis,
        windowDays,
        sampleSize: sorted.length,
        medianDays: percentile(sorted, 0.5),
        p25Days: percentile(sorted, 0.25),
        p75Days: percentile(sorted, 0.75),
        windowRange: [cohort.minIso, cohort.maxIso],
        seasonYears: cohort.years,
        sourceNote: COMMUNITY_ESTIMATE_SOURCE_NOTE,
      };
    }
  }

  return null;
}
