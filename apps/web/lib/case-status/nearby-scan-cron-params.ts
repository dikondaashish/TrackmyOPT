import { DEFAULT_COHORT_RANGE, MAX_COHORT_RANGE } from "./receipt-cohort";

const DEFAULT_CENTERS_PER_RUN = 5;
const MIN_CENTERS_PER_RUN = 1;
const MAX_CENTERS_PER_RUN = 20;

const MIN_SCAN_RANGE = 1;

type NearbyScanCronParams = {
  centers: number;
  range: number;
};

function clampInt(
  raw: string | null,
  defaultVal: number,
  min: number,
  max: number
): number {
  if (raw === null || raw.trim() === "") return defaultVal;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return defaultVal;
  return Math.min(max, Math.max(min, n));
}

/** Parse and clamp `?centers=` / `?range=` query params for the cron scanner. */
export function parseNearbyScanCronParams(
  searchParams: URLSearchParams
): NearbyScanCronParams {
  return {
    centers: clampInt(
      searchParams.get("centers"),
      DEFAULT_CENTERS_PER_RUN,
      MIN_CENTERS_PER_RUN,
      MAX_CENTERS_PER_RUN
    ),
    range: clampInt(
      searchParams.get("range"),
      DEFAULT_COHORT_RANGE,
      MIN_SCAN_RANGE,
      MAX_COHORT_RANGE
    ),
  };
}
