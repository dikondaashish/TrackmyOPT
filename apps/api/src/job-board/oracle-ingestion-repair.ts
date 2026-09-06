import { createHash } from 'node:crypto';
import type {
  JobStoreRecord,
  JobStoreVisaSignal,
} from './job-data-store.contract';
import { compareJobRecords } from './job-store-parity';
import { canonicalJobHash } from './oracle-backfill';

export function externalIdentity(row: JobStoreRecord) {
  return JSON.stringify([
    row.sourceId,
    row.sourceAts,
    row.boardToken,
    row.externalJobId,
  ]);
}

export function signalIdentity(row: JobStoreVisaSignal) {
  return JSON.stringify([row.jobId, row.signalType, row.source, row.sourceUrl]);
}

export function signalHash(row: JobStoreVisaSignal) {
  return createHash('sha256')
    .update(
      JSON.stringify([
        row.jobId,
        row.signalType,
        row.evidenceSnippet,
        row.sourceUrl,
        row.observedDate.slice(0, 10),
        Number(row.confidence),
        row.source,
      ]),
    )
    .digest('hex');
}

export function compareIdentityRows(
  source: readonly JobStoreRecord[],
  target: readonly JobStoreRecord[],
) {
  const byIdentity = new Map<string, JobStoreRecord>();
  for (const row of target) {
    const key = externalIdentity(row);
    if (byIdentity.has(key))
      throw new Error('Duplicate target external identity');
    byIdentity.set(key, row);
  }
  const sourceSeen = new Set<string>();
  return source.flatMap((row) => {
    const identity = externalIdentity(row);
    if (sourceSeen.has(identity))
      throw new Error('Duplicate source external identity');
    sourceSeen.add(identity);
    const other = byIdentity.get(identity);
    if (other && canonicalJobHash(row) === canonicalJobHash(other)) return [];
    const fields = other ? compareJobRecords(row, other) : [];
    // No descriptions, evidence snippets, credentials, or raw error text.
    return [
      {
        id: row.id,
        oracleId: other?.id ?? null,
        sourceId: row.sourceId,
        sourceAts: row.sourceAts,
        boardToken: row.boardToken,
        externalJobId: row.externalJobId,
        missing: !other,
        uuid: Boolean(other && row.id !== other.id),
        fields: fields.map((item) => item.field),
        lifecycle: {
          supabase: row.listingStatus,
          oracle: other?.listingStatus ?? null,
        },
        timestamps: fields
          .filter((item) => /At$/.test(item.field))
          .map((item) => ({
            field: item.field,
            supabase: item.left,
            oracle: item.right,
          })),
      },
    ];
  });
}
