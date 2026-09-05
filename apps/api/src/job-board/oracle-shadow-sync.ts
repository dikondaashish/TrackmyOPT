import type { JobDataStore, JobStoreRecord } from './job-data-store.contract';
import { resolveJobDataStore } from './job-data-store.config';

/**
 * Keep this projection in lockstep with the database-neutral job contract.
 * The shadow command must never pull descriptions or unrelated columns by
 * accident, and it must never use a wildcard projection.
 */
export const SHADOW_SYNC_JOB_COLUMNS = [
  'id',
  'source_id',
  'source_ats',
  'board_token',
  'external_job_id',
  'title',
  'company_name',
  'location',
  'department',
  'description',
  'job_url',
  'posted_at',
  'updated_at',
  'opt_eligible',
  'stem_opt_eligible',
  'cpt_eligible',
  'h1b_sponsor_status',
  'created_at',
  'first_seen_at',
  'last_confirmed_at',
  'listing_status',
  'employer_board_name',
  'source_trust_tier',
  'employer_match_id',
  'missing_since_at',
  'removed_at',
].join(', ');

export const SHADOW_SYNC_MAX_LIMIT = 100;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type SupabaseJobRow = {
  id: string;
  source_id: string;
  source_ats: string;
  board_token: string;
  external_job_id: string;
  title: string;
  company_name: string;
  location: string | null;
  department: string | null;
  description: string | null;
  job_url: string | null;
  posted_at: string | null;
  updated_at: string;
  opt_eligible: boolean | null;
  stem_opt_eligible: boolean | null;
  cpt_eligible: boolean | null;
  h1b_sponsor_status: string | null;
  created_at: string;
  first_seen_at: string;
  last_confirmed_at: string;
  listing_status: string;
  employer_board_name: string | null;
  source_trust_tier: string;
  employer_match_id: string | null;
  missing_since_at: string | null;
  removed_at: string | null;
};

type SupabasePage = {
  data: readonly SupabaseJobRow[] | null;
  error: { message: string } | null;
};

export type SupabaseJobsPageFetcher = (
  from: number,
  to: number,
) => Promise<SupabasePage>;

/** Minimal read-only surface used by the command; no write methods exist here. */
export type SupabaseJobsReader = {
  from(table: 'jobs'): {
    select(columns: string): {
      eq(
        column: string,
        value: string,
      ): {
        eq(
          column: string,
          value: string,
        ): {
          eq(
            column: string,
            value: string,
          ): {
            order(
              column: string,
              options: { ascending: boolean },
            ): {
              range(from: number, to: number): Promise<SupabasePage>;
            };
          };
        };
      };
    };
  };
};

export type ShadowSyncArgs = {
  sourceId: string;
  limit: number;
  write: true;
  verifyIdempotence: boolean;
};

export type ShadowSyncResult = {
  selectedRows: number;
  rowsSubmitted: number;
  rowsVerified: number;
  idempotenceRowsVerified: number;
  mismatches: number;
  idempotenceChecked: boolean;
  idempotenceVerified: boolean;
  capped: boolean;
};

export class ShadowSyncError extends Error {
  constructor(
    readonly code:
      | 'invalid_arguments'
      | 'supabase_read_failed'
      | 'invalid_source_row'
      | 'oracle_health_failed'
      | 'oracle_upsert_failed'
      | 'oracle_readback_missing'
      | 'oracle_readback_mismatch'
      | 'oracle_idempotence_failed',
    message: string,
  ) {
    super(message);
    this.name = 'ShadowSyncError';
  }
}

/** Prevent a shadow command from ever running alongside an Oracle production flag. */
export function assertSupabaseProductionStore(value: unknown) {
  if (resolveJobDataStore(value) !== 'supabase') {
    throw new ShadowSyncError(
      'invalid_arguments',
      'JOB_DATA_STORE must remain supabase while shadow sync runs',
    );
  }
}

function requireOptionValue(
  argv: readonly string[],
  index: number,
  name: string,
) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new ShadowSyncError('invalid_arguments', `${name} requires a value`);
  }
  return value;
}

export function parseShadowSyncArgs(argv: readonly string[]): ShadowSyncArgs {
  let sourceId: string | undefined;
  let limit: number | undefined;
  let write = false;
  let verifyIdempotence = false;

  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === '--source-id') {
      sourceId = requireOptionValue(argv, index, '--source-id');
      index += 1;
    } else if (option === '--limit') {
      const value = requireOptionValue(argv, index, '--limit');
      limit = Number(value);
      index += 1;
    } else if (option === '--write') {
      write = true;
    } else if (option === '--verify-idempotence') {
      verifyIdempotence = true;
    } else {
      throw new ShadowSyncError(
        'invalid_arguments',
        `Unknown option ${option}`,
      );
    }
  }

  if (!sourceId) {
    throw new ShadowSyncError('invalid_arguments', '--source-id is required');
  }
  if (!UUID_PATTERN.test(sourceId)) {
    throw new ShadowSyncError(
      'invalid_arguments',
      '--source-id must be a UUID',
    );
  }
  if (limit === undefined) {
    throw new ShadowSyncError('invalid_arguments', '--limit is required');
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > SHADOW_SYNC_MAX_LIMIT) {
    throw new ShadowSyncError(
      'invalid_arguments',
      `--limit must be an integer from 1 to ${SHADOW_SYNC_MAX_LIMIT}`,
    );
  }
  if (!write) {
    throw new ShadowSyncError(
      'invalid_arguments',
      '--write is required; the shadow command never runs implicitly',
    );
  }

  return { sourceId, limit, write: true, verifyIdempotence };
}

function isIsoDate(value: string | null, required: boolean) {
  return value === null ? !required : Number.isFinite(Date.parse(value));
}

function assertSourceRow(row: SupabaseJobRow, sourceId: string) {
  if (
    !row.id ||
    !UUID_PATTERN.test(row.id) ||
    row.source_id !== sourceId ||
    !row.source_ats ||
    !row.board_token ||
    !row.external_job_id ||
    !row.title ||
    !row.company_name ||
    row.listing_status !== 'open' ||
    row.source_trust_tier !== 'verified_ats' ||
    !isIsoDate(row.posted_at, false) ||
    !isIsoDate(row.updated_at, true) ||
    !isIsoDate(row.created_at, true) ||
    !isIsoDate(row.first_seen_at, true) ||
    !isIsoDate(row.last_confirmed_at, true) ||
    !isIsoDate(row.missing_since_at, false) ||
    !isIsoDate(row.removed_at, false)
  ) {
    throw new ShadowSyncError(
      'invalid_source_row',
      'Supabase returned a row outside the controlled open verified source batch',
    );
  }
}

export function mapSupabaseJob(
  row: SupabaseJobRow,
  sourceId = row.source_id,
): JobStoreRecord {
  assertSourceRow(row, sourceId);
  return {
    id: row.id,
    sourceId: row.source_id,
    sourceAts: row.source_ats,
    boardToken: row.board_token,
    externalJobId: row.external_job_id,
    title: row.title,
    companyName: row.company_name,
    location: row.location,
    department: row.department,
    description: row.description,
    jobUrl: row.job_url,
    postedAt: row.posted_at,
    updatedAt: row.updated_at,
    optEligible: row.opt_eligible,
    stemOptEligible: row.stem_opt_eligible,
    cptEligible: row.cpt_eligible,
    h1bSponsorStatus: row.h1b_sponsor_status,
    createdAt: row.created_at,
    firstSeenAt: row.first_seen_at,
    lastConfirmedAt: row.last_confirmed_at,
    listingStatus: 'open',
    employerBoardName: row.employer_board_name,
    sourceTrustTier: 'verified_ats',
    employerMatchId: row.employer_match_id,
    missingSinceAt: row.missing_since_at,
    removedAt: row.removed_at,
  };
}

export function createSupabaseJobsPageFetcher(
  supabase: SupabaseJobsReader,
  sourceId: string,
): SupabaseJobsPageFetcher {
  return async (from, to) => {
    const result = await supabase
      .from('jobs')
      .select(SHADOW_SYNC_JOB_COLUMNS)
      .eq('source_id', sourceId)
      .eq('listing_status', 'open')
      .eq('source_trust_tier', 'verified_ats')
      .order('id', { ascending: true })
      .range(from, to);
    return {
      data: result.data || [],
      error: result.error,
    };
  };
}

async function readBatch(
  fetchPage: SupabaseJobsPageFetcher,
  sourceId: string,
  limit: number,
) {
  const rows: JobStoreRecord[] = [];
  const seenIds = new Set<string>();
  const seenIdentities = new Set<string>();
  const pageSize = Math.min(50, limit);

  for (let from = 0; from < limit; from += pageSize) {
    const requested = Math.min(pageSize, limit - from);
    const page = await fetchPage(from, from + requested - 1);
    if (page.error) {
      throw new ShadowSyncError(
        'supabase_read_failed',
        'Supabase job read failed',
      );
    }
    for (const row of page.data || []) {
      if (seenIds.has(row.id)) {
        throw new ShadowSyncError(
          'invalid_source_row',
          'Supabase returned duplicate job identities in the controlled batch',
        );
      }
      const identity = `${row.source_ats}\u0000${row.board_token}\u0000${row.external_job_id}`;
      if (seenIdentities.has(identity)) {
        throw new ShadowSyncError(
          'invalid_source_row',
          'Supabase returned duplicate source/external identities in the controlled batch',
        );
      }
      seenIds.add(row.id);
      seenIdentities.add(identity);
      rows.push(mapSupabaseJob(row, sourceId));
    }
    if ((page.data || []).length < requested) break;
  }

  return { rows, capped: rows.length === limit };
}

const DATE_FIELDS = new Set([
  'postedAt',
  'updatedAt',
  'createdAt',
  'firstSeenAt',
  'lastConfirmedAt',
  'missingSinceAt',
  'removedAt',
]);

const SHARED_FIELDS: Array<keyof JobStoreRecord> = [
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

function comparableValue(field: keyof JobStoreRecord, value: unknown) {
  if (value === null || value === undefined) return null;
  if (DATE_FIELDS.has(field)) {
    const text =
      typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : JSON.stringify(value);
    const parsed = Date.parse(text);
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : text;
  }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  return JSON.stringify(value);
}

export function compareSharedJobFields(
  expected: JobStoreRecord,
  actual: JobStoreRecord,
) {
  return SHARED_FIELDS.filter(
    (field) =>
      comparableValue(field, expected[field]) !==
      comparableValue(field, actual[field]),
  );
}

async function verifyRows(
  store: Pick<JobDataStore, 'getJob'>,
  rows: readonly JobStoreRecord[],
  missingCode: 'oracle_readback_missing' | 'oracle_idempotence_failed',
): Promise<number> {
  let verified = 0;
  for (const expected of rows) {
    let actual: JobStoreRecord | null;
    try {
      actual = await store.getJob(expected.id);
    } catch {
      throw new ShadowSyncError(missingCode, 'Oracle read-back failed');
    }
    if (!actual) {
      throw new ShadowSyncError(
        missingCode,
        'Oracle read-back did not find every copied row',
      );
    }
    const mismatches = compareSharedJobFields(expected, actual);
    if (mismatches.length) {
      throw new ShadowSyncError(
        missingCode === 'oracle_idempotence_failed'
          ? 'oracle_idempotence_failed'
          : 'oracle_readback_mismatch',
        `Oracle read-back mismatch in ${mismatches.join(', ')}`,
      );
    }
    verified += 1;
  }
  return verified;
}

export async function runOracleShadowSync(options: {
  sourceId: string;
  limit: number;
  fetchPage: SupabaseJobsPageFetcher;
  store: Pick<JobDataStore, 'healthCheck' | 'upsertJobs' | 'getJob'>;
  verifyIdempotence?: boolean;
}): Promise<ShadowSyncResult> {
  if (
    !UUID_PATTERN.test(options.sourceId) ||
    !Number.isInteger(options.limit) ||
    options.limit < 1 ||
    options.limit > SHADOW_SYNC_MAX_LIMIT
  ) {
    throw new ShadowSyncError(
      'invalid_arguments',
      'Invalid bounded shadow-sync options',
    );
  }

  try {
    await options.store.healthCheck();
  } catch {
    throw new ShadowSyncError(
      'oracle_health_failed',
      'Oracle health check failed',
    );
  }

  const { rows, capped } = await readBatch(
    options.fetchPage,
    options.sourceId,
    options.limit,
  );
  if (!rows.length) {
    throw new ShadowSyncError(
      'invalid_source_row',
      'No controlled jobs were selected',
    );
  }

  try {
    await options.store.upsertJobs(rows);
  } catch {
    throw new ShadowSyncError(
      'oracle_upsert_failed',
      'Oracle shadow upsert failed',
    );
  }

  const rowsVerified = await verifyRows(
    options.store,
    rows,
    'oracle_readback_missing',
  );
  let idempotenceVerified = false;
  let idempotenceRowsVerified = 0;
  const idempotenceChecked = options.verifyIdempotence === true;
  if (idempotenceChecked) {
    try {
      await options.store.upsertJobs(rows);
      idempotenceRowsVerified = await verifyRows(
        options.store,
        rows,
        'oracle_idempotence_failed',
      );
      idempotenceVerified = true;
    } catch (error) {
      if (error instanceof ShadowSyncError) throw error;
      throw new ShadowSyncError(
        'oracle_idempotence_failed',
        'Oracle idempotence verification failed',
      );
    }
  }

  return {
    selectedRows: rows.length,
    rowsSubmitted: rows.length * (idempotenceChecked ? 2 : 1),
    rowsVerified,
    idempotenceRowsVerified,
    mismatches: 0,
    idempotenceChecked,
    idempotenceVerified,
    capped,
  };
}
