import { createRequire } from 'node:module';
import { readOracleJobDataConfig } from '../job-board/job-data-store.config';
import { H1B_FILING_COLUMNS } from './oracle-h1b-filings';

/**
 * Columns returned to the sponsor profile. Matches the web route's former
 * Supabase projection: everything the profile, LCA table, filing modal, and
 * analytics render, without raw import-only fields.
 */
export const FILING_PROFILE_COLUMNS = [
  'id', 'case_number', 'status', 'received_date', 'decision_date',
  'original_cert_date', 'visa_class', 'job_title', 'soc_code', 'soc_title',
  'full_time_position', 'begin_date', 'end_date', 'total_workers',
  'employer_name', 'employer_address1', 'employer_city', 'employer_state',
  'employer_postal_code', 'employer_country', 'employer_phone',
  'employer_phone_ext', 'employer_province', 'employer_fein', 'naics_code',
  'employer_poc_name', 'employer_poc_job_title', 'employer_poc_email',
  'employer_poc_phone', 'employer_poc_phone_ext', 'employer_poc_address1',
  'employer_poc_city', 'agent_attorney_name', 'agent_attorney_email',
  'agent_attorney_phone', 'agent_attorney_phone_ext', 'agent_attorney_address1',
  'agent_attorney_city', 'agent_representing_employer', 'lawfirm_name',
  'lawfirm_business_fein', 'worksite_address1', 'worksite_address2',
  'worksite_city', 'worksite_county', 'worksite_state', 'worksite_postal_code',
  'worksite_workers', 'total_worksite_locations', 'trade_name_dba',
  'secondary_entity', 'secondary_entity_business_name', 'wage_rate_from',
  'wage_rate_to', 'wage_unit', 'prevailing_wage', 'pw_unit', 'pw_wage_level',
  'pw_source', 'pw_source_year', 'pw_other_source', 'pw_other_year',
  'pw_tracking_number', 'pw_survey_name', 'pw_survey_publisher', 'sponsor_id',
  'state_of_highest_court', 'name_of_highest_state_court',
  'new_employment', 'continued_employment', 'change_previous_employment',
  'new_concurrent_employment', 'change_employer', 'amended_petition',
  'h_1b_dependent', 'willful_violator', 'support_h1b', 'appendix_a_attached',
  'public_disclosure', 'agree_to_lc_statement', 'statutory_basis',
  'preparer_first_name', 'preparer_middle_initial', 'preparer_last_name',
  'preparer_business_name', 'preparer_email',
] as const; // prettier-ignore

export const FILING_PAGE_LIMIT = 500;

const KIND_BY_COLUMN = new Map(H1B_FILING_COLUMNS);

/**
 * Dates come back as 'YYYY-MM-DD' text, exactly as Supabase returned them, so
 * the driver's time zone cannot shift a date and the web payload is unchanged.
 */
const SELECT_LIST = FILING_PROFILE_COLUMNS.map((name) =>
  KIND_BY_COLUMN.get(name) === 'date'
    ? `TO_CHAR(${name}, 'YYYY-MM-DD') AS ${name}`
    : name,
).join(', ');

const ORDER_AND_LIMIT = `ORDER BY received_date DESC FETCH FIRST ${FILING_PAGE_LIMIT} ROWS ONLY`;

export const FILING_LOOKUP_SQL = {
  bySponsor: `SELECT ${SELECT_LIST} FROM h1b_filings WHERE sponsor_id = :value ${ORDER_AND_LIMIT}`,
  byEmployer: `SELECT ${SELECT_LIST} FROM h1b_filings WHERE employer_name = :value ${ORDER_AND_LIMIT}`,
  // Supabase used ilike(name) without wildcards: a case-insensitive equality.
  byEmployerInsensitive: `SELECT ${SELECT_LIST} FROM h1b_filings WHERE UPPER(employer_name) = UPPER(:value) ${ORDER_AND_LIMIT}`,
} as const;

export type FilingRow = Record<string, string | number | null>;

type OracleConnection = {
  execute: (
    sql: string,
    binds?: unknown,
    options?: unknown,
  ) => Promise<{ rows?: Record<string, unknown>[] }>;
  close: () => Promise<void>;
};

type OraclePool = {
  getConnection: () => Promise<OracleConnection>;
  close: (drainTime?: number) => Promise<void>;
};

export type OracleFilingsDriver = {
  OUT_FORMAT_OBJECT: unknown;
  createPool: (options: Record<string, unknown>) => Promise<OraclePool>;
};

/** Oracle rows use upper-case keys; the web payload uses the column names. */
export function toFilingRow(row: Record<string, unknown>): FilingRow {
  const mapped: FilingRow = {};
  for (const name of FILING_PROFILE_COLUMNS) {
    const value = row[name.toUpperCase()];
    mapped[name] =
      typeof value === 'string' || typeof value === 'number' ? value : null;
  }
  return mapped;
}

/**
 * Read-only Oracle access to the H-1B filings copy. The pool is created on
 * first use so an API boot never waits on Oracle.
 */
export class OracleH1bFilingsReader {
  private poolPromise: Promise<OraclePool> | null = null;

  constructor(
    private readonly env: Record<string, string | undefined>,
    private readonly driver: OracleFilingsDriver = createRequire(__filename)(
      'oracledb',
    ) as OracleFilingsDriver,
  ) {}

  private pool() {
    if (!this.poolPromise) {
      const config = readOracleJobDataConfig({
        ...this.env,
        JOB_DATA_STORE: 'oracle',
      });
      if (!config) throw new Error('Oracle is not configured');
      this.poolPromise = this.driver
        .createPool({
          user: config.user,
          password: config.password,
          connectString: config.connectString,
          poolMin: 0,
          poolMax: 2,
          poolIncrement: 1,
          queueTimeout: 5_000,
          connectTimeout: 10,
        })
        .catch((error: unknown) => {
          // Allow a later request to retry instead of caching the failure.
          this.poolPromise = null;
          throw error;
        });
    }
    return this.poolPromise;
  }

  private async query(sql: string, binds: Record<string, string> = {}) {
    const connection = await (await this.pool()).getConnection();
    try {
      const result = await connection.execute(sql, binds, {
        outFormat: this.driver.OUT_FORMAT_OBJECT,
      });
      return result.rows ?? [];
    } finally {
      await connection.close();
    }
  }

  /**
   * Same three-step lookup the sponsor profile used against Supabase: by
   * sponsor id, then exact employer name, then case-insensitive name.
   */
  async listFilings(sponsorId: string, employerName?: string) {
    const bySponsor = await this.query(FILING_LOOKUP_SQL.bySponsor, {
      value: sponsorId,
    });
    if (bySponsor.length || !employerName) return bySponsor.map(toFilingRow);

    const byEmployer = await this.query(FILING_LOOKUP_SQL.byEmployer, {
      value: employerName,
    });
    if (byEmployer.length) return byEmployer.map(toFilingRow);

    const insensitive = await this.query(
      FILING_LOOKUP_SQL.byEmployerInsensitive,
      { value: employerName },
    );
    return insensitive.map(toFilingRow);
  }

  async healthCheck() {
    const started = Date.now();
    const rows = await this.query(
      'SELECT id FROM h1b_filings FETCH FIRST 1 ROWS ONLY',
    );
    return { rowsChecked: rows.length, durationMs: Date.now() - started };
  }

  async close() {
    const pool = this.poolPromise;
    this.poolPromise = null;
    if (pool) await (await pool).close(5);
  }
}
