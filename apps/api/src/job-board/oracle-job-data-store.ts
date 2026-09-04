import { createRequire } from 'node:module';
import {
  readOracleJobDataConfig,
  type OracleJobDataConfig,
} from './job-data-store.config';
import {
  type JobDataStore,
  type JobStorePage,
  type JobStoreRecord,
  type JobStoreSearch,
} from './job-data-store.contract';

type OracleRowsResult<T> = { rows?: T[]; rowsAffected?: number };

export type OracleConnection = {
  execute<T = Record<string, unknown>>(
    sql: string,
    binds?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<OracleRowsResult<T>>;
  executeMany(
    sql: string,
    binds: readonly Record<string, unknown>[],
    options?: Record<string, unknown>,
  ): Promise<OracleRowsResult<Record<string, unknown>>>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  close(): Promise<void>;
};

type OraclePool = {
  getConnection(): Promise<OracleConnection>;
  close(drainTime?: number): Promise<void>;
};

export type OracleDriver = {
  OUT_FORMAT_OBJECT: number;
  STRING?: unknown;
  CLOB?: unknown;
  NUMBER?: unknown;
  createPool(options: Record<string, unknown>): Promise<OraclePool>;
};

const nodeRequire = createRequire(__filename);

function loadOracleDriver(): OracleDriver {
  // The package is intentionally loaded lazily. Supabase remains the default,
  // so a production boot does not need an Oracle client or credentials.
  return nodeRequire('oracledb') as OracleDriver;
}

type OracleJobRow = Record<string, unknown>;

function boolToNumber(value: boolean | null) {
  return value === null ? null : value ? 1 : 0;
}

function toIsoTimestamp(value: string | null) {
  return value ? new Date(value).toISOString() : null;
}

function textValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
}

function isoValue(value: unknown) {
  const text = textValue(value);
  return text ? new Date(text).toISOString() : null;
}

function mapJobRow(row: OracleJobRow): JobStoreRecord {
  return {
    id: textValue(row.ID) || '',
    sourceId: textValue(row.SOURCE_ID) || '',
    sourceAts: textValue(row.SOURCE_ATS) || '',
    boardToken: textValue(row.BOARD_TOKEN) || '',
    externalJobId: textValue(row.EXTERNAL_JOB_ID) || '',
    title: textValue(row.TITLE) || '',
    companyName: textValue(row.COMPANY_NAME) || '',
    location: textValue(row.LOCATION),
    department: textValue(row.DEPARTMENT),
    description: textValue(row.DESCRIPTION),
    jobUrl: textValue(row.JOB_URL),
    postedAt: isoValue(row.POSTED_AT),
    updatedAt: isoValue(row.UPDATED_AT) || '',
    optEligible:
      row.OPT_ELIGIBLE == null ? null : Number(row.OPT_ELIGIBLE) === 1,
    stemOptEligible:
      row.STEM_OPT_ELIGIBLE == null
        ? null
        : Number(row.STEM_OPT_ELIGIBLE) === 1,
    cptEligible:
      row.CPT_ELIGIBLE == null ? null : Number(row.CPT_ELIGIBLE) === 1,
    h1bSponsorStatus: textValue(row.H1B_SPONSOR_STATUS),
    createdAt: isoValue(row.CREATED_AT) || '',
    firstSeenAt: isoValue(row.FIRST_SEEN_AT) || '',
    lastConfirmedAt: isoValue(row.LAST_CONFIRMED_AT) || '',
    listingStatus: (textValue(row.LISTING_STATUS) ||
      'open') as JobStoreRecord['listingStatus'],
    employerBoardName: textValue(row.EMPLOYER_BOARD_NAME),
    sourceTrustTier: textValue(row.SOURCE_TRUST_TIER) || 'verified_ats',
    employerMatchId: textValue(row.EMPLOYER_MATCH_ID),
    missingSinceAt: isoValue(row.MISSING_SINCE_AT),
    removedAt: isoValue(row.REMOVED_AT),
  };
}

const JOB_COLUMNS = `
  id, source_id, source_ats, board_token, external_job_id, title,
  company_name, location, department, description, job_url, posted_at,
  updated_at, opt_eligible, stem_opt_eligible, cpt_eligible,
  h1b_sponsor_status, created_at, first_seen_at, last_confirmed_at,
  listing_status, employer_board_name, source_trust_tier, employer_match_id,
  missing_since_at, removed_at
`;
const ORACLE_ISO_TZ_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"';

type OracleBindDefinition = {
  type: unknown;
  maxSize?: number;
};

/**
 * executeMany() uses bindDefs as the complete bind definition when it is
 * supplied. Defining only `description` therefore makes node-oracledb see one
 * bind value for the 26 placeholders in the MERGE (NJS-098). Keep every named
 * placeholder defined, while binding descriptions as CLOBs.
 */
function jobBindDefinitions(
  driver: OracleDriver,
): Record<string, OracleBindDefinition> | undefined {
  const stringType = driver.STRING;
  if (!stringType) return undefined;

  const numberType = driver.NUMBER || stringType;
  const timestampSize = 40;
  const text = (maxSize: number): OracleBindDefinition => ({
    type: stringType,
    maxSize,
  });

  return {
    id: text(36),
    source_id: text(36),
    source_ats: text(32),
    board_token: text(255),
    external_job_id: text(255),
    title: text(500),
    company_name: text(500),
    location: text(1000),
    department: text(500),
    description: driver.CLOB ? { type: driver.CLOB } : text(4_000),
    job_url: text(2_000),
    posted_at: text(timestampSize),
    updated_at: text(timestampSize),
    opt_eligible: { type: numberType },
    stem_opt_eligible: { type: numberType },
    cpt_eligible: { type: numberType },
    h1b_sponsor_status: text(64),
    created_at: text(timestampSize),
    first_seen_at: text(timestampSize),
    last_confirmed_at: text(timestampSize),
    listing_status: text(16),
    employer_board_name: text(500),
    source_trust_tier: text(32),
    employer_match_id: text(36),
    missing_since_at: text(timestampSize),
    removed_at: text(timestampSize),
  };
}

function outputOptions(driver: OracleDriver) {
  return {
    outFormat: driver.OUT_FORMAT_OBJECT,
    ...(driver.STRING
      ? { fetchInfo: { DESCRIPTION: { type: driver.STRING } } }
      : {}),
  };
}

/**
 * Shadow-only Oracle implementation. It is not registered in JobBoardModule;
 * callers must explicitly construct it after Oracle schema/user validation.
 */
export class OracleJobDataStore implements JobDataStore {
  private pool: OraclePool | null = null;

  constructor(
    private readonly config: OracleJobDataConfig,
    private readonly driver: OracleDriver = loadOracleDriver(),
  ) {}

  static fromEnvironment(
    env: Record<string, string | undefined>,
    driver?: OracleDriver,
  ) {
    const config = readOracleJobDataConfig({
      ...env,
      JOB_DATA_STORE: 'oracle',
    });
    if (!config) throw new Error('Oracle job store is not selected');
    return new OracleJobDataStore(config, driver);
  }

  async initialize() {
    if (this.pool) return;
    this.pool = await this.driver.createPool({
      user: this.config.user,
      password: this.config.password,
      connectString: this.config.connectString,
      poolMin: 0,
      poolMax: this.config.poolMax,
      poolIncrement: 1,
      queueTimeout: 5_000,
      // Bound a shadow probe's connection handshake without changing the
      // database-neutral job-store contract or Supabase production path.
      connectTimeout: 10,
      stmtCacheSize: 30,
    });
  }

  async healthCheck() {
    const connection = await this.connection();
    try {
      await connection.execute('SELECT 1 AS "ok" FROM dual');
    } finally {
      await connection.close();
    }
  }

  async listJobs(query: JobStoreSearch): Promise<JobStorePage> {
    const page = Math.max(1, Math.floor(query.page));
    const pageSize = Math.min(100, Math.max(1, Math.floor(query.pageSize)));
    const conditions = [
      "listing_status = 'open'",
      "source_trust_tier = 'verified_ats'",
    ];
    const filterBinds: Record<string, unknown> = {};
    if (query.query?.trim()) {
      conditions.push(
        '(LOWER(title) LIKE :query OR LOWER(company_name) LIKE :query OR LOWER(description) LIKE :query)',
      );
      filterBinds.query = `%${query.query.trim().toLowerCase()}%`;
    }
    if (query.sourceAts) {
      conditions.push('source_ats = :sourceAts');
      filterBinds.sourceAts = query.sourceAts;
    }
    if (query.companyName) {
      conditions.push('company_name = :companyName');
      filterBinds.companyName = query.companyName;
    }
    if (query.location) {
      conditions.push('location = :location');
      filterBinds.location = query.location;
    }
    if (query.postedAfter) {
      conditions.push(
        `posted_at >= TO_TIMESTAMP_TZ(:postedAfter, '${ORACLE_ISO_TZ_FORMAT}')`,
      );
      filterBinds.postedAfter = new Date(query.postedAfter).toISOString();
    }

    const where = conditions.join(' AND ');
    const pageBinds = {
      ...filterBinds,
      offset: (page - 1) * pageSize,
      pageSize,
    };
    const connection = await this.connection();
    try {
      const rowsResult = await connection.execute<OracleJobRow>(
        `SELECT ${JOB_COLUMNS} FROM jobs WHERE ${where}
         ORDER BY posted_at DESC NULLS LAST, last_confirmed_at DESC
         OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
        pageBinds,
        outputOptions(this.driver),
      );
      const countResult = await connection.execute<{ TOTAL: number }>(
        `SELECT COUNT(*) AS "TOTAL" FROM jobs WHERE ${where}`,
        filterBinds,
        outputOptions(this.driver),
      );
      return {
        rows: (rowsResult.rows || []).map(mapJobRow),
        total: Number(countResult.rows?.[0]?.TOTAL || 0),
      };
    } finally {
      await connection.close();
    }
  }

  async getJob(id: string) {
    const connection = await this.connection();
    try {
      const result = await connection.execute<OracleJobRow>(
        `SELECT ${JOB_COLUMNS} FROM jobs WHERE id = :id`,
        { id },
        outputOptions(this.driver),
      );
      const row = result.rows?.[0];
      return row ? mapJobRow(row) : null;
    } finally {
      await connection.close();
    }
  }

  async upsertJobs(rows: readonly JobStoreRecord[]) {
    if (!rows.length) return;
    const connection = await this.connection();
    try {
      const bindDefs = jobBindDefinitions(this.driver);
      await connection.executeMany(
        `MERGE INTO jobs target
         USING (SELECT :id id, :source_id source_id, :source_ats source_ats,
                       :board_token board_token, :external_job_id external_job_id,
                       :title title, :company_name company_name, :location location,
                       :department department, :description description, :job_url job_url,
                       TO_TIMESTAMP_TZ(:posted_at, '${ORACLE_ISO_TZ_FORMAT}') posted_at,
                       TO_TIMESTAMP_TZ(:updated_at, '${ORACLE_ISO_TZ_FORMAT}') updated_at,
                       :opt_eligible opt_eligible, :stem_opt_eligible stem_opt_eligible,
                       :cpt_eligible cpt_eligible, :h1b_sponsor_status h1b_sponsor_status,
                       TO_TIMESTAMP_TZ(:created_at, '${ORACLE_ISO_TZ_FORMAT}') created_at,
                       TO_TIMESTAMP_TZ(:first_seen_at, '${ORACLE_ISO_TZ_FORMAT}') first_seen_at,
                       TO_TIMESTAMP_TZ(:last_confirmed_at, '${ORACLE_ISO_TZ_FORMAT}') last_confirmed_at,
                       :listing_status listing_status, :employer_board_name employer_board_name,
                       :source_trust_tier source_trust_tier, :employer_match_id employer_match_id,
                       TO_TIMESTAMP_TZ(:missing_since_at, '${ORACLE_ISO_TZ_FORMAT}') missing_since_at,
                       TO_TIMESTAMP_TZ(:removed_at, '${ORACLE_ISO_TZ_FORMAT}') removed_at
                FROM dual) incoming
         ON (target.source_ats = incoming.source_ats
             AND target.board_token = incoming.board_token
             AND target.external_job_id = incoming.external_job_id)
         WHEN MATCHED THEN UPDATE SET
           target.title = incoming.title,
           target.company_name = incoming.company_name,
           target.location = incoming.location,
           target.department = incoming.department,
           target.description = incoming.description,
           target.job_url = incoming.job_url,
           target.posted_at = incoming.posted_at,
           target.updated_at = incoming.updated_at,
           target.opt_eligible = incoming.opt_eligible,
           target.stem_opt_eligible = incoming.stem_opt_eligible,
           target.cpt_eligible = incoming.cpt_eligible,
           target.h1b_sponsor_status = incoming.h1b_sponsor_status,
           target.last_confirmed_at = incoming.last_confirmed_at,
           target.listing_status = incoming.listing_status,
           target.employer_board_name = incoming.employer_board_name,
           target.source_trust_tier = incoming.source_trust_tier,
           target.employer_match_id = incoming.employer_match_id,
           target.missing_since_at = incoming.missing_since_at,
           target.removed_at = incoming.removed_at
         WHEN NOT MATCHED THEN INSERT (${JOB_COLUMNS}) VALUES (
           incoming.id, incoming.source_id, incoming.source_ats, incoming.board_token,
           incoming.external_job_id, incoming.title, incoming.company_name,
           incoming.location, incoming.department, incoming.description, incoming.job_url,
           incoming.posted_at, incoming.updated_at, incoming.opt_eligible,
           incoming.stem_opt_eligible, incoming.cpt_eligible, incoming.h1b_sponsor_status,
           incoming.created_at, incoming.first_seen_at, incoming.last_confirmed_at,
           incoming.listing_status, incoming.employer_board_name, incoming.source_trust_tier,
           incoming.employer_match_id, incoming.missing_since_at, incoming.removed_at
         )`,
        rows.map((row) => ({
          id: row.id,
          source_id: row.sourceId,
          source_ats: row.sourceAts,
          board_token: row.boardToken,
          external_job_id: row.externalJobId,
          title: row.title,
          company_name: row.companyName,
          location: row.location,
          department: row.department,
          description: row.description,
          job_url: row.jobUrl,
          posted_at: toIsoTimestamp(row.postedAt),
          updated_at: toIsoTimestamp(row.updatedAt),
          opt_eligible: boolToNumber(row.optEligible),
          stem_opt_eligible: boolToNumber(row.stemOptEligible),
          cpt_eligible: boolToNumber(row.cptEligible),
          h1b_sponsor_status: row.h1bSponsorStatus,
          created_at: toIsoTimestamp(row.createdAt),
          first_seen_at: toIsoTimestamp(row.firstSeenAt),
          last_confirmed_at: toIsoTimestamp(row.lastConfirmedAt),
          listing_status: row.listingStatus,
          employer_board_name: row.employerBoardName,
          source_trust_tier: row.sourceTrustTier,
          employer_match_id: row.employerMatchId,
          missing_since_at: toIsoTimestamp(row.missingSinceAt),
          removed_at: toIsoTimestamp(row.removedAt),
        })),
        {
          autoCommit: false,
          ...(bindDefs ? { bindDefs } : {}),
        },
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  async reconcileSource(
    sourceId: string,
    seenExternalJobIds: readonly string[],
  ) {
    // An empty authoritative response must be handled by the caller's
    // empty-feed protection. Never turn an empty list into mass removals.
    if (!seenExternalJobIds.length) return;
    const connection = await this.connection();
    try {
      const existing = await connection.execute<{
        ID: string;
        EXTERNAL_JOB_ID: string;
        LISTING_STATUS: string;
      }>(
        `SELECT id AS "ID", external_job_id AS "EXTERNAL_JOB_ID",
                listing_status AS "LISTING_STATUS"
         FROM jobs WHERE source_id = :sourceId AND listing_status <> 'removed'`,
        { sourceId },
        outputOptions(this.driver),
      );
      const seen = new Set(seenExternalJobIds.map(String));
      const missing = (existing.rows || []).filter(
        (row) => !seen.has(String(row.EXTERNAL_JOB_ID)),
      );
      if (!missing.length) return;
      await connection.executeMany(
        `UPDATE jobs SET
           listing_status = CASE WHEN listing_status = 'open' THEN 'stale' ELSE 'removed' END,
           missing_since_at = COALESCE(missing_since_at, SYSTIMESTAMP),
           removed_at = CASE WHEN listing_status = 'stale' THEN SYSTIMESTAMP ELSE removed_at END
         WHERE id = :id`,
        missing.map((row) => ({ id: row.ID })),
        { autoCommit: false },
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  async close() {
    if (!this.pool) return;
    await this.pool.close(5);
    this.pool = null;
  }

  private async connection() {
    await this.initialize();
    if (!this.pool) throw new Error('Oracle job store pool is unavailable');
    return this.pool.getConnection();
  }
}
