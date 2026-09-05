import { InjectQueue } from '@nestjs/bull';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as Bull from 'bull';
import {
  AtsScraperRunnerError,
  fetchAuthorizedAtsJobs,
  type ScrapedAtsJob,
} from './ats-scrapers.runner';
import { EmployerMatchService } from './employer-match.service';
import { JobVisaSignalService } from './job-visa-signal.service';
import {
  planListingReconciliation,
  type PersistedJobListing,
} from './job-listing-reconciliation';
import { fetchAllPages } from './paginate';
import {
  calculatePacingGapMs,
  MIN_INTER_REQUEST_GAP_MS,
  planSourceIngestionJobs,
} from './source-job-planning';
import {
  classifySourceError,
  planSourceFailure,
  planSourceSuccess,
  shouldAttemptSource,
  toSourceHealthDatabaseUpdate,
} from './source-health';
import {
  ingestionReservationParams,
  planIngestionOrchestratorOptions,
} from './scheduler-run-id';
import type { SchedulerContext } from './scheduler-run-id';
import {
  queueSchedulerRun,
  type SchedulerAttempt,
} from './scheduler-run-ledger';
import type {
  JobDataStore,
  JobStorePage,
  JobStoreRecord,
  JobStoreSearch,
} from './job-data-store.contract';
import { JOB_DATA_STORE } from './job-data-store.provider';

type AtsSource = {
  id: string;
  ats_type: string;
  board_token: string;
  base_url: string;
  company_id: string | null;
  employer_board_name: string | null;
  enabled: boolean;
};

type Reservation = { audit_log_id: string; accepted: boolean; reason: string };
type IngestionResult =
  | { sourceId: string; skipped: string }
  | {
      sourceId: string;
      jobsFound: number;
      jobsNew: number;
      jobsDuplicate: number;
      jobsStale: number;
      jobsRemoved: number;
      jobsReopened: number;
    };

type PersistenceResult = {
  jobsNew: number;
  jobsDuplicate: number;
  jobsStale: number;
  jobsRemoved: number;
  jobsReopened: number;
};

type SourceBoardHealth = {
  id: string;
  consecutive_failures: number;
  circuit_state: 'closed' | 'open';
  next_retry_at: string | null;
};

const sleep = (durationMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, durationMs));

@Injectable()
export class JobBoardService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobBoardService.name);
  private readonly supabase: SupabaseClient;
  private shuttingDown = false;
  private readonly inFlightAuditIds = new Set<string>();
  private readonly activeSourceWork = new Set<Promise<unknown>>();
  private pacingTail: Promise<void> = Promise.resolve();
  private nextRequestAt = 0;

  constructor(
    private readonly config: ConfigService,
    @InjectQueue('job-board') private readonly queue: Bull.Queue,
    @InjectQueue('job-board-slow') private readonly slowQueue: Bull.Queue,
    private readonly employerMatches: EmployerMatchService,
    private readonly visaSignals: JobVisaSignalService,
    @Inject(JOB_DATA_STORE) private readonly jobStore: JobDataStore,
  ) {
    this.supabase = createClient(
      this.config.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
    ) as unknown as SupabaseClient;
  }

  /** Emergency-only control for the two job-board Bull queues. */
  async onModuleInit() {
    if (this.config.get<boolean>('JOB_BOARD_QUEUE_PAUSE_ON_BOOT') !== true)
      return;
    // Pause globally so persisted Bull work cannot continue on another worker
    // or resume while this process is being inspected/restarted.
    await Promise.all([this.queue.pause(), this.slowQueue.pause()]);
    this.logger.warn('Job-board Bull queues paused by boot safety guard');
  }

  private assertQueueControlEnabled() {
    if (this.config.get<boolean>('JOB_BOARD_QUEUE_CONTROL_ENABLED') !== true)
      throw new Error('Job-board queue control is disabled');
  }

  async getIngestionQueueState() {
    this.assertQueueControlEnabled();
    const [normal, slow] = await Promise.all([
      this.queue.getJobCounts(),
      this.slowQueue.getJobCounts(),
    ]);
    return {
      queues: {
        'job-board': normal,
        'job-board-slow': slow,
      },
      stalled: 0,
      note: 'Bull does not retain stalled jobs as a persistent queue state; inspect worker logs for stall events.',
    };
  }

  async pauseIngestionQueues() {
    this.assertQueueControlEnabled();
    await Promise.all([this.queue.pause(), this.slowQueue.pause()]);
    return this.getIngestionQueueState();
  }

  async resumeIngestionQueues() {
    this.assertQueueControlEnabled();
    await Promise.all([this.queue.resume(), this.slowQueue.resume()]);
    return this.getIngestionQueueState();
  }

  async queueEnabledSources(context: SchedulerContext) {
    if (this.shuttingDown) throw new Error('Job-board worker is restarting');
    await this.finalizeStaleAudits();
    return queueSchedulerRun(
      context,
      {
        claim: (candidate) => this.claimSchedulerRun(candidate),
        markQueued: (schedulerRunId, queuedAt) =>
          this.markSchedulerRunQueued(schedulerRunId, queuedAt),
        markFailed: (schedulerRunId, errorMessage) =>
          this.markSchedulerRunFailed(schedulerRunId, errorMessage),
        recordAttempt: (attempt) => this.recordSchedulerAttempt(attempt),
      },
      () =>
        this.queue.add(
          'ingest-enabled-sources',
          context,
          planIngestionOrchestratorOptions(context.schedulerRunId),
        ),
    );
  }

  /** Server-side job read boundary. The selected store owns filtering and
   * pagination; callers never need to know whether records live in Postgres
   * or Oracle. */
  listJobs(query: JobStoreSearch): Promise<JobStorePage> {
    return this.jobStore.listJobs(query);
  }

  getJob(id: string): Promise<JobStoreRecord | null> {
    return this.jobStore.getJob(id);
  }

  /** Queue one enabled source for targeted recovery without touching other boards. */
  async queueSingleSource(sourceId: string, context: SchedulerContext) {
    if (this.shuttingDown) throw new Error('Job-board worker is restarting');
    await this.finalizeStaleAudits();
    const { data: source, error } = await this.supabase
      .from('ats_sources')
      .select(
        'id, ats_type, board_token, base_url, company_id, employer_board_name, enabled',
      )
      .eq('id', sourceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!source) throw new Error(`Unknown ATS source ${sourceId}`);
    if (!source.enabled) throw new Error(`ATS source ${sourceId} is disabled`);

    return queueSchedulerRun(
      context,
      {
        claim: (candidate) => this.claimSchedulerRun(candidate),
        markQueued: (schedulerRunId, queuedAt) =>
          this.markSchedulerRunQueued(schedulerRunId, queuedAt),
        markFailed: (schedulerRunId, errorMessage) =>
          this.markSchedulerRunFailed(schedulerRunId, errorMessage),
        recordAttempt: (attempt) => this.recordSchedulerAttempt(attempt),
      },
      async () => {
        const slow = (await this.getSlowSourceIds([sourceId])).has(sourceId);
        const planned = planSourceIngestionJobs(
          [sourceId],
          context,
          MIN_INTER_REQUEST_GAP_MS,
        )[0];
        // Retain the completed ID so a repeated recovery request is suppressed.
        const options = { ...planned.opts, delay: 0, removeOnComplete: 3 };
        return (slow ? this.slowQueue : this.queue).add(
          planned.name,
          planned.data,
          options,
        );
      },
    );
  }

  async queueCompanyDiscovery() {
    return this.queue.add(
      'discover-company-batch',
      {},
      {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async enqueueEnabledSourceJobs(context: SchedulerContext) {
    if (context.schedulerRunId.startsWith('job-board-hour-')) {
      const priorRunActive = await this.hasActiveHourlySourceWork(context);
      if (priorRunActive) {
        this.logger.warn(
          `Deferring ${context.schedulerRunId}: a prior hourly source run is still active`,
        );
        return { sourcesQueued: 0, slowSourcesQueued: 0, deferred: true };
      }
    }
    const { data, error } = await this.supabase
      .from('ats_sources')
      .select('id')
      .eq('enabled', true);
    if (error) throw new Error(error.message);
    const sourceIds = (data || []).map((source) => String(source.id));
    const slowSourceIds = await this.getSlowSourceIds(sourceIds);
    const fastSourceIds = sourceIds.filter((id) => !slowSourceIds.has(id));
    const pacingGapMs = calculatePacingGapMs(sourceIds.length);
    const fastJobs = planSourceIngestionJobs(
      fastSourceIds,
      context,
      pacingGapMs,
    );
    const slowJobs = planSourceIngestionJobs(
      [...slowSourceIds],
      context,
      pacingGapMs,
    );
    if (fastJobs.length) await this.queue.addBulk(fastJobs);
    if (slowJobs.length) await this.slowQueue.addBulk(slowJobs);
    return {
      sourcesQueued: sourceIds.length,
      slowSourcesQueued: slowJobs.length,
      deferred: false,
    };
  }

  private async getSlowSourceIds(sourceIds: string[]) {
    if (!sourceIds.length) return new Set<string>();
    const latestDurationBySource = new Map<string, number>();
    const rows = await fetchAllPages(async (from, to) => {
      const result = await this.supabase
        .from('ingestion_audit_log')
        .select('source_id, run_at, completed_at, status')
        .eq('status', 'succeeded')
        .not('completed_at', 'is', null)
        .order('run_at', { ascending: false })
        .range(from, to);
      return {
        data: result.data || [],
        error: result.error ? { message: result.error.message } : null,
      };
    });
    for (const row of rows) {
      const sourceId = String(row.source_id || '');
      if (!sourceId || latestDurationBySource.has(sourceId)) continue;
      const started = Date.parse(String(row.run_at));
      const completed = Date.parse(String(row.completed_at));
      if (Number.isFinite(started) && Number.isFinite(completed)) {
        latestDurationBySource.set(sourceId, Math.max(0, completed - started));
      }
    }
    return new Set(
      sourceIds.filter(
        (sourceId) => (latestDurationBySource.get(sourceId) || 0) > 60_000,
      ),
    );
  }

  private async hasActiveHourlySourceWork(context: SchedulerContext) {
    const { data, error } = await this.supabase
      .from('ingestion_audit_log')
      .select('id')
      .eq('status', 'started')
      .like('scheduler_run_id', 'job-board-hour-%')
      .neq('scheduler_run_id', context.schedulerRunId)
      .limit(1);
    if (error) throw new Error(error.message);
    if (data?.length) return true;

    const pendingStates: Bull.JobStatus[] = [
      'waiting',
      'active',
      'delayed',
      'paused',
    ];
    const pendingJobs = await Promise.all([
      this.queue.getJobs(pendingStates),
      this.slowQueue.getJobs(pendingStates),
    ]);
    return pendingJobs.some((jobs) =>
      jobs.some((job) => {
        const schedulerRunId = (job.data as SchedulerContext | undefined)
          ?.schedulerRunId;
        return (
          typeof schedulerRunId === 'string' &&
          schedulerRunId.startsWith('job-board-hour-') &&
          schedulerRunId !== context.schedulerRunId
        );
      }),
    );
  }

  async ingestSourceById(
    sourceId: string,
    context: SchedulerContext,
  ): Promise<IngestionResult> {
    if (this.shuttingDown) return { sourceId, skipped: 'instance_restarting' };
    return this.trackSourceWork(() =>
      this.ingestSourceByIdInternal(sourceId, context),
    );
  }

  private async ingestSourceByIdInternal(
    sourceId: string,
    context: SchedulerContext,
  ): Promise<IngestionResult> {
    const { data, error } = await this.supabase
      .from('ats_sources')
      .select(
        'id, ats_type, board_token, base_url, company_id, employer_board_name, enabled',
      )
      .eq('id', sourceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error(`Unknown ATS source ${sourceId}`);
    return this.ingestSource(data as AtsSource, context);
  }

  private trackSourceWork<T>(work: () => Promise<T>): Promise<T> {
    const tracked = Promise.resolve()
      .then(work)
      .finally(() => this.activeSourceWork.delete(tracked));
    this.activeSourceWork.add(tracked);
    return tracked;
  }

  private async ingestSource(source: AtsSource, context: SchedulerContext) {
    if (this.shuttingDown)
      return { sourceId: source.id, skipped: 'instance_restarting' };
    if (!source.enabled)
      return { sourceId: source.id, skipped: 'source_disabled' };
    if (!source.employer_board_name?.trim()) {
      throw new Error(
        `Source ${source.id} requires employer_board_name before ingestion`,
      );
    }
    const sourceBoard = await this.getSourceBoardHealth(source.id);
    if (
      sourceBoard &&
      !shouldAttemptSource({
        circuitState: sourceBoard.circuit_state,
        nextRetryAt: sourceBoard.next_retry_at,
        now: new Date(),
      })
    ) {
      return { sourceId: source.id, skipped: 'source_circuit_open' };
    }

    const { data: reservationRows, error: reservationError } =
      (await this.supabase.rpc(
        'reserve_ats_ingestion',
        ingestionReservationParams(source.id, context),
      )) as unknown as {
        data: Reservation[] | null;
        error: { message: string } | null;
      };
    if (reservationError) throw new Error(reservationError.message);
    const reservation = reservationRows?.[0];
    if (!reservation?.accepted)
      return {
        sourceId: source.id,
        skipped: reservation?.reason || 'not_reserved',
      };

    this.inFlightAuditIds.add(reservation.audit_log_id);
    try {
      await this.waitForRequestSlot(
        'pacingGapMs' in context && typeof context.pacingGapMs === 'number'
          ? context.pacingGapMs
          : MIN_INTER_REQUEST_GAP_MS,
      );
      const fetched = await fetchAuthorizedAtsJobs(source);
      const persistence = await this.persistSourceJobs(
        source,
        fetched.jobs,
        fetched.metadata.complete,
      );
      // onModuleDestroy finalizes the audit as "instance restarted" before
      // waiting for this promise to settle. Do not attempt to complete that
      // already-terminal audit or record post-shutdown source health.
      if (this.shuttingDown)
        return { sourceId: source.id, skipped: 'instance_restarting' };
      await this.complete(
        reservation.audit_log_id,
        fetched.jobs.length,
        persistence,
        fetched.metadata.requests_made,
      );
      try {
        await this.recordSourceSuccess(sourceBoard?.id);
      } catch (healthError) {
        const message =
          healthError instanceof Error
            ? healthError.message
            : 'Unknown source health update error';
        this.logger.error(
          `Ingestion succeeded but source health could not be recorded for ${source.id}: ${message}`,
        );
      }
      return {
        sourceId: source.id,
        jobsFound: fetched.jobs.length,
        ...persistence,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown ingestion error';
      if (this.shuttingDown) throw error;
      await this.complete(
        reservation.audit_log_id,
        0,
        {
          jobsNew: 0,
          jobsDuplicate: 0,
          jobsStale: 0,
          jobsRemoved: 0,
          jobsReopened: 0,
        },
        error instanceof AtsScraperRunnerError ? error.requestsMade : 0,
        message,
      );
      await this.recordSourceFailure(sourceBoard, message);
      this.logger.error(`Job-board source ${source.id} failed: ${message}`);
      throw error;
    } finally {
      this.inFlightAuditIds.delete(reservation.audit_log_id);
    }
  }

  /** Reserve a process-wide request slot without delaying jobs at enqueue time. */
  private async waitForRequestSlot(gapMs: number) {
    let release!: () => void;
    const previous = this.pacingTail;
    this.pacingTail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      const waitMs = Math.max(0, this.nextRequestAt - Date.now());
      if (waitMs > 0) await sleep(waitMs);
      this.nextRequestAt =
        Date.now() + Math.max(MIN_INTER_REQUEST_GAP_MS, gapMs);
    } finally {
      release();
    }
  }

  /** Mark a source audit terminal when Bull reports a stall or exhausted retry. */
  async markSourceAuditFailed(
    sourceId: string,
    context: SchedulerContext,
    reason: string,
  ) {
    const { data, error } = await this.supabase
      .from('ingestion_audit_log')
      .select('id')
      .eq('source_id', sourceId)
      .eq('scheduler_run_id', context.schedulerRunId)
      .eq('status', 'started')
      .order('run_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data?.id) return false;
    const update = await this.supabase
      .from('ingestion_audit_log')
      .update({
        status: 'failed',
        error_message: reason.slice(0, 500),
        completed_at: new Date().toISOString(),
      })
      .eq('id', data.id)
      .eq('status', 'started');
    if (update.error) throw new Error(update.error.message);
    this.inFlightAuditIds.delete(String(data.id));
    return true;
  }

  /** Finalize in-flight work before Nest closes the worker on SIGTERM. */
  async onModuleDestroy() {
    this.shuttingDown = true;
    const auditIds = [...this.inFlightAuditIds];
    try {
      await Promise.all(
        auditIds.map(async (id) => {
          await this.complete(
            id,
            0,
            {
              jobsNew: 0,
              jobsDuplicate: 0,
              jobsStale: 0,
              jobsRemoved: 0,
              jobsReopened: 0,
            },
            0,
            'instance restarted',
          );
        }),
      );
      this.inFlightAuditIds.clear();
    } finally {
      // Bull can deliver SIGTERM while a source is between its fetch and
      // persistence steps. Wait for those promises to settle before closing
      // the shared Oracle pool; otherwise active work receives NJS-064.
      await Promise.allSettled([...this.activeSourceWork]);
      await this.jobStore.close?.();
    }
  }

  /** Recover audits stranded by a hard restart or lost Bull worker heartbeat. */
  private async finalizeStaleAudits() {
    const cutoff = new Date(Date.now() - 5 * 60_000).toISOString();
    const { error } = await this.supabase
      .from('ingestion_audit_log')
      .update({
        status: 'failed',
        error_message: 'worker heartbeat expired',
        completed_at: new Date().toISOString(),
      })
      .eq('status', 'started')
      .lt('run_at', cutoff);
    if (error)
      this.logger.warn(`Could not finalize stale audits: ${error.message}`);
  }

  private async persistSourceJobs(
    source: AtsSource,
    scraped: ScrapedAtsJob[],
    responseComplete: boolean,
  ) {
    const ids = [...new Set(scraped.map((job) => job.external_job_id))];
    const persistedStoreJobs = await this.jobStore.listSourceJobs(source.id);
    const persistedJobs: PersistedJobListing[] = persistedStoreJobs.map(
      (job) => ({
        id: job.id,
        external_job_id: job.externalJobId,
        listing_status: job.listingStatus,
      }),
    );
    const existingByExternalId = new Map(
      persistedStoreJobs.map((job) => [job.externalJobId, job]),
    );
    const reconciliation = planListingReconciliation(persistedJobs, ids, {
      complete: responseComplete,
    });
    const now = new Date().toISOString();
    const records: JobStoreRecord[] = scraped.map((job) => {
      const existing = existingByExternalId.get(job.external_job_id);
      return {
        id: existing?.id || randomUUID(),
        sourceId: source.id,
        sourceAts: source.ats_type,
        boardToken: source.board_token,
        externalJobId: job.external_job_id,
        title: job.title,
        companyName:
          job.company_name ||
          source.employer_board_name ||
          existing?.companyName ||
          '',
        location: job.location,
        department: job.department,
        description: job.description,
        jobUrl: job.job_url,
        postedAt: job.posted_at,
        updatedAt: now,
        optEligible: existing?.optEligible ?? null,
        stemOptEligible: existing?.stemOptEligible ?? null,
        cptEligible: existing?.cptEligible ?? null,
        h1bSponsorStatus: existing?.h1bSponsorStatus ?? null,
        createdAt: existing?.createdAt || now,
        firstSeenAt: existing?.firstSeenAt || now,
        lastConfirmedAt: now,
        listingStatus: 'open',
        employerBoardName: source.employer_board_name,
        sourceTrustTier: 'verified_ats',
        employerMatchId: existing?.employerMatchId ?? null,
        missingSinceAt: null,
        removedAt: null,
      };
    });
    const fresh = records.filter(
      (job) => !existingByExternalId.has(job.externalJobId),
    );
    await this.jobStore.upsertJobs(records);
    if (responseComplete) {
      await this.jobStore.reconcileSource(source.id, ids);
    }
    const employerMatchIds = await this.employerMatches.syncSource(
      source,
      records,
    );
    if (employerMatchIds.size) {
      const linkedRecords = records.map((record) => ({
        ...record,
        employerMatchId:
          employerMatchIds.get(record.companyName.trim()) ||
          record.employerMatchId,
      }));
      await this.jobStore.upsertJobs(linkedRecords);
    }
    await this.visaSignals.syncSource(source.id, records);
    return {
      jobsNew: fresh.length,
      jobsDuplicate: records.length - fresh.length,
      jobsStale: reconciliation.staleJobIds.length,
      jobsRemoved: reconciliation.removedJobIds.length,
      jobsReopened: reconciliation.reopenedJobIds.length,
    };
  }

  private async complete(
    id: string,
    found: number,
    result: PersistenceResult,
    httpRequestsMade: number,
    failure?: string,
  ) {
    const { error } = await this.supabase.rpc('complete_ats_ingestion', {
      audit_id: id,
      found_count: found,
      new_count: result.jobsNew,
      duplicate_count: result.jobsDuplicate,
      stale_count: result.jobsStale,
      removed_count: result.jobsRemoved,
      reopened_count: result.jobsReopened,
      http_request_count: httpRequestsMade,
      failure_message: failure || null,
    });
    if (error)
      this.logger.error(
        `Could not complete ingestion audit ${id}: ${error.message}`,
      );
  }

  private async getSourceBoardHealth(sourceId: string) {
    const { data, error } = await this.supabase
      .from('ats_boards')
      .select('id, consecutive_failures, circuit_state, next_retry_at')
      .eq('legacy_source_id', sourceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as SourceBoardHealth | null;
  }

  private async recordSourceSuccess(boardId?: string) {
    if (!boardId) return;
    const now = new Date().toISOString();
    const health = planSourceSuccess();
    const { error } = await this.supabase
      .from('ats_boards')
      .update({
        ...toSourceHealthDatabaseUpdate(health),
        last_fetch_at: now,
        last_success_at: now,
      })
      .eq('id', boardId);
    if (error) throw new Error(error.message);
  }

  private async recordSourceFailure(
    board: SourceBoardHealth | null,
    message: string,
  ) {
    if (!board) return;
    const now = new Date();
    const plan = planSourceFailure({
      consecutiveFailures: board.consecutive_failures,
      now,
    });
    const classification = classifySourceError(message);
    const nowIso = now.toISOString();
    const update = await this.supabase
      .from('ats_boards')
      .update({
        ...toSourceHealthDatabaseUpdate(plan),
        last_fetch_at: nowIso,
        last_failure_at: nowIso,
      })
      .eq('id', board.id);
    if (update.error) throw new Error(update.error.message);
    const errorLog = await this.supabase.from('source_errors').insert({
      ats_board_id: board.id,
      error_type: classification.errorType,
      message,
      retryable: classification.retryable,
      metadata: {
        consecutive_failures: plan.consecutiveFailures,
        circuit_state: plan.circuitState,
      },
    });
    if (errorLog.error) throw new Error(errorLog.error.message);
  }

  private async claimSchedulerRun(context: SchedulerContext) {
    const { error } = await this.supabase.from('scheduler_runs').insert({
      scheduler_run_id: context.schedulerRunId,
      trigger_origin: context.triggerOrigin,
      bull_job_id: context.schedulerRunId,
      dispatch_status: 'dispatched',
      dispatched_at: new Date().toISOString(),
    });
    if (!error) return true;
    if ('code' in error && error.code === '23505') {
      const { data, error: lookupError } = await this.supabase
        .from('scheduler_runs')
        .select('dispatch_status')
        .eq('scheduler_run_id', context.schedulerRunId)
        .maybeSingle();
      if (lookupError) throw new Error(lookupError.message);
      if (data?.dispatch_status === 'failed') {
        const { error: retryError } = await this.supabase
          .from('scheduler_runs')
          .update({
            dispatch_status: 'dispatched',
            error_message: null,
            dispatched_at: new Date().toISOString(),
            queued_at: null,
            bull_job_id: context.schedulerRunId,
          })
          .eq('scheduler_run_id', context.schedulerRunId)
          .eq('dispatch_status', 'failed');
        if (retryError) throw new Error(retryError.message);
        return true;
      }
      if (data?.dispatch_status === 'dispatched') {
        const { data: claimed, error: claimError } = await this.supabase
          .from('scheduler_runs')
          .update({ dispatch_status: 'queued', queued_at: null })
          .eq('scheduler_run_id', context.schedulerRunId)
          .eq('dispatch_status', 'dispatched')
          .select('scheduler_run_id')
          .maybeSingle();
        if (claimError) throw new Error(claimError.message);
        return Boolean(claimed);
      }
      return false;
    }
    throw new Error(error.message);
  }

  private async markSchedulerRunQueued(
    schedulerRunId: string,
    queuedAt: string,
  ) {
    const { error } = await this.supabase
      .from('scheduler_runs')
      .update({
        dispatch_status: 'queued',
        error_message: null,
        queued_at: queuedAt,
      })
      .eq('scheduler_run_id', schedulerRunId);
    if (error) throw new Error(error.message);
  }

  async markSchedulerRunDeferred(schedulerRunId: string, reason: string) {
    const { error } = await this.supabase
      .from('scheduler_runs')
      .update({
        dispatch_status: 'deferred',
        error_message: reason.slice(0, 500),
      })
      .eq('scheduler_run_id', schedulerRunId);
    if (error) throw new Error(error.message);
  }

  private async markSchedulerRunFailed(
    schedulerRunId: string,
    errorMessage: string,
  ) {
    const { error } = await this.supabase
      .from('scheduler_runs')
      .update({
        dispatch_status: 'failed',
        error_message: errorMessage.slice(0, 500),
      })
      .eq('scheduler_run_id', schedulerRunId);
    if (error) throw new Error(error.message);
  }

  private async recordSchedulerAttempt(attempt: SchedulerAttempt) {
    const { error } = await this.supabase
      .from('scheduler_run_attempts')
      .insert({
        scheduler_run_id: attempt.schedulerRunId,
        trigger_origin: attempt.triggerOrigin,
        bull_job_id: attempt.bullJobId,
        outcome: attempt.outcome,
        queued_at: attempt.queuedAt,
      });
    if (error) throw new Error(error.message);
  }
}
