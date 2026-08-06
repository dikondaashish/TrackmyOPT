import {
  COMMUNITY_ESTIMATE_SOURCE_NOTE,
  isUsableDuration,
  percentile,
  type TimelineSample,
} from "./estimate";
import { filterMatureRows, parseUtcDate } from "./weekly-trend";

/**
 * Which cohort the numbers came from.
 *
 * `recent` — partner cases filed within days of the user's own filing date.
 * `seasonal` — partner cases filed at the same point of the calendar in earlier
 * years, used when the user's own filing window is still too new to have
 * resolved. The two are not interchangeable and the UI must say which it shows.
 */
export type SimilarFilingBasis = "recent" | "seasonal";

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

/** Rows filed within `windowDays` of any anchor, or null if too few. */
function collect(
  segment: TimelineSample[],
  anchors: number[],
  windowDays: number
): Cohort | null {
  const days: number[] = [];
  const years = new Set<number>();
  let minMs = Number.POSITIVE_INFINITY;
  let maxMs = Number.NEGATIVE_INFINITY;

  for (const row of segment) {
    if (!isUsableDuration(row.days_to_approval)) continue;
    const filedMs = parseUtcDate(row.init_date);
    if (filedMs === null) continue;
    const inWindow = anchors.some(
      (anchor) => Math.abs(filedMs - anchor) / DAY_MS <= windowDays
    );
    if (!inWindow) continue;

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

/**
 * Community peers who filed around the user's date.
 *
 * Uses partner timelines only (opt-tracker / opt-pulse) — never USCIS receipt
 * neighbor scanning. The maturity filter applies first: a filing week younger
 * than the cohort's own p75 contains nothing but its fastest approvals, so
 * including it would understate the wait.
 *
 * That filter is why there are two tiers. A pending case is by definition
 * recent, so for the first few months of a wait the user's own filing window is
 * entirely immature and a same-window match returns nothing. Rather than show a
 * permanently empty card, fall back to the same calendar window in earlier
 * years — long since resolved, and the seasonality it captures is the part of
 * filing-date matching that actually carries signal.
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

  const tiers: Array<{ basis: SimilarFilingBasis; anchors: number[] }> = [
    { basis: "recent", anchors: [centerMs] },
    {
      basis: "seasonal",
      anchors: SEASON_LOOKBACK_YEARS.map((y) => shiftYears(centerMs, y)),
    },
  ];

  for (const { basis, anchors } of tiers) {
    for (const windowDays of WINDOWS) {
      const cohort = collect(segment, anchors, windowDays);
      if (!cohort) continue;

      const sorted = cohort.days.sort((a, b) => a - b);
      return {
        basis,
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
