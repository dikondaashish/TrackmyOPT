import type {
  JobDataStore,
  JobStoreRecord,
  JobStoreSearch,
} from './job-data-store.contract';
import { createHash } from 'node:crypto';
import { canonicalTimestamp } from './oracle-backfill';

export type JobStoreParityMismatch = {
  kind: 'count' | 'identity' | 'field' | 'missing' | 'order';
  jobId?: string;
  field?: keyof JobStoreRecord;
  left?: string | number | boolean | null;
  right?: string | number | boolean | null;
};

export type JobStoreParityResult = {
  matched: boolean;
  leftCount: number;
  rightCount: number;
  mismatches: JobStoreParityMismatch[];
};

const COMPARED_FIELDS: readonly (keyof JobStoreRecord)[] = [
  'id',
  'sourceId',
  'sourceAts',
  'boardToken',
  'externalJobId',
  'title',
  'companyName',
  'location',
  'department',
  'description',
  'jobUrl',
  'postedAt',
  'updatedAt',
  'optEligible',
  'stemOptEligible',
  'cptEligible',
  'h1bSponsorStatus',
  'createdAt',
  'firstSeenAt',
  'lastConfirmedAt',
  'listingStatus',
  'employerBoardName',
  'sourceTrustTier',
  'employerMatchId',
  'missingSinceAt',
  'removedAt',
];

const TIMESTAMP_FIELDS = new Set<keyof JobStoreRecord>([
  'postedAt',
  'updatedAt',
  'createdAt',
  'firstSeenAt',
  'lastConfirmedAt',
  'missingSinceAt',
  'removedAt',
]);

function comparableField(job: JobStoreRecord, field: keyof JobStoreRecord) {
  if (TIMESTAMP_FIELDS.has(field))
    return canonicalTimestamp(job[field] as string | null);
  // Include the full CLOB in verification without exposing its content.
  if (field === 'description')
    return job.description == null
      ? null
      : createHash('sha256').update(job.description).digest('hex');
  return comparable(job[field]);
}

function comparable(value: unknown) {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  return JSON.stringify(value);
}

export function compareJobRecords(left: JobStoreRecord, right: JobStoreRecord) {
  return COMPARED_FIELDS.flatMap((field) => {
    const leftValue = comparableField(left, field);
    const rightValue = comparableField(right, field);
    return leftValue === rightValue
      ? []
      : [
          {
            kind: 'field' as const,
            jobId: left.id,
            field,
            left: leftValue,
            right: rightValue,
          },
        ];
  });
}

export async function compareJobStorePage(
  left: Pick<JobDataStore, 'listJobs'>,
  right: Pick<JobDataStore, 'listJobs'>,
  query: JobStoreSearch,
): Promise<JobStoreParityResult> {
  const [leftPage, rightPage] = await Promise.all([
    left.listJobs(query),
    right.listJobs(query),
  ]);
  const mismatches: JobStoreParityMismatch[] = [];
  if (leftPage.total !== rightPage.total) {
    mismatches.push({
      kind: 'count',
      left: leftPage.total,
      right: rightPage.total,
    });
  }
  const rightById = new Map(rightPage.rows.map((row) => [row.id, row]));
  for (const row of leftPage.rows) {
    const counterpart = rightById.get(row.id);
    if (!counterpart) {
      mismatches.push({ kind: 'missing', jobId: row.id });
      continue;
    }
    mismatches.push(...compareJobRecords(row, counterpart));
  }
  for (const row of rightPage.rows) {
    if (!leftPage.rows.some((candidate) => candidate.id === row.id)) {
      mismatches.push({ kind: 'identity', jobId: row.id });
    }
  }
  leftPage.rows.forEach((row, index) => {
    const rightId = rightPage.rows[index]?.id;
    if (rightId && rightId !== row.id)
      mismatches.push({
        kind: 'order',
        jobId: row.id,
        left: row.id,
        right: rightId,
      });
  });
  return {
    matched: mismatches.length === 0,
    leftCount: leftPage.total,
    rightCount: rightPage.total,
    mismatches,
  };
}

export async function compareJobStoreDetail(
  left: Pick<JobDataStore, 'getJob'>,
  right: Pick<JobDataStore, 'getJob'>,
  jobId: string,
) {
  const [leftJob, rightJob] = await Promise.all([
    left.getJob(jobId),
    right.getJob(jobId),
  ]);
  if (!leftJob || !rightJob) {
    if (!leftJob && !rightJob) return { matched: true, mismatches: [] };
    return {
      matched: false,
      mismatches: [{ kind: 'missing' as const, jobId }],
    };
  }
  const mismatches = compareJobRecords(leftJob, rightJob);
  return { matched: mismatches.length === 0, mismatches };
}
