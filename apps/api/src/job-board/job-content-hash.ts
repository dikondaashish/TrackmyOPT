import { createHash } from 'node:crypto';
import type { JobStoreRecord } from './job-data-store.contract';

/**
 * Change detection for incremental ingestion.
 *
 * The stored value is `v1.<description digest>.<metadata digest>` so the
 * search table (built only from the description) is rewritten only when the
 * description changes, and the job row only when any displayed field does.
 * Salary, workplace, employment type and similar filters are derived from the
 * description and location at query time, so these fields cover them.
 */
export const CONTENT_HASH_VERSION = 'v1';

type HashedFields = Pick<
  JobStoreRecord,
  | 'title'
  | 'companyName'
  | 'location'
  | 'department'
  | 'description'
  | 'jobUrl'
  | 'postedAt'
  | 'employerBoardName'
>;

/** Trim, normalize line endings and Unicode form; empty text becomes null. */
function canonicalText(value: string | null | undefined) {
  if (value == null) return null;
  const text = value.normalize('NFC').replace(/\r\n?/g, '\n').trim();
  return text ? text : null;
}

/** Equal instants hash equally whatever their offset or precision. */
function canonicalInstant(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed)
    ? canonicalText(value)
    : new Date(parsed).toISOString();
}

function sha256(value: string) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function descriptionDigest(description: string | null | undefined) {
  return sha256(canonicalText(description) ?? '');
}

/** Fixed field order (an array, not an object) keeps serialization stable. */
export function metadataDigest(row: HashedFields) {
  return sha256(
    JSON.stringify([
      canonicalText(row.title),
      canonicalText(row.companyName),
      canonicalText(row.location),
      canonicalText(row.department),
      canonicalText(row.jobUrl),
      canonicalInstant(row.postedAt),
      canonicalText(row.employerBoardName),
    ]),
  );
}

export function jobContentHash(row: HashedFields) {
  return `${CONTENT_HASH_VERSION}.${descriptionDigest(row.description)}.${metadataDigest(row)}`;
}

/** Returns null for a missing or unrecognized hash (always treated as changed). */
export function parseContentHash(hash: string | null | undefined) {
  const parts = hash?.split('.');
  if (
    !parts ||
    parts.length !== 3 ||
    parts[0] !== CONTENT_HASH_VERSION ||
    !/^[0-9a-f]{64}$/.test(parts[1]) ||
    !/^[0-9a-f]{64}$/.test(parts[2])
  )
    return null;
  return { description: parts[1], metadata: parts[2] };
}
