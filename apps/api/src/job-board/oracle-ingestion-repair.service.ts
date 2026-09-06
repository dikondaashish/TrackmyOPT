import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Queue } from 'bull';
import type { JobStoreVisaSignal } from './job-data-store.contract';
import { OracleJobDataStore } from './oracle-job-data-store';
import {
  SupabaseJobDataStore,
  SUPABASE_JOB_COLUMNS,
  mapSupabaseJobRow,
} from './supabase-job-data-store';
import { canonicalJobHash } from './oracle-backfill';

const REPAIR_PAGE_SIZE = 500;
const LOOKUP_CHUNK_SIZE = 100;
const TIMESTAMP_ONLY_FIELDS = new Set([
  'postedAt',
  'updatedAt',
  'createdAt',
  'firstSeenAt',
  'lastConfirmedAt',
  'missingSinceAt',
  'removedAt',
]);
import {
  compareIdentityRows,
  externalIdentity,
  signalHash,
  signalIdentity,
} from './oracle-ingestion-repair';

/** Temporary repair of the 2026-09-06 ingestion delta. API-key protected,
 * disabled by default, bounded pages, source read-only, no deletion/reconcile.
 * Caller can only select an ordinal in the server-discovered fixed corpus.
 * Remove this service/controller after verification and before cutover. */
@Injectable()
export class OracleIngestionRepairService implements OnModuleDestroy {
  private oracle?: OracleJobDataStore;
  private busy = false;
  private readonly supabase: SupabaseClient;
  private readonly source: SupabaseJobDataStore;

  constructor(
    private readonly config: ConfigService,
    @InjectQueue('job-board') private readonly queue: Queue,
    @InjectQueue('job-board-slow') private readonly slowQueue: Queue,
  ) {
    this.supabase = createClient(
      config.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      config.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
      { auth: { persistSession: false, autoRefreshToken: false } },
    ) as unknown as SupabaseClient;
    this.source = new SupabaseJobDataStore(this.supabase);
  }

  private async guard() {
    if (
      this.config.get('ORACLE_INGESTION_REPAIR_ENABLED') !== true ||
      this.config.get('JOB_DATA_STORE') !== 'supabase'
    )
      throw new Error('repair_disabled');
    for (const queue of [this.queue, this.slowQueue]) {
      if (!(await queue.isPaused())) throw new Error('queue_not_paused');
      const counts = await queue.getJobCounts();
      if (counts.active || counts.waiting || counts.delayed)
        throw new Error('queue_has_runnable_work');
    }
    const count = await this.supabase
      .from('jobs')
      .select('id', { head: true, count: 'exact' });
    if (count.error || count.count !== 11623)
      throw new Error('source_baseline_changed');
    const sources = await this.supabase
      .from('ats_sources')
      .select('id')
      .order('id');
    if (sources.error || sources.data?.length !== 177)
      throw new Error('source_manifest_changed');
    return sources.data.map((row) => String(row.id));
  }

  private target() {
    if (!this.oracle)
      this.oracle = OracleJobDataStore.fromEnvironment({
        JOB_DATA_STORE: 'oracle',
        ORACLE_JOB_DB_CONNECT_STRING: this.config.get(
          'ORACLE_JOB_DB_CONNECT_STRING',
        ),
        ORACLE_JOB_DB_USER: this.config.get('ORACLE_JOB_DB_USER'),
        ORACLE_JOB_DB_PASSWORD: this.config.get('ORACLE_JOB_DB_PASSWORD'),
        ORACLE_JOB_DB_POOL_MAX: '1',
      });
    return this.oracle;
  }

  async page(index: number, offset: number, write: boolean) {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= 177 ||
      !Number.isInteger(offset) ||
      offset < 0 ||
      offset > 20000 ||
      offset % REPAIR_PAGE_SIZE !== 0
    )
      throw new Error('invalid_page');
    if (this.busy) throw new Error('repair_busy');
    this.busy = true;
    let phase = 'guard';
    try {
      const sources = await this.guard();
      const sourceId = sources[index];
      const oracle = this.target();
      phase = 'health';
      await oracle.healthCheck();
      phase = 'source_page';
      const left = await this.source.listSourceJobsPage(
        sourceId,
        offset,
        REPAIR_PAGE_SIZE,
      );
      phase = 'oracle_page';
      const right = await oracle.listSourceJobsPage(
        sourceId,
        offset,
        REPAIR_PAGE_SIZE,
      );
      phase = 'natural_identity';
      const matches = await this.getOracleRowsByExternalIds(
        oracle,
        sourceId,
        left.rows.map((row) => row.externalJobId),
      );
      const differences = compareIdentityRows(left.rows, matches);

      // Reciprocal lookup catches Oracle-only identities even with different UUIDs.
      let extra: Array<{ id: string; externalJobId: string }> = [];
      if (right.rows.length) {
        if (!left.rows.length) {
          // Once the source page is exhausted, every target row on this page
          // is outside the source corpus. Avoid a second large Supabase query
          // on this terminal page, which can time out under database load.
          extra = right.rows.map((row) => ({
            id: row.id,
            externalJobId: row.externalJobId,
          }));
        } else {
          const lookupRows = await this.getSupabaseRowsByExternalIds(
            sourceId,
            right.rows.map((row) => row.externalJobId),
          );
          const keys = new Set(lookupRows.map(externalIdentity));
          extra = right.rows
            .filter((row) => !keys.has(externalIdentity(row)))
            .map((row) => ({ id: row.id, externalJobId: row.externalJobId }));
        }
      }
      let deletedExtras = 0;
      if (write && extra.length) {
        deletedExtras = await oracle.deleteVerifiedExtras(
          extra.map((row) => ({
            id: row.id,
            sourceId,
            externalJobId: row.externalJobId,
          })),
        );
      }
      const changedIds = new Set(differences.map((row) => row.id));
      const changed = left.rows.filter((row) => changedIds.has(row.id));
      const timestampOnly = differences
        .filter(
          (difference) =>
            !difference.missing &&
            !difference.uuid &&
            difference.fields.length > 0 &&
            difference.fields.every((field) =>
              TIMESTAMP_ONLY_FIELDS.has(field),
            ),
        )
        .map((difference) => difference.id);
      const timestampOnlyIds = new Set(timestampOnly);
      const fullChanged = changed.filter(
        (row) => !timestampOnlyIds.has(row.id),
      );
      if (write && changed.length) {
        const repairs = differences
          .filter((row) => row.uuid)
          .map((row) => ({
            canonicalId: row.id,
            sourceAts: row.sourceAts,
            boardToken: row.boardToken,
            externalJobId: row.externalJobId,
          }));
        await oracle.repairCanonicalIdentities(repairs);
        await oracle.patchJobTimestamps(
          changed.filter((row) => timestampOnlyIds.has(row.id)),
        );
        await oracle.upsertJobs(fullChanged);
      }

      const after = write
        ? await this.getOracleRowsByExternalIds(
            oracle,
            sourceId,
            left.rows.map((row) => row.externalJobId),
          )
        : matches;
      phase = 'job_readback';
      const remaining = compareIdentityRows(left.rows, after);
      if (write && remaining.length) throw new Error('job_readback_mismatch');

      phase = 'source_evidence';
      const sourceSignals = await this.readSourceSignals(
        left.rows.map((row) => row.id),
      );
      const targetIds = new Map(
        after.map((row) => [externalIdentity(row), row.id]),
      );
      const idMap = new Map(
        left.rows.flatMap((row) => {
          const id = targetIds.get(externalIdentity(row));
          return id ? [[id, row.id] as const] : [];
        }),
      );
      phase = 'oracle_evidence';
      const targetSignals = (
        await this.getOracleSignals(oracle, [...idMap.keys()])
      ).map((row) => ({ ...row, jobId: idMap.get(row.jobId)! }));
      const signalMap = new Map(
        targetSignals.map((row) => [signalIdentity(row), row]),
      );
      const sourceKeys = new Set(sourceSignals.map(signalIdentity));
      const evidenceChanges = sourceSignals.filter(
        (row) =>
          !signalMap.has(signalIdentity(row)) ||
          signalHash(row) !== signalHash(signalMap.get(signalIdentity(row))!),
      );
      const evidenceExtra = targetSignals.filter(
        (row) => !sourceKeys.has(signalIdentity(row)),
      );
      if (write && evidenceExtra.length)
        throw new Error('unexpected_oracle_evidence');
      if (write && evidenceChanges.length) {
        phase = 'evidence_write';
        await oracle.upsertVisaSignals(evidenceChanges);
      }
      phase = 'evidence_readback';
      const finalSignals = write
        ? await this.getOracleSignals(
            oracle,
            left.rows.map((row) => row.id),
          )
        : targetSignals;
      const finalSignalMap = new Map(
        finalSignals.map((row) => [signalIdentity(row), signalHash(row)]),
      );
      const signalMismatches = sourceSignals.filter(
        (row) => finalSignalMap.get(signalIdentity(row)) !== signalHash(row),
      ).length;
      if (
        write &&
        (signalMismatches || finalSignals.length !== sourceSignals.length)
      )
        throw new Error('evidence_readback_mismatch');
      const states = (rows: typeof left.rows) =>
        Object.fromEntries(
          ['open', 'stale', 'removed'].map((state) => [
            state,
            rows.filter((row) => row.listingStatus === state).length,
          ]),
        );
      return {
        status: 'ok',
        index,
        sourceId,
        offset,
        nextOffset:
          offset + REPAIR_PAGE_SIZE < Math.max(left.total, right.total)
            ? offset + REPAIR_PAGE_SIZE
            : null,
        sourceTotal: left.total,
        oracleTotalBefore: right.total,
        selected: left.rows.length,
        oracleSelected: right.rows.length,
        sourceStates: states(left.rows),
        oracleStatesBefore: states(right.rows),
        differences,
        extra,
        written: write ? changed.length : 0,
        deletedExtras,
        verified: left.rows.length - remaining.length,
        remaining: remaining.length,
        sourceHash: left.rows.map(canonicalJobHash),
        oracleHash: left.rows.map((row) => {
          const target = after.find(
            (candidate) =>
              externalIdentity(candidate) === externalIdentity(row),
          );
          return target ? canonicalJobHash(target) : null;
        }),
        sourceSignals: sourceSignals.length,
        oracleSignals: finalSignals.length,
        signalMismatches,
        signalChanges: evidenceChanges.map((row) => ({
          jobId: row.jobId,
          signalType: row.signalType,
          source: row.source,
          missing: !signalMap.has(signalIdentity(row)),
          sourceUrlHash: signalHash({ ...row, evidenceSnippet: '' }),
        })),
        evidenceExtra: evidenceExtra.map((row) => ({
          jobId: row.jobId,
          signalType: row.signalType,
          source: row.source,
        })),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (/^[a-z_]+$/.test(message)) throw error;
      const code =
        message.match(/\b(?:NJS|ORA)-\d+\b/)?.[0].toLowerCase() || 'unknown';
      throw new Error(`repair_${phase}_${code}`);
    } finally {
      this.busy = false;
    }
  }

  private async getOracleRowsByExternalIds(
    oracle: OracleJobDataStore,
    sourceId: string,
    ids: readonly string[],
  ) {
    const rows = [] as Awaited<
      ReturnType<OracleJobDataStore['getJobsByExternalIds']>
    >;
    for (let offset = 0; offset < ids.length; offset += LOOKUP_CHUNK_SIZE) {
      rows.push(
        ...(await oracle.getJobsByExternalIds(
          sourceId,
          ids.slice(offset, offset + LOOKUP_CHUNK_SIZE),
        )),
      );
    }
    return rows;
  }

  private async getSupabaseRowsByExternalIds(
    sourceId: string,
    ids: readonly string[],
  ) {
    const rows = [] as ReturnType<typeof mapSupabaseJobRow>[];
    for (let offset = 0; offset < ids.length; offset += LOOKUP_CHUNK_SIZE) {
      const lookup = await this.supabase
        .from('jobs')
        .select(SUPABASE_JOB_COLUMNS)
        .eq('source_id', sourceId)
        .in('external_job_id', ids.slice(offset, offset + LOOKUP_CHUNK_SIZE));
      if (lookup.error) throw new Error('source_identity_read_failed');
      rows.push(...(lookup.data || []).map(mapSupabaseJobRow));
    }
    return rows;
  }

  private async getOracleSignals(
    oracle: OracleJobDataStore,
    ids: readonly string[],
  ) {
    const rows = [] as Awaited<
      ReturnType<OracleJobDataStore['listVisaSignals']>
    >;
    for (let offset = 0; offset < ids.length; offset += LOOKUP_CHUNK_SIZE) {
      rows.push(
        ...(await oracle.listVisaSignals(
          ids.slice(offset, offset + LOOKUP_CHUNK_SIZE),
        )),
      );
    }
    return rows;
  }

  private async readSourceSignals(
    ids: string[],
  ): Promise<JobStoreVisaSignal[]> {
    if (!ids.length) return [];
    const signals: JobStoreVisaSignal[] = [];
    for (let offset = 0; offset < ids.length; offset += LOOKUP_CHUNK_SIZE) {
      const result = await this.supabase
        .from('job_visa_signals')
        .select(
          'job_id,signal_type,evidence_snippet,source_url,observed_date,confidence,source',
        )
        .in('job_id', ids.slice(offset, offset + LOOKUP_CHUNK_SIZE));
      if (result.error) throw new Error('source_evidence_read_failed');
      signals.push(
        ...(result.data || []).map((row) => ({
          jobId: String(row.job_id),
          signalType: String(row.signal_type),
          evidenceSnippet: String(row.evidence_snippet),
          sourceUrl: String(row.source_url),
          observedDate: String(row.observed_date),
          confidence: Number(row.confidence),
          source: String(row.source),
        })),
      );
    }
    return signals;
  }

  async onModuleDestroy() {
    await this.oracle?.close();
  }
}
