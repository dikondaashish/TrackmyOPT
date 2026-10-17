import type { JobStorePlaceFacet } from './job-data-store.contract';
import { jobPlaceKeys, placeLabel, readJobLocation } from './us-location';

/**
 * Location text is free-form, so the store cannot match places in SQL. It
 * reads every distinct open-job location once (about 1,800 values for 12,000
 * jobs) and filters by the exact strings that name a place or a country.
 */
export type JobLocationIndex = {
  /** Locations that name only places outside the United States. */
  nonUs: string[];
  /** Place key -> the exact location strings that name it. */
  byPlace: Map<string, string[]>;
  /** Every US state, city and remote option with its open-job count. */
  places: JobStorePlaceFacet[];
};

export function buildJobLocationIndex(
  rows: ReadonlyArray<{ location: string; count: number }>,
): JobLocationIndex {
  const nonUs: string[] = [];
  const byPlace = new Map<string, string[]>();
  const counts = new Map<string, number>();
  for (const { location, count } of rows) {
    const info = readJobLocation(location);
    if (info.scope === 'non_us') {
      nonUs.push(location);
      continue;
    }
    for (const key of jobPlaceKeys(info)) {
      const locations = byPlace.get(key) ?? [];
      locations.push(location);
      byPlace.set(key, locations);
      counts.set(key, (counts.get(key) ?? 0) + count);
    }
  }
  const places: JobStorePlaceFacet[] = [];
  for (const [key, count] of counts) {
    const label = placeLabel(key);
    if (label) places.push({ key, ...label, count });
  }
  places.sort(
    (left, right) =>
      right.count - left.count || left.label.localeCompare(right.label, 'en'),
  );
  return { nonUs, byPlace, places };
}

export type JobLocationFilter = {
  /** Exclude jobs whose location is one of these. */
  excluded?: string[];
  /** Keep only jobs whose location is one of these. */
  included?: string[];
};

/** The location strings a search must exclude or match, if any. */
export function jobLocationFilter(
  index: JobLocationIndex,
  options: { country?: 'us' | 'all'; places?: readonly string[] },
): JobLocationFilter | undefined {
  const filter: JobLocationFilter = {};
  if (options.country === 'us') filter.excluded = index.nonUs;
  if (options.places?.length) {
    filter.included = [
      ...new Set(options.places.flatMap((key) => index.byPlace.get(key) ?? [])),
    ];
  }
  return filter.excluded || filter.included ? filter : undefined;
}
