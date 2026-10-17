import { readJobLocation } from './us-location';

/** Oracle's JOBS.LOCATION holds at most 1,000 characters. */
const MAX_LOCATION_LENGTH = 1000;

const US_COUNTRY = /^(?:united states(?: of america)?|usa|us|u\.s\.a?\.?)$/i;

/** True when an ATS country value names the United States. */
export function isUsCountry(country: string): boolean {
  return US_COUNTRY.test(country.trim());
}

type AshbyAddress = {
  postalAddress?: { addressCountry?: unknown } | null;
} | null;

function ashbyCountry(address: unknown): string | null {
  const country = (address as AshbyAddress)?.postalAddress?.addressCountry;
  return typeof country === 'string' && country.trim() ? country.trim() : null;
}

/**
 * Ashby lists a primary location and `secondaryLocations`, each with a
 * structured postal address. The stored location names every place (so the
 * board can match a London + New York job under New York), and the countries
 * feed the eligibility check.
 */
export function ashbyLocations(item: Record<string, unknown>): {
  location: string | null;
  countries: string[];
} {
  const names: string[] = [];
  const countries: string[] = [];
  const add = (name: unknown, address: unknown) => {
    if (typeof name === 'string' && name.trim() && !names.includes(name.trim()))
      names.push(name.trim());
    const country = ashbyCountry(address);
    if (country && !countries.includes(country)) countries.push(country);
  };
  add(item.location, item.address);
  if (Array.isArray(item.secondaryLocations)) {
    for (const secondary of item.secondaryLocations) {
      if (secondary && typeof secondary === 'object') {
        const entry = secondary as Record<string, unknown>;
        add(entry.location, entry.address);
      }
    }
  }
  let location = '';
  for (const name of names) {
    const next = location ? `${location} | ${name}` : name;
    if (next.length > MAX_LOCATION_LENGTH) break;
    location = next;
  }
  return { location: location || null, countries };
}

/**
 * TrackMyOPT lists jobs a person can do in the United States. A job is kept
 * when:
 * - the ATS gives a US country for any of its locations; or
 * - its location text names any US place; or
 * - it names no country at all ("Remote", a school name): hiding those would
 *   drop real US jobs.
 * It is dropped when the ATS countries or the location text name only places
 * outside the US.
 */
export function isUsEligibleJob(job: {
  location: string | null;
  location_countries?: readonly string[];
}): boolean {
  const countries = job.location_countries ?? [];
  if (countries.some(isUsCountry)) return true;
  const scope = readJobLocation(job.location).scope;
  if (scope === 'us') return true;
  if (countries.length) return false;
  return scope !== 'non_us';
}
