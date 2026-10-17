import { createRequire } from 'node:module';
import { Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  DEFAULT_ORACLE_CALL_TIMEOUT_MS,
  readOracleJobDataConfig,
  type OracleJobDataConfig,
} from './job-data-store.config';
import {
  type JobDataStore,
  type JobStoreFacets,
  type JobStorePersistenceRecord,
  type JobStorePage,
  type JobStoreReconcileResult,
  type JobStoreRecord,
  type JobStoreEmployerMatchUpdate,
  type JobStoreSearch,
  type JobStoreUpsertOptions,
  type JobStoreVisaSignal,
} from './job-data-store.contract';
import {
  ORACLE_ISO_TZ_FORMAT,
  ORACLE_JOB_SEARCH_TABLE,
  JOB_COLUMNS,
  jobBindDefinitions,
  mapJobRow,
  mapVisaSignalRow,
  outputOptions,
  searchBindDefinitions,
  searchFlagsBindDefinitions,
  toJobSearchFlagsBinds,
  toJobSearchUpsertBinds,
  toJobUpsertBinds,
  toOracleTimestamp,
  toVisaSignalUpsertBinds,
  validateVisaSignals,
  normalizeOracleTimestamp,
  visaSignalBindDefinitions,
  type OracleConnection,
  type OracleDriver,
  type OracleJobRow,
  type OraclePool,
} from './oracle-job-data-helpers';
import {
  buildOracleJobSearchFilter,
  oracleJobOrderBy,
} from './oracle-job-search-query';
import {
  buildJobLocationIndex,
  jobLocationFilter,
  type JobLocationIndex,
} from './job-location-index';
import {
  ORACLE_JOB_CONFIRM_SQL,
  ORACLE_JOB_EMPLOYER_MATCH_SQL,
  ORACLE_JOB_MERGE_SQL,
  ORACLE_JOB_MERGE_WITH_HASH_SQL,
  ORACLE_JOB_SEARCH_FLAGS_SQL,
  ORACLE_JOB_SEARCH_MERGE_SQL,
  ORACLE_VISA_SIGNAL_MERGE_SQL,
} from './oracle-job-upsert-sql';

export type { OracleConnection, OracleDriver } from './oracle-job-data-helpers';

export {
  ORACLE_DESCRIPTION_FLAGS,
  ORACLE_DESCRIPTION_FLAG_MASKS,
  ORACLE_ISO_TZ_FORMAT,
  ORACLE_JOB_SEARCH_TABLE,
  descriptionFilterFlags,
  normalizeOracleTimestamp,
  toOracleTimestamp,
  validateVisaSignals,
} from './oracle-job-data-helpers';

const nodeRequire = createRequire(__filename);

function loadOracleDriver(): OracleDriver {
  // The package is loaded lazily, only when a store is constructed without an
  // injected driver, so unit tests with a fake driver never load oracledb.
  return nodeRequire('oracledb') as OracleDriver;
}

/**
 * Oracle implementation of the job store, the only job store since the
 * Supabase job tables were retired. The schema and least-privileged user must
 * be provisioned before deploy (see apps/api/sql/oracle).
 */
export class OracleJobDataStore implements JobDataStore {
  private readonly logger: Pick<Logger, 'log' | 'warn'> = new Logger(
    OracleJobDataStore.name,
  );
  private pool: OraclePool | null = null;
  /**
   * Pool creation is asynchronous. Keep the in-flight promise so concurrent
   * first requests share one pool instead of racing to create several pools.
   */
  private poolInitialization: Promise<OraclePool> | null = null;
  private closed = false;
  /** False once Oracle reports DELETE on the ADMIN search table is not granted. */
  private searchDeleteAllowed = true;
  private locationIndex: {
    expiresAt: number;
    value: Promise<JobLocationIndex>;
  } | null = null;

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
    return new OracleJobDataStore(config, driver);
  }

  async initialize() {
    if (this.closed) throw new Error('Oracle job store is closed');
    if (this.pool) return;
    if (!this.poolInitialization) {
      this.poolInitialization = this.driver.createPool({
        user: this.config.user,
        password: this.config.password,
        connectString: this.config.connectString,
        poolMin: 0,
        poolMax: this.config.poolMax,
        poolIncrement: 1,
        queueTimeout: 5_000,
        // Bound the connection handshake so an unreachable database fails
        // fast instead of holding a request or Bull job.
        connectTimeout: 10,
        stmtCacheSize: 30,
      });
    }
    try {
      this.pool = await this.poolInitialization;
    } finally {
      this.poolInitialization = null;
    }
  }

  async healthCheck() {
    const connection = await this.connection();
    try {
      // Pass explicit binds and options: the timing wrapper forwards all three
      // arguments, and node-oracledb rejects an explicit undefined (NJS-005).
      await connection.execute('SELECT 1 AS "ok" FROM dual', {}, {});
    } finally {
      await connection.close();
    }
  }

  async listJobs(query: JobStoreSearch): Promise<JobStorePage> {
    const page = Math.max(1, Math.floor(query.page));
    const pageSize = Math.min(100, Math.max(1, Math.floor(query.pageSize)));
    const { where, filterBinds } = await this.searchFilter(query);
    const pageBinds = {
      ...filterBinds,
      offset: (page - 1) * pageSize,
      pageSize,
    };
    const connection = await this.connection();
    try {
      const rowsResult = await connection.execute<OracleJobRow>(
        `SELECT ${JOB_COLUMNS} FROM jobs WHERE ${where}
         ORDER BY ${oracleJobOrderBy(query.sortBy)}
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

  async listJobFacets(): Promise<JobStoreFacets> {
    const index = await this.jobLocationIndex();
    // Options cover the US board: companies with only non-US jobs are left out.
    const { where, filterBinds } = await this.searchFilter({
      page: 1,
      pageSize: 1,
      country: 'us',
    });
    const connection = await this.connection();
    try {
      const distinct = async (expression: string) => {
        const result = await connection.execute<{ VALUE: unknown }>(
          `SELECT DISTINCT ${expression} AS "VALUE" FROM jobs WHERE ${where} AND ${expression} IS NOT NULL`,
          filterBinds,
          outputOptions(this.driver),
        );
        return (result.rows || [])
          .map((row) => String(row.VALUE))
          .sort((left, right) =>
            left.localeCompare(right, 'en', { sensitivity: 'base' }),
          );
      };
      const locations = await distinct('location');
      const companies = await distinct(
        'COALESCE(company_name, employer_board_name)',
      );
      return { locations, companies, places: index.places };
    } finally {
      await connection.close();
    }
  }

  async listSourceJobs(sourceId: string): Promise<JobStoreRecord[]> {
    const connection = await this.connection();
    try {
      const rows: OracleJobRow[] = [];
      const pageSize = 500;
      for (let offset = 0; ; offset += pageSize) {
        const result = await connection.execute<OracleJobRow>(
          `SELECT ${JOB_COLUMNS} FROM jobs
           WHERE source_id = :sourceId
           ORDER BY id
           OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
          { sourceId, offset, pageSize },
          outputOptions(this.driver),
        );
        const page = result.rows || [];
        rows.push(...page);
        if (page.length < pageSize) break;
      }
      return rows.map(mapJobRow);
    } finally {
      await connection.close();
    }
  }

  async listSourceJobsForIngestion(
    sourceId: string,
  ): Promise<JobStorePersistenceRecord[]> {
    const connection = await this.connection();
    try {
      const rows: JobStorePersistenceRecord[] = [];
      const pageSize = 500;
      for (let offset = 0; ; offset += pageSize) {
        const result = await connection.execute<{
          ID: string;
          EXTERNAL_JOB_ID: string;
          COMPANY_NAME: string;
          OPT_ELIGIBLE: boolean | null;
          STEM_OPT_ELIGIBLE: boolean | null;
          CPT_ELIGIBLE: boolean | null;
          H1B_SPONSOR_STATUS: string | null;
          CREATED_AT: string | Date;
          FIRST_SEEN_AT: string | Date;
          EMPLOYER_MATCH_ID: string | null;
          LISTING_STATUS: string;
          MISSING_SINCE_AT: string | Date | null;
          CONTENT_HASH?: string | null;
        }>(
          `SELECT ${this.supportsIncrementalIngestion ? 'content_hash AS "CONTENT_HASH", ' : ''}id AS "ID", external_job_id AS "EXTERNAL_JOB_ID",
                  company_name AS "COMPANY_NAME",
                  opt_eligible AS "OPT_ELIGIBLE",
                  stem_opt_eligible AS "STEM_OPT_ELIGIBLE",
                  cpt_eligible AS "CPT_ELIGIBLE",
                  h1b_sponsor_status AS "H1B_SPONSOR_STATUS",
                  created_at AS "CREATED_AT",
                  first_seen_at AS "FIRST_SEEN_AT",
                  employer_match_id AS "EMPLOYER_MATCH_ID",
                  listing_status AS "LISTING_STATUS",
                  missing_since_at AS "MISSING_SINCE_AT"
           FROM jobs
           WHERE source_id = :sourceId
           ORDER BY id
           OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
          { sourceId, offset, pageSize },
          outputOptions(this.driver),
        );
        const page = result.rows || [];
        rows.push(
          ...page.map((row) => ({
            id: String(row.ID),
            externalJobId: String(row.EXTERNAL_JOB_ID),
            companyName: String(row.COMPANY_NAME || ''),
            optEligible:
              row.OPT_ELIGIBLE == null ? null : Boolean(row.OPT_ELIGIBLE),
            stemOptEligible:
              row.STEM_OPT_ELIGIBLE == null
                ? null
                : Boolean(row.STEM_OPT_ELIGIBLE),
            cptEligible:
              row.CPT_ELIGIBLE == null ? null : Boolean(row.CPT_ELIGIBLE),
            h1bSponsorStatus:
              row.H1B_SPONSOR_STATUS == null
                ? null
                : String(row.H1B_SPONSOR_STATUS),
            createdAt: normalizeOracleTimestamp(row.CREATED_AT) || '',
            firstSeenAt: normalizeOracleTimestamp(row.FIRST_SEEN_AT) || '',
            employerMatchId:
              row.EMPLOYER_MATCH_ID == null
                ? null
                : String(row.EMPLOYER_MATCH_ID),
            listingStatus: String(
              row.LISTING_STATUS,
            ) as JobStorePersistenceRecord['listingStatus'],
            missingSinceAt:
              row.MISSING_SINCE_AT == null
                ? null
                : normalizeOracleTimestamp(row.MISSING_SINCE_AT),
            ...(this.supportsIncrementalIngestion
              ? {
                  contentHash:
                    row.CONTENT_HASH == null ? null : String(row.CONTENT_HASH),
                }
              : {}),
          })),
        );
        if (page.length < pageSize) break;
      }
      return rows;
    } finally {
      await connection.close();
    }
  }

  async listSourceJobsPage(
    sourceId: string,
    offset: number,
    pageSize: number,
  ): Promise<JobStorePage> {
    const safeOffset = Math.max(0, Math.floor(offset));
    const safePageSize = Math.min(500, Math.max(1, Math.floor(pageSize)));
    const connection = await this.connection();
    try {
      const result = await connection.execute<OracleJobRow>(
        `SELECT ${JOB_COLUMNS} FROM jobs
         WHERE source_id = :sourceId AND source_trust_tier = 'verified_ats'
         ORDER BY id
         OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
        { sourceId, offset: safeOffset, pageSize: safePageSize },
        outputOptions(this.driver),
      );
      const countResult = await connection.execute<{ TOTAL: number }>(
        `SELECT COUNT(*) AS "TOTAL" FROM jobs
         WHERE source_id = :sourceId AND source_trust_tier = 'verified_ats'`,
        { sourceId },
        outputOptions(this.driver),
      );
      return {
        rows: (result.rows || []).map(mapJobRow),
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

  async listVisaSignals(
    jobIds: readonly string[],
  ): Promise<JobStoreVisaSignal[]> {
    if (!jobIds.length) return [];
    const names = jobIds.map((_, index) => `:jobId${index}`);
    const binds = Object.fromEntries(
      jobIds.map((jobId, index) => [`jobId${index}`, jobId]),
    );
    const connection = await this.connection();
    try {
      const result = await connection.execute<{
        JOB_ID: string;
        SIGNAL_TYPE: string;
        EVIDENCE_SNIPPET: string;
        SOURCE_URL: string;
        OBSERVED_DATE: Date | string;
        CONFIDENCE: number;
        SOURCE: string;
      }>(
        `SELECT job_id AS "JOB_ID", signal_type AS "SIGNAL_TYPE",
                evidence_snippet AS "EVIDENCE_SNIPPET", source_url AS "SOURCE_URL",
                TO_CHAR(observed_date, 'YYYY-MM-DD') AS "OBSERVED_DATE", confidence AS "CONFIDENCE",
                source AS "SOURCE"
         FROM job_visa_signals
         WHERE job_id IN (${names.join(', ')})`,
        binds,
        outputOptions(this.driver),
      );
      return (result.rows || []).map(mapVisaSignalRow);
    } finally {
      await connection.close();
    }
  }

  get supportsIncrementalIngestion() {
    return this.config.incrementalIngestion === true;
  }

  async upsertJobs(
    rows: readonly JobStoreRecord[],
    options: JobStoreUpsertOptions = {},
  ) {
    if (!rows.length) return;
    const withHash = this.supportsIncrementalIngestion;
    // Job and search rows commit in one transaction, so they never diverge.
    const searchRows = options.searchJobIds
      ? rows.filter((row) => options.searchJobIds?.has(row.id))
      : rows;
    // Rewritten jobs whose description is unchanged keep their search text;
    // only their filter flags are refreshed (structured ATS facts can change
    // without the description changing).
    const flagRows = options.searchJobIds
      ? rows.filter((row) => !options.searchJobIds?.has(row.id))
      : [];
    const connection = await this.connection();
    try {
      const bindDefs = jobBindDefinitions(this.driver);
      await connection.executeMany(
        withHash ? ORACLE_JOB_MERGE_WITH_HASH_SQL : ORACLE_JOB_MERGE_SQL,
        rows.map((row) =>
          withHash
            ? {
                ...toJobUpsertBinds(row),
                content_hash: row.contentHash ?? null,
              }
            : toJobUpsertBinds(row),
        ),
        {
          autoCommit: false,
          ...(bindDefs
            ? {
                bindDefs: withHash
                  ? {
                      ...bindDefs,
                      content_hash: contentHashBindDefinition(this.driver),
                    }
                  : bindDefs,
              }
            : {}),
        },
      );
      if (searchRows.length) {
        const searchBindDefs = searchBindDefinitions(this.driver);
        await connection.executeMany(
          ORACLE_JOB_SEARCH_MERGE_SQL,
          searchRows.map(toJobSearchUpsertBinds),
          {
            autoCommit: false,
            ...(searchBindDefs ? { bindDefs: searchBindDefs } : {}),
          },
        );
      }
      if (flagRows.length) {
        const flagBindDefs = searchFlagsBindDefinitions(this.driver);
        await connection.executeMany(
          ORACLE_JOB_SEARCH_FLAGS_SQL,
          flagRows.map(toJobSearchFlagsBinds),
          {
            autoCommit: false,
            ...(flagBindDefs ? { bindDefs: flagBindDefs } : {}),
          },
        );
      }
      await connection.commit();
    } catch (error) {
      await rollbackPreservingError(connection, this.logger);
      throw error;
    } finally {
      await connection.close();
    }
  }

  /**
   * Re-confirms unchanged open jobs: last_confirmed_at and updated_at only, no
   * description or search write. If any row is no longer open (a concurrent
   * lifecycle change), nothing commits and the source fails for a retry.
   */
  /**
   * Deletes jobs with their visa signals and search rows in one transaction,
   * children first (job_visa_signals references jobs). Returns jobs deleted.
   *
   * The search table belongs to ADMIN, and DELETE on it is a separate grant
   * (job-search-schema.sql). Without it the search rows stay behind: they
   * have no foreign key and searches join them only through existing jobs,
   * so they are inert until an ADMIN cleanup. A failed statement rolls back
   * only itself, so the transaction continues.
   */
  async deleteJobs(ids: readonly string[]): Promise<number> {
    const unique = [...new Set(ids)];
    if (!unique.length) return 0;
    const connection = await this.connection();
    let deleted = 0;
    try {
      for (let offset = 0; offset < unique.length; offset += WRITE_BATCH_SIZE) {
        const binds = unique
          .slice(offset, offset + WRITE_BATCH_SIZE)
          .map((id) => ({ id }));
        await connection.executeMany(
          'DELETE FROM job_visa_signals WHERE job_id = :id',
          binds,
          { autoCommit: false },
        );
        if (this.searchDeleteAllowed) {
          try {
            await connection.executeMany(
              `DELETE FROM ${ORACLE_JOB_SEARCH_TABLE} WHERE job_id = :id`,
              binds,
              { autoCommit: false },
            );
          } catch (error) {
            if (!isMissingPrivilegeError(error)) throw error;
            this.searchDeleteAllowed = false;
            this.logger.warn(
              'Job search rows were not deleted: grant DELETE on the search table (job-search-schema.sql)',
            );
          }
        }
        const result = await connection.executeMany(
          'DELETE FROM jobs WHERE id = :id',
          binds,
          { autoCommit: false },
        );
        deleted += Number(result?.rowsAffected ?? 0);
      }
      await connection.commit();
      return deleted;
    } catch (error) {
      await rollbackPreservingError(connection, this.logger);
      throw error;
    } finally {
      await connection.close();
    }
  }

  async confirmJobs(ids: readonly string[], confirmedAt: string) {
    if (!ids.length) return;
    const connection = await this.connection();
    try {
      const at = toOracleTimestamp(confirmedAt);
      let confirmed = 0;
      for (let offset = 0; offset < ids.length; offset += WRITE_BATCH_SIZE) {
        const result = await connection.executeMany(
          ORACLE_JOB_CONFIRM_SQL,
          ids
            .slice(offset, offset + WRITE_BATCH_SIZE)
            .map((id) => ({ id, confirmed_at: at })),
          { autoCommit: false },
        );
        confirmed += result.rowsAffected || 0;
      }
      if (confirmed !== ids.length)
        throw new Error('Job confirmation count changed during ingestion');
      await connection.commit();
    } catch (error) {
      await rollbackPreservingError(connection, this.logger);
      throw error;
    } finally {
      await connection.close();
    }
  }

  /** Changes only employer_match_id; content and search rows are untouched. */
  async updateEmployerMatches(updates: readonly JobStoreEmployerMatchUpdate[]) {
    if (!updates.length) return;
    const connection = await this.connection();
    try {
      for (
        let offset = 0;
        offset < updates.length;
        offset += WRITE_BATCH_SIZE
      ) {
        await connection.executeMany(
          ORACLE_JOB_EMPLOYER_MATCH_SQL,
          updates.slice(offset, offset + WRITE_BATCH_SIZE).map((update) => ({
            id: update.id,
            employer_match_id: update.employerMatchId,
          })),
          { autoCommit: false },
        );
      }
      await connection.commit();
    } catch (error) {
      await rollbackPreservingError(connection, this.logger);
      throw error;
    } finally {
      await connection.close();
    }
  }

  /**
   * Writes posting/sponsor signals next to the Oracle jobs. Employer matches and H-1B sponsors remain in
   * Supabase; the caller supplies the already-composed signal payload.
   */
  async replaceVisaSignals(
    jobIds: readonly string[],
    signals: readonly {
      job_id: string;
      signal_type: string;
      evidence_snippet: string;
      source_url: string;
      observed_date: string;
      confidence: number;
      source: string;
    }[],
  ) {
    if (!jobIds.length) return;
    const mappedSignals = signals.map((signal) => ({
      jobId: signal.job_id,
      signalType: signal.signal_type,
      evidenceSnippet: signal.evidence_snippet,
      sourceUrl: signal.source_url,
      observedDate: signal.observed_date,
      confidence: signal.confidence,
      source: signal.source,
    }));
    validateVisaSignals(mappedSignals);
    const allowed = new Set(jobIds);
    if (mappedSignals.some((signal) => !allowed.has(signal.jobId)))
      throw new Error('Evidence job is outside source scope');
    const connection = await this.connection();
    try {
      for (let offset = 0; offset < jobIds.length; offset += 250) {
        await connection.executeMany(
          `DELETE FROM job_visa_signals
         WHERE job_id = :jobId AND source = 'employer_posting'`,
          jobIds.slice(offset, offset + 250).map((jobId) => ({ jobId })),
          { autoCommit: false },
        );
      }
      await this.mergeVisaSignals(connection, mappedSignals);
      await connection.commit();
    } catch (error) {
      await rollbackPreservingError(connection, this.logger);
      throw error;
    } finally {
      await connection.close();
    }
  }

  private async mergeVisaSignals(
    connection: OracleConnection,
    signals: readonly (JobStoreVisaSignal & { id?: string })[],
  ) {
    const bindDefs = visaSignalBindDefinitions(this.driver);
    for (let offset = 0; offset < signals.length; offset += 250) {
      await connection.executeMany(
        ORACLE_VISA_SIGNAL_MERGE_SQL,
        signals
          .slice(offset, offset + 250)
          .map((signal) =>
            toVisaSignalUpsertBinds(signal, signal.id || randomUUID()),
          ),
        {
          autoCommit: false,
          ...(bindDefs ? { bindDefs } : {}),
        },
      );
    }
  }

  async reconcileSource(
    sourceId: string,
    seenExternalJobIds: readonly string[],
    runStartedAt?: string,
  ) {
    // An empty authoritative response must be handled by the caller's
    // empty-feed protection. Never turn an empty list into mass removals.
    const none: JobStoreReconcileResult = { staleCount: 0, removedCount: 0 };
    if (!seenExternalJobIds.length) return none;
    const connection = await this.connection();
    try {
      const seen = new Set(seenExternalJobIds.map(String));
      const missingIds: string[] = [];
      // Rows the UPDATE below always changes without removing them.
      let missingOpen = 0;
      let missingUntimestamped = 0;
      const pageSize = 500;
      for (let offset = 0; ; offset += pageSize) {
        const existing = await connection.execute<{
          ID: string;
          EXTERNAL_JOB_ID: string;
          LISTING_STATUS: string;
          NO_MISSING_SINCE?: number;
        }>(
          `SELECT id AS "ID", external_job_id AS "EXTERNAL_JOB_ID",
                  listing_status AS "LISTING_STATUS",
                  CASE WHEN missing_since_at IS NULL THEN 1 ELSE 0 END AS "NO_MISSING_SINCE"
           FROM jobs
           WHERE source_id = :sourceId AND listing_status <> 'removed'
           ORDER BY id
           OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
          { sourceId, offset, pageSize },
          outputOptions(this.driver),
        );
        const page = existing.rows || [];
        for (const row of page) {
          if (!seen.has(String(row.EXTERNAL_JOB_ID))) {
            missingIds.push(row.ID);
            if (row.LISTING_STATUS === 'open') missingOpen++;
            else if (Number(row.NO_MISSING_SINCE) === 1) missingUntimestamped++;
          }
        }
        if (page.length < pageSize) break;
      }
      if (!missingIds.length) return none;
      // open -> stale on the first complete-board miss. stale -> removed only
      // on a later complete-board miss that is at least
      // JOB_REMOVAL_MIN_MISSING_SECONDS after the first one, and (for
      // scheduled runs) recorded before this run started. Back-to-back manual
      // runs therefore leave the job stale instead of removing it.
      const removable = `listing_status = 'stale'
             AND missing_since_at IS NOT NULL
             AND missing_since_at <= SYSTIMESTAMP - NUMTODSINTERVAL(:minMissingSeconds, 'SECOND')
             AND (:runStartedAt IS NULL
               OR missing_since_at < TO_TIMESTAMP_TZ(:runStartedAt, '${ORACLE_ISO_TZ_FORMAT}'))`;
      // A legacy stale row without missing_since_at only gets the timestamp
      // here; it starts its removal window instead of being removed at once.
      const updated = await connection.executeMany(
        `UPDATE jobs SET
           listing_status = CASE WHEN listing_status = 'open' OR missing_since_at IS NULL
             THEN 'stale' ELSE 'removed' END,
           missing_since_at = COALESCE(missing_since_at, SYSTIMESTAMP),
           removed_at = CASE WHEN listing_status = 'stale' AND missing_since_at IS NOT NULL
             THEN SYSTIMESTAMP ELSE removed_at END
         WHERE id = :id
           AND (listing_status = 'open'
             OR (listing_status = 'stale' AND missing_since_at IS NULL)
             OR (${removable}))`,
        missingIds.map((id) => ({
          id,
          runStartedAt: runStartedAt ? toOracleTimestamp(runStartedAt) : null,
          minMissingSeconds: JOB_REMOVAL_MIN_MISSING_SECONDS,
        })),
        { autoCommit: false },
      );
      await connection.commit();
      // Open and untimestamped stale rows always match the UPDATE; every
      // other changed row was a stale row that passed the removal window.
      const changed = Number(updated?.rowsAffected ?? 0);
      return {
        staleCount: missingOpen,
        removedCount: Math.max(0, changed - missingOpen - missingUntimestamped),
      };
    } catch (error) {
      await rollbackPreservingError(connection, this.logger);
      throw error;
    } finally {
      await connection.close();
    }
  }

  async close() {
    if (this.closed) return;
    this.closed = true;
    // Never close a pool while it is still being created. This also makes
    // shutdown idempotent when Nest invokes multiple teardown hooks.
    const initializing = this.poolInitialization;
    if (initializing) {
      try {
        await initializing;
      } catch {
        // The initialization caller owns the original error.
      }
    }
    const pool = this.pool;
    this.pool = null;
    if (pool) await pool.close(5);
  }

  /** Search WHERE clause with country/place filters resolved to locations. */
  private async searchFilter(query: JobStoreSearch) {
    const needsIndex = query.country === 'us' || Boolean(query.places?.length);
    const locations = needsIndex
      ? jobLocationFilter(await this.jobLocationIndex(), query)
      : undefined;
    return buildOracleJobSearchFilter(query, locations);
  }

  /**
   * Distinct open-job locations, read at most every few minutes. Ingestion
   * runs hours apart, and a location first seen in between is shown (not
   * hidden) until the next refresh.
   */
  private jobLocationIndex(): Promise<JobLocationIndex> {
    const now = Date.now();
    if (this.locationIndex && this.locationIndex.expiresAt > now) {
      return this.locationIndex.value;
    }
    const value = this.readJobLocationIndex();
    const entry = { expiresAt: now + LOCATION_INDEX_TTL_MS, value };
    this.locationIndex = entry;
    value.catch(() => {
      if (this.locationIndex === entry) this.locationIndex = null;
    });
    return value;
  }

  private async readJobLocationIndex(): Promise<JobLocationIndex> {
    const { where, filterBinds } = buildOracleJobSearchFilter({
      page: 1,
      pageSize: 1,
    });
    const connection = await this.connection();
    try {
      const result = await connection.execute<{
        LOCATION: unknown;
        N: unknown;
      }>(
        `SELECT location AS "LOCATION", COUNT(*) AS "N" FROM jobs WHERE ${where} AND location IS NOT NULL GROUP BY location`,
        filterBinds,
        outputOptions(this.driver),
      );
      return buildJobLocationIndex(
        (result.rows || []).map((row) => ({
          location: String(row.LOCATION),
          count: Number(row.N) || 0,
        })),
      );
    } finally {
      await connection.close();
    }
  }

  private async connection() {
    await this.initialize();
    if (!this.pool) throw new Error('Oracle job store pool is unavailable');
    const connection = await this.pool.getConnection();
    // Without a limit, a statement waiting on a row lock or a stalled network
    // round trip blocks forever and holds the Bull job active. The driver
    // breaks the call and the caller's catch rolls the transaction back.
    connection.callTimeout =
      this.config.callTimeoutMs ?? DEFAULT_ORACLE_CALL_TIMEOUT_MS;
    return timedOracleConnection(connection, this.logger);
  }
}

const TIMED_READ_LOG_THRESHOLD_MS = 1_000;
/** How long the distinct-location index is reused. */
export const LOCATION_INDEX_TTL_MS = 10 * 60_000;
/** Bounds each lightweight executeMany round trip. */
const WRITE_BATCH_SIZE = 500;
/**
 * Minimum time between the first complete-board miss (open -> stale) and the
 * miss that removes the job. 20 hours spans one daily cycle even when runs
 * happen twice a day, and keeps manual reruns from removing jobs.
 */
export const JOB_REMOVAL_MIN_MISSING_SECONDS = 20 * 60 * 60;

function contentHashBindDefinition(driver: OracleDriver) {
  return { type: driver.STRING || 2001, maxSize: 140 };
}

/** Statement kind and target table only; never SQL text or bind values. */
export function oracleOperationLabel(sql: string) {
  const text = sql.replace(/\s+/g, ' ').trim();
  const write =
    /^(MERGE INTO|UPDATE|DELETE FROM|INSERT INTO)\s+([A-Za-z_$#.]+)/i.exec(
      text,
    );
  if (write) return `${write[1].toUpperCase()} ${write[2].toLowerCase()}`;
  const read = /^SELECT\b.*?\bFROM\s+([A-Za-z_$#.]+)/i.exec(text);
  return read ? `SELECT ${read[1].toLowerCase()}` : 'OTHER';
}

/** ORA-41900/ORA-01031: the user lacks a privilege on the object. */
export function isMissingPrivilegeError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  return /\bORA-(?:41900|01031)\b/.test(message);
}

/** Bare driver/database code only, so messages carry no SQL or data. */
export function oracleErrorCode(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  return /^(ORA|NJS|DPI)-\d{3,5}/.exec(message)?.[0] || 'unknown';
}

/**
 * Delegate that measures each round trip. Writes and commits are always
 * logged with their duration and row count so statement times can be
 * measured in production; reads are logged only when slow.
 */
function timedOracleConnection(
  connection: OracleConnection,
  logger: Pick<Logger, 'log' | 'warn'>,
): OracleConnection {
  async function timed<T>(
    operation: string,
    rows: number,
    alwaysLog: boolean,
    call: () => Promise<T>,
  ): Promise<T> {
    const startedAt = Date.now();
    try {
      const result = await call();
      const ms = Date.now() - startedAt;
      if (alwaysLog || ms >= TIMED_READ_LOG_THRESHOLD_MS)
        logger.log(`Oracle ${operation} rows=${rows} took ${ms}ms`);
      return result;
    } catch (error) {
      logger.warn(
        `Oracle ${operation} rows=${rows} failed after ${Date.now() - startedAt}ms (${oracleErrorCode(error)})`,
      );
      throw error;
    }
  }
  return {
    execute: (sql, binds, options) => {
      const label = oracleOperationLabel(sql);
      return timed(label, 1, !label.startsWith('SELECT'), () =>
        connection.execute(sql, binds, options),
      );
    },
    executeMany: (sql, binds, options) =>
      timed(oracleOperationLabel(sql), binds.length, true, () =>
        connection.executeMany(sql, binds, options),
      ),
    commit: () => timed('COMMIT', 0, true, () => connection.commit()),
    rollback: () => connection.rollback(),
    close: () => connection.close(),
    get callTimeout() {
      return connection.callTimeout;
    },
    set callTimeout(value) {
      connection.callTimeout = value;
    },
  };
}

/**
 * Roll back after a failed operation without losing the original error. A
 * rollback failure (for example on a broken connection) is reported by code
 * only; the caller rethrows the error that caused the rollback.
 */
async function rollbackPreservingError(
  connection: OracleConnection,
  logger: Pick<Logger, 'warn'>,
) {
  try {
    await connection.rollback();
  } catch (rollbackError) {
    logger.warn(
      `Oracle rollback failed (${oracleErrorCode(rollbackError)}); the original error is preserved`,
    );
  }
}
