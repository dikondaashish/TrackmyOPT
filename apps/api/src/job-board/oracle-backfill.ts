import { createHash } from 'node:crypto';
import type {
  JobDataStore,
  JobStorePage,
  JobStoreRecord,
} from './job-data-store.contract';

export const BACKFILL_MAX_BATCH = 1_000;

/**
 * Canonicalize a timestamp to the precision preserved by the database-neutral
 * Job contract. JavaScript Date stores milliseconds and always serializes in
 * UTC, so equivalent offsets (including Oracle's read-back representation)
 * produce the same value while a real millisecond difference remains visible.
 */
export function canonicalTimestamp(
  value: string | null | undefined,
): string | null {
  if (value == null || value === '') return null;
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    throw new Error('Invalid timestamp in canonical job data');
  }
  return timestamp.toISOString();
}

export type BackfillCheckpoint = {
  sourceIndex: number;
  offset: number;
  processed: number;
  updatedAt: string;
};

export type BackfillSource = { id: string };

export type BackfillResult = {
  processed: number;
  submitted: number;
  verified: number;
  failures: Array<{ sourceId: string; message: string }>;
  checksum: string;
  checkpoint: BackfillCheckpoint;
};

export function parseBackfillLimit(value: string | undefined) {
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1 || limit > BACKFILL_MAX_BATCH) {
    throw new Error(
      `--limit must be an integer between 1 and ${BACKFILL_MAX_BATCH}`,
    );
  }
  return limit;
}

export function parseBackfillCheckpoint(value: unknown): BackfillCheckpoint {
  if (!value || typeof value !== 'object') {
    return {
      sourceIndex: 0,
      offset: 0,
      processed: 0,
      updatedAt: new Date(0).toISOString(),
    };
  }
  const candidate = value as Partial<BackfillCheckpoint>;
  if (
    ![candidate.sourceIndex, candidate.offset, candidate.processed].every(
      (item) => Number.isInteger(item) && Number(item) >= 0,
    )
  ) {
    throw new Error('Invalid backfill checkpoint');
  }
  return {
    sourceIndex: Number(candidate.sourceIndex),
    offset: Number(candidate.offset),
    processed: Number(candidate.processed),
    updatedAt:
      typeof candidate.updatedAt === 'string'
        ? candidate.updatedAt
        : new Date(0).toISOString(),
  };
}

export function canonicalJobHash(job: JobStoreRecord) {
  const fields = [
    job.id,
    job.sourceId,
    job.sourceAts,
    job.boardToken,
    job.externalJobId,
    job.title,
    job.companyName,
    job.location,
    job.department,
    job.description,
    job.jobUrl,
    canonicalTimestamp(job.postedAt),
    canonicalTimestamp(job.updatedAt),
    job.optEligible,
    job.stemOptEligible,
    job.cptEligible,
    job.h1bSponsorStatus,
    canonicalTimestamp(job.createdAt),
    canonicalTimestamp(job.firstSeenAt),
    canonicalTimestamp(job.lastConfirmedAt),
    job.listingStatus,
    job.employerBoardName,
    job.sourceTrustTier,
    job.employerMatchId,
    canonicalTimestamp(job.missingSinceAt),
    canonicalTimestamp(job.removedAt),
  ]
    .map((value) => (value == null ? '' : String(value)))
    .join('\u001f');
  return createHash('sha256').update(fields).digest('hex');
}

export async function runOracleBackfillBatch(options: {
  sources: readonly BackfillSource[];
  checkpoint: BackfillCheckpoint;
  limit: number;
  sourceStore: Pick<JobDataStore, 'listSourceJobsPage'>;
  targetStore: Pick<JobDataStore, 'upsertJobs' | 'getJob'>;
  verifyEveryRow?: boolean;
}): Promise<BackfillResult> {
  const limit = Math.min(
    BACKFILL_MAX_BATCH,
    Math.max(1, Math.floor(options.limit)),
  );
  const failures: Array<{ sourceId: string; message: string }> = [];
  let processed = 0;
  let submitted = 0;
  let verified = 0;
  const hashes: string[] = [];
  let sourceIndex = options.checkpoint.sourceIndex;
  let offset = options.checkpoint.offset;

  while (sourceIndex < options.sources.length && processed < limit) {
    const sourceId = options.sources[sourceIndex].id;
    const pageSize = Math.min(100, limit - processed);
    let page: JobStorePage;
    try {
      page = await options.sourceStore.listSourceJobsPage(
        sourceId,
        offset,
        pageSize,
      );
    } catch (error) {
      failures.push({
        sourceId,
        message:
          error instanceof Error
            ? `source page read failed: ${error.message}`
            : 'source page read failed: unknown backfill failure',
      });
      break;
    }
    if (!page.rows.length) {
      sourceIndex += 1;
      offset = 0;
      continue;
    }
    let pageSucceeded = true;
    try {
      await options.targetStore.upsertJobs(page.rows);
      submitted += page.rows.length;
      for (const row of page.rows) {
        hashes.push(canonicalJobHash(row));
        if (options.verifyEveryRow !== false) {
          const stored = await options.targetStore.getJob(row.id);
          if (!stored || canonicalJobHash(stored) !== canonicalJobHash(row)) {
            throw new Error(`read-back mismatch for job ${row.id}`);
          }
          verified += 1;
        }
      }
    } catch (error) {
      pageSucceeded = false;
      failures.push({
        sourceId,
        message:
          error instanceof Error ? error.message : 'unknown backfill failure',
      });
    }
    if (!pageSucceeded) break;
    processed += page.rows.length;
    offset += page.rows.length;
    if (offset >= page.total) {
      sourceIndex += 1;
      offset = 0;
    }
  }

  const checkpoint: BackfillCheckpoint = {
    sourceIndex,
    offset,
    processed: options.checkpoint.processed + processed,
    updatedAt: new Date().toISOString(),
  };
  return {
    processed,
    submitted,
    verified,
    failures,
    checksum: createHash('sha256')
      .update(hashes.sort().join('\n'))
      .digest('hex'),
    checkpoint,
  };
}
