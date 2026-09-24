import 'server-only';

import { parseI765ObservedTrends } from './i765-observed-trends';
import type { I765ObservedTrends } from './i765-observed-trends';

const UPSTREAM_URL =
  'https://api.mycaseshub.com/uscis-processing/processing-time-summary?form=I-765';

export async function getI765ObservedTrends(): Promise<I765ObservedTrends | null> {
  try {
    const response = await fetch(UPSTREAM_URL, {
      next: { revalidate: 6 * 60 * 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (
      !response.ok ||
      Number(response.headers.get('content-length') ?? 0) > 100_000
    )
      return null;
    return parseI765ObservedTrends(await response.json());
  } catch {
    // Supplemental context must never block USCIS status or OPT comparisons.
    return null;
  }
}
