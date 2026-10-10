import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import {
  readOracleJobDataConfig,
  type OracleJobDataConfig,
} from './job-data-store.config';
import {
  type JobDataStore,
  type JobStorePersistenceRecord,
  type JobStorePage,
  type JobStoreRecord,
  type JobStoreSearch,
  type JobStoreVisaSignal,
} from './job-data-store.contract';
import {
  ORACLE_ISO_TZ_FORMAT,
  JOB_COLUMNS,
  jobBindDefinitions,
  mapJobRow,
  mapVisaSignalRow,
  outputOptions,
  searchBindDefinitions,
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
import { buildOracleJobSearchFilter } from './oracle-job-search-query';
import {
  runOracleCanonicalIdentityRepair,
  type OracleCanonicalIdentityRepair,
  type OracleCanonicalIdentityRepairResult,
} from './oracle-canonical-identity-repair';
import {
  ORACLE_JOB_MERGE_SQL,
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

export type {
  OracleCanonicalIdentityRepair,
  OracleCanonicalIdentityRepairResult,
} from './oracle-canonical-identity-repair';

const nodeRequire = createRequire(__filename);

function loadOracleDriver(): OracleDriver {
  // The package is intentionally loaded lazily. Supabase remains the default,
  // so a production boot does not need an Oracle client or credentials.
  return nodeRequire('oracledb') as OracleDriver;
}

/**
 * Oracle implementation for the database-neutral job store. The Nest module
 * constructs it only for an explicit JOB_DATA_STORE=oracle selection; callers
 * must still provision and validate the schema/user before cutover.
 */
export class OracleJobDataStore implements JobDataStore {
  private pool: OraclePool | null = null;
  /**
   * Pool creation is asynchronous. Keep the in-flight promise so concurrent
   * first requests share one pool instead of racing to create several pools.
   */
  private poolInitialization: Promise<OraclePool> | null = null;
  private closed = false;

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
        // Bound a shadow probe's connection handshake without changing the
        // database-neutral job-store contract or Supabase production path.
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
      await connection.execute('SELECT 1 AS "ok" FROM dual');
    } finally {
      await connection.close();
    }
  }

  async listJobs(query: JobStoreSearch): Promise<JobStorePage> {
    const page = Math.max(1, Math.floor(query.page));
    const pageSize = Math.min(100, Math.max(1, Math.floor(query.pageSize)));
    const { where, filterBinds } = buildOracleJobSearchFilter(query);
    const pageBinds = {
      ...filterBinds,
      offset: (page - 1) * pageSize,
      pageSize,
    };
    const connection = await this.connection();
    try {
      const rowsResult = await connection.execute<OracleJobRow>(
        `SELECT ${JOB_COLUMNS} FROM jobs WHERE ${where}
         ORDER BY ${query.sortBy === 'last_confirmed_at' ? 'last_confirmed_at' : 'posted_at'} DESC NULLS LAST, id ASC
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
        }>(
          `SELECT id AS "ID", external_job_id AS "EXTERNAL_JOB_ID",
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

  /** Bounded natural-identity lookup for canonical source synchronization. */
  async getJobsByExternalIds(sourceId: string, ids: readonly string[]) {
    if (!ids.length) return [];
    if (ids.length > 100)
      throw new Error('External identity batch exceeds 100');
    const binds = {
      sourceId,
      ...Object.fromEntries(ids.map((id, index) => [`external${index}`, id])),
    };
    const connection = await this.connection();
    try {
      const result = await connection.execute<OracleJobRow>(
        `SELECT ${JOB_COLUMNS} FROM jobs WHERE source_id = :sourceId
         AND external_job_id IN (${ids.map((_, index) => `:external${index}`).join(',')})`,
        binds,
        outputOptions(this.driver),
      );
      return (result.rows || []).map(mapJobRow);
    } finally {
      await connection.close();
    }
  }

  /**
   * Deletes only identities proven absent from the Supabase source during the
   * bounded parity repair. The caller must provide the source/external key
   * alongside each UUID; this is not part of the normal ingestion contract.
   */
  async deleteVerifiedExtras(
    entries: readonly {
      id: string;
      sourceId: string;
      externalJobId: string;
    }[],
  ) {
    if (!entries.length) return 0;
    if (entries.length > 100)
      throw new Error('Verified extra batch exceeds 100');
    if (entries.some((entry) => entry.sourceId !== entries[0].sourceId))
      throw new Error('Verified extra batch spans multiple sources');
    const connection = await this.connection();
    const idBinds = Object.fromEntries(
      entries.flatMap((entry, index) => [
        [`extraId${index}`, entry.id],
        [`extraExternal${index}`, entry.externalJobId],
      ]),
    );
    const predicates = entries
      .map(
        (_, index) =>
          `(id = :extraId${index} AND external_job_id = :extraExternal${index})`,
      )
      .join(' OR ');
    const idOnlyBinds = Object.fromEntries(
      entries.map((entry, index) => [`extraId${index}`, entry.id]),
    );
    try {
      const verified = await connection.execute<{ ID: string }>(
        `SELECT id AS "ID" FROM jobs
         WHERE source_id = :sourceId AND (${predicates})`,
        { sourceId: entries[0].sourceId, ...idBinds },
        outputOptions(this.driver),
      );
      if ((verified.rows || []).length !== entries.length)
        throw new Error('Verified extra identity changed');

      const ids = entries.map((_, index) => `:extraId${index}`);
      await connection.execute(
        `DELETE FROM job_visa_signals WHERE job_id IN (${ids.join(', ')})`,
        idOnlyBinds,
        { autoCommit: false },
      );
      const deleted = await connection.execute(
        `DELETE FROM jobs
         WHERE source_id = :sourceId AND id IN (${ids.join(', ')})`,
        { sourceId: entries[0].sourceId, ...idOnlyBinds },
        { autoCommit: false },
      );
      if ((deleted.rowsAffected || 0) !== entries.length)
        throw new Error('Verified extra delete count mismatch');
      await connection.commit();
      return entries.length;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  /** Deletes only Oracle signals proven absent from the Supabase source page. */
  async deleteVerifiedEvidenceExtras(
    entries: readonly {
      jobId: string;
      signalType: string;
      source: string;
      sourceUrl: string;
    }[],
  ) {
    if (!entries.length) return 0;
    if (entries.length > 100)
      throw new Error('Verified evidence batch exceeds 100');
    const binds = Object.fromEntries(
      entries.flatMap((entry, index) => [
        [`evidenceJob${index}`, entry.jobId],
        [`evidenceSignal${index}`, entry.signalType],
        [`evidenceSource${index}`, entry.source],
        [`evidenceUrl${index}`, entry.sourceUrl],
      ]),
    );
    const predicates = entries
      .map(
        (_, index) =>
          `(job_id = :evidenceJob${index} AND signal_type = :evidenceSignal${index}
            AND source = :evidenceSource${index} AND source_url = :evidenceUrl${index})`,
      )
      .join(' OR ');
    const connection = await this.connection();
    try {
      const verified = await connection.execute(
        `SELECT job_id FROM job_visa_signals WHERE ${predicates}`,
        binds,
        outputOptions(this.driver),
      );
      if ((verified.rows || []).length !== entries.length)
        throw new Error('Verified evidence identity changed');
      const deleted = await connection.execute(
        `DELETE FROM job_visa_signals WHERE ${predicates}`,
        binds,
        { autoCommit: false },
      );
      if ((deleted.rowsAffected || 0) !== entries.length)
        throw new Error('Verified evidence delete count mismatch');
      await connection.commit();
      return entries.length;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  /** Updates only timestamps for parity rows whose other fields already match. */
  async patchJobTimestamps(rows: readonly JobStoreRecord[]) {
    if (!rows.length) return;
    const connection = await this.connection();
    try {
      await connection.executeMany(
        `UPDATE jobs SET
           posted_at = TO_TIMESTAMP_TZ(:posted_at, '${ORACLE_ISO_TZ_FORMAT}'),
           updated_at = TO_TIMESTAMP_TZ(:updated_at, '${ORACLE_ISO_TZ_FORMAT}'),
           created_at = TO_TIMESTAMP_TZ(:created_at, '${ORACLE_ISO_TZ_FORMAT}'),
           first_seen_at = TO_TIMESTAMP_TZ(:first_seen_at, '${ORACLE_ISO_TZ_FORMAT}'),
           last_confirmed_at = TO_TIMESTAMP_TZ(:last_confirmed_at, '${ORACLE_ISO_TZ_FORMAT}'),
           missing_since_at = TO_TIMESTAMP_TZ(:missing_since_at, '${ORACLE_ISO_TZ_FORMAT}'),
           removed_at = TO_TIMESTAMP_TZ(:removed_at, '${ORACLE_ISO_TZ_FORMAT}')
         WHERE id = :id AND source_id = :source_id
           AND source_ats = :source_ats AND board_token = :board_token
           AND external_job_id = :external_job_id`,
        rows.map((row) => ({
          id: row.id,
          source_id: row.sourceId,
          source_ats: row.sourceAts,
          board_token: row.boardToken,
          external_job_id: row.externalJobId,
          posted_at: toOracleTimestamp(row.postedAt),
          updated_at: toOracleTimestamp(row.updatedAt),
          created_at: toOracleTimestamp(row.createdAt),
          first_seen_at: toOracleTimestamp(row.firstSeenAt),
          last_confirmed_at: toOracleTimestamp(row.lastConfirmedAt),
          missing_since_at: toOracleTimestamp(row.missingSinceAt),
          removed_at: toOracleTimestamp(row.removedAt),
        })),
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

  /**
   * Repairs a source/external identity whose canonical Supabase UUID changed.
   *
   * This is intentionally separate from the normal MERGE contract: ordinary
   * ingestion must never rewrite a primary key merely because a caller sent a
   * different UUID. The migration-only path proves the natural identity,
   * rejects unexpected JOBS foreign-key dependents, and preserves existing
   * visa signals inside one transaction.
   */
  async repairCanonicalIdentities(
    entries: readonly OracleCanonicalIdentityRepair[],
  ): Promise<OracleCanonicalIdentityRepairResult[]> {
    if (!entries.length) return [];
    const connection = await this.connection();
    try {
      const results = await runOracleCanonicalIdentityRepair(
        connection,
        this.driver,
        entries,
      );
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
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

  async upsertJobs(rows: readonly JobStoreRecord[]) {
    if (!rows.length) return;
    const connection = await this.connection();
    try {
      const bindDefs = jobBindDefinitions(this.driver);
      await connection.executeMany(
        ORACLE_JOB_MERGE_SQL,
        rows.map(toJobUpsertBinds),
        {
          autoCommit: false,
          ...(bindDefs ? { bindDefs } : {}),
        },
      );
      const searchBindDefs = searchBindDefinitions(this.driver);
      await connection.executeMany(
        ORACLE_JOB_SEARCH_MERGE_SQL,
        rows.map(toJobSearchUpsertBinds),
        {
          autoCommit: false,
          ...(searchBindDefs ? { bindDefs: searchBindDefs } : {}),
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

  /**
   * Writes posting/sponsor signals next to Oracle jobs when the Oracle store is
   * explicitly selected. Employer matches and H-1B sponsors remain in
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
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  /** Non-destructive, idempotent evidence migration; never reconciles or deletes. */
  async upsertVisaSignals(
    signals: readonly (JobStoreVisaSignal & { id?: string })[],
  ) {
    if (!signals.length) return;
    validateVisaSignals(signals);
    const connection = await this.connection();
    try {
      await this.mergeVisaSignals(connection, signals);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
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
    if (!seenExternalJobIds.length) return;
    const connection = await this.connection();
    try {
      const seen = new Set(seenExternalJobIds.map(String));
      const missingIds: string[] = [];
      const pageSize = 500;
      for (let offset = 0; ; offset += pageSize) {
        const existing = await connection.execute<{
          ID: string;
          EXTERNAL_JOB_ID: string;
          LISTING_STATUS: string;
        }>(
          `SELECT id AS "ID", external_job_id AS "EXTERNAL_JOB_ID",
                  listing_status AS "LISTING_STATUS"
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
          }
        }
        if (page.length < pageSize) break;
      }
      if (!missingIds.length) return;
      await connection.executeMany(
        `UPDATE jobs SET
           listing_status = CASE WHEN listing_status = 'open' THEN 'stale' ELSE 'removed' END,
           missing_since_at = COALESCE(missing_since_at, SYSTIMESTAMP),
           removed_at = CASE WHEN listing_status = 'stale' THEN SYSTIMESTAMP ELSE removed_at END
         WHERE id = :id
           AND (listing_status = 'open' OR :runStartedAt IS NULL
             OR missing_since_at IS NULL
             OR missing_since_at < TO_TIMESTAMP_TZ(:runStartedAt, '${ORACLE_ISO_TZ_FORMAT}'))`,
        missingIds.map((id) => ({
          id,
          runStartedAt: runStartedAt ? toOracleTimestamp(runStartedAt) : null,
        })),
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

  private async connection() {
    await this.initialize();
    if (!this.pool) throw new Error('Oracle job store pool is unavailable');
    return this.pool.getConnection();
  }
}
