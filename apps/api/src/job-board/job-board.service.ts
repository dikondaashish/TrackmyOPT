import { InjectQueue } from '@nestjs/bull';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  selectSlowSourceIds,
} from './source-job-planning';
import { shouldAttemptSource } from './source-health';
import {
  ingestionReservationParams,
  normalizeSchedulerRunId,
  planIngestionOrchestratorOptions,
} from './scheduler-run-id';
import type {
  IngestionStoreContext,
  SchedulerContext,
} from './scheduler-run-id';
import { resolveJobDataStore } from './job-data-store.config';
import { queueSchedulerRun } from './scheduler-run-ledger';
import { SupabaseSchedulerRunStore } from './supabase-scheduler-run-store';
import type {
  JobDataStore,
  JobStorePage,
  JobStoreRecord,
  JobStoreSearch,
} from './job-data-store.contract';
import { JOB_DATA_STORE } from './job-data-store.provider';
import { SourceBoardHealthStore } from './job-board-source-health.store';
import { buildJobStoreRecords } from './job-board-records';
import {
  queueJobsForRun,
  readIngestionQueueState,
  readIngestionRunStatus,
} from './job-board-queue-inspection';
import {
  sleep,
  type AtsSource,
  type IngestionResult,
  type PersistenceResult,
  type Reservation,
} from './job-board.types';

/** How often a still-pending ingestion stage logs a warning. */
const STAGE_WATCHDOG_INTERVAL_MS = 60_000;

@Injectable()
export class JobBoardService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobBoardService.name);
  private readonly supabase: SupabaseClient;
  private readonly schedulerRuns: SupabaseSchedulerRunStore;
  private readonly sourceHealth: SourceBoardHealthStore;
  private shuttingDown = false;
  private readonly inFlightAuditIds = new Set<string>();
  private readonly activeSourceWork = new Set<Promise<unknown>>();
  private pacingTail: Promise<void> = Promise.resolve();
  private nextRequestAt = 0;

  private storeContext(context: SchedulerContext): IngestionStoreContext {
    return {
      ...context,
      jobStoreKind: resolveJobDataStore(this.config.get('JOB_DATA_STORE')),
      runStartedAt: new Date().toISOString(),
    };
  }

  private acceptsStoreContext(
    context: SchedulerContext & Partial<IngestionStoreContext>,
  ) {
    return (
      context.jobStoreKind ===
        resolveJobDataStore(this.config.get('JOB_DATA_STORE')) &&
      typeof context.runStartedAt === 'string' &&
      Number.isFinite(Date.parse(context.runStartedAt))
    );
  }

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
    this.schedulerRuns = new SupabaseSchedulerRunStore(this.supabase);
    this.sourceHealth = new SourceBoardHealthStore(this.supabase);
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
    return readIngestionQueueState(
      this.queue,
      this.slowQueue,
      resolveJobDataStore(this.config.get('JOB_DATA_STORE')),
    );
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

  private async queueJobsForRun(
    schedulerRunId: string,
    states: Bull.JobStatus[],
  ) {
    return queueJobsForRun(this.queue, this.slowQueue, schedulerRunId, states);
  }

  private async addSourceJobsInChunks(
    queue: Bull.Queue,
    jobs: ReturnType<typeof planSourceIngestionJobs>,
  ) {
    for (let offset = 0; offset < jobs.length; offset += 25) {
      await queue.addBulk(jobs.slice(offset, offset + 25));
    }
  }

  /** Explicit recovery only queues manifest sources which have never reserved
   * an audit. Started reservations are not leases that can safely be stolen;
   * Bull exhaustion and read-only status make abandonment visible instead. */
  async recoverIngestionRun(schedulerRunId: string) {
    this.assertQueueControlEnabled();
    const normalized = normalizeSchedulerRunId(schedulerRunId);
    if (!normalized) throw new Error('Invalid scheduler run ID');
    if (this.shuttingDown) throw new Error('instance_restarting');
    const [normalPaused, slowPaused, coordinator] = await Promise.all([
      this.queue.isPaused(),
      this.slowQueue.isPaused(),
      this.queue.getJob(normalized),
    ]);
    if (normalPaused || slowPaused) throw new Error('ingestion_queue_paused');
    const context = coordinator?.data as
      | (IngestionStoreContext & { sourceIds?: string[] })
      | undefined;
    if (!context || !Array.isArray(context.sourceIds))
      throw new Error('run_manifest_unavailable');
    if (!this.acceptsStoreContext(context))
      throw new Error('job_store_mismatch');
    if ((await coordinator!.getState()) !== 'completed')
      throw new Error('run_coordinator_not_completed');
    const audits = await fetchAllPages(async (from, to) => {
      const result = await this.supabase
        .from('ingestion_audit_log')
        .select('source_id,status')
        .eq('scheduler_run_id', normalized)
        .order('run_at', { ascending: false })
        .order('id')
        .range(from, to);
      return { data: result.data || [], error: result.error };
    });
    const queued = await this.queueJobsForRun(normalized, [
      'waiting',
      'active',
      'delayed',
      'paused',
      'failed',
      'completed',
    ]);
    const accounted = new Set([
      ...audits.map((row) => String(row.source_id)),
      ...queued.map(({ job }) =>
        String((job.data as { sourceId?: string }).sourceId),
      ),
    ]);
    const missing = [...new Set(context.sourceIds)].filter(
      (id) => !accounted.has(id),
    );
    const slow = await this.getSlowSourceIds(missing);
    const gap = calculatePacingGapMs(context.sourceIds.length);
    await this.addSourceJobsInChunks(
      this.queue,
      planSourceIngestionJobs(
        missing.filter((id) => !slow.has(id)),
        context,
        gap,
      ),
    );
    await this.addSourceJobsInChunks(
      this.slowQueue,
      planSourceIngestionJobs(
        missing.filter((id) => slow.has(id)),
        context,
        gap,
      ),
    );
    return { schedulerRunId: normalized, sourcesRequeued: missing.length };
  }

  /** Remove only queued Bull wrappers for an explicitly aborted run. Source
   * audits and persisted job data are retained; active work is never removed.
   * Both queues must already be globally paused so this cannot race a worker.
   */
  async cancelIngestionRun(schedulerRunId: string) {
    this.assertQueueControlEnabled();
    const normalized = normalizeSchedulerRunId(schedulerRunId);
    if (!normalized) throw new Error('Invalid scheduler run ID');
    const [normalPaused, slowPaused] = await Promise.all([
      this.queue.isPaused(),
      this.slowQueue.isPaused(),
    ]);
    if (!normalPaused || !slowPaused)
      throw new Error('ingestion_queue_not_paused');
    const active = await this.queueJobsForRun(normalized, ['active']);
    if (active.length) throw new Error('ingestion_run_active');
    const queued = await this.queueJobsForRun(normalized, [
      'waiting',
      'delayed',
      'paused',
    ]);
    await Promise.all(queued.map(({ job }) => job.remove()));
    return { schedulerRunId: normalized, jobsRemoved: queued.length };
  }

  async queueEnabledSources(context: SchedulerContext) {
    if (this.shuttingDown) throw new Error('Job-board worker is restarting');
    return queueSchedulerRun(context, this.schedulerRuns, () =>
      this.queue.add(
        'ingest-enabled-sources',
        this.storeContext(context),
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

    return queueSchedulerRun(context, this.schedulerRuns, async () => {
      const slow = (await this.getSlowSourceIds([sourceId])).has(sourceId);
      const planned = planSourceIngestionJobs(
        [sourceId],
        this.storeContext(context),
        MIN_INTER_REQUEST_GAP_MS,
      )[0];
      // Retain the completed ID so a repeated recovery request is suppressed.
      const options = { ...planned.opts, delay: 0, removeOnComplete: 3 };
      return (slow ? this.slowQueue : this.queue).add(
        planned.name,
        planned.data,
        options,
      );
    });
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

  async enqueueEnabledSourceJobs(
    context: SchedulerContext &
      Partial<IngestionStoreContext> & { sourceIds?: string[] },
    saveManifest?: (sourceIds: string[]) => Promise<void>,
  ) {
    if (!this.acceptsStoreContext(context)) {
      return {
        sourcesQueued: 0,
        slowSourcesQueued: 0,
        deferred: true,
        deferredReason: 'job_store_mismatch',
      };
    }
    if (context.schedulerRunId.startsWith('job-board-hour-')) {
      const priorRunActive = await this.hasActiveHourlySourceWork(context);
      if (priorRunActive) {
        this.logger.warn(
          `Deferring ${context.schedulerRunId}: a prior hourly source run is still active`,
        );
        return {
          sourcesQueued: 0,
          slowSourcesQueued: 0,
          deferred: true,
          deferredReason:
            'overlap guard: prior hourly source run is still active',
        };
      }
    }
    const { data, error } = await this.supabase
      .from('ats_sources')
      .select('id')
      .eq('enabled', true);
    if (error) throw new Error(error.message);
    const sourceIds =
      context.sourceIds ??
      (data || []).map((source) => String(source.id)).sort();
    // Persist the exact selection before either lane is enqueued. Retries reuse
    // this manifest, not a changed enabled-source set.
    if (saveManifest) await saveManifest(sourceIds);
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
    await this.addSourceJobsInChunks(this.queue, fastJobs);
    await this.addSourceJobsInChunks(this.slowQueue, slowJobs);
    return {
      sourcesQueued: sourceIds.length,
      slowSourcesQueued: slowJobs.length,
      deferred: false,
    };
  }

  private async getSlowSourceIds(sourceIds: string[]) {
    if (!sourceIds.length) return new Set<string>();
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
    return selectSlowSourceIds(sourceIds, rows);
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
    context: SchedulerContext & Partial<IngestionStoreContext>,
  ): Promise<IngestionResult> {
    if (this.shuttingDown) throw new Error('instance_restarting');
    if (!this.acceptsStoreContext(context))
      throw new Error('job_store_mismatch');
    return this.trackSourceWork(async () => {
      const result = await this.ingestSourceByIdInternal(sourceId, context);
      // A duplicate reservation is not success if a killed worker left its
      // audit started. Let Bull retry/fail visibly; never steal a live lease.
      if ('skipped' in result) {
        const { data, error } = await this.supabase
          .from('ingestion_audit_log')
          .select('status')
          .eq('source_id', sourceId)
          .eq('scheduler_run_id', context.schedulerRunId)
          .order('run_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw new Error('Source audit verification failed');
        if (
          !data ||
          !['succeeded', 'skipped_disabled', 'rate_limited'].includes(
            String(data.status),
          )
        ) {
          throw new Error('Source has no successful or policy-terminal audit');
        }
      }
      return result;
    });
  }

  /** Read-only, API-key-protected supervision. No queue resume or data writes. */
  async getIngestionRunStatus(schedulerRunId: string) {
    if (!normalizeSchedulerRunId(schedulerRunId))
      throw new Error('Invalid scheduler run ID');
    return readIngestionRunStatus(
      this.supabase,
      this.queue,
      this.slowQueue,
      schedulerRunId,
      resolveJobDataStore(this.config.get('JOB_DATA_STORE')),
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
    const sourceBoard = await this.sourceHealth.get(source.id);
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
      const fetched = await this.runStage(source.id, 'fetch', () =>
        fetchAuthorizedAtsJobs(source),
      );
      if (this.shuttingDown)
        throw new Error('instance restarting before persistence');
      const persistence = await this.persistSourceJobs(
        source,
        fetched.jobs,
        fetched.metadata.complete,
        (context as IngestionStoreContext).runStartedAt,
      );
      // A completed persistence operation must retain its successful audit,
      // including when SIGTERM arrived while persistence was in flight.
      await this.runStage(source.id, 'audit-complete', () =>
        this.complete(
          reservation.audit_log_id,
          fetched.jobs.length,
          persistence,
          fetched.metadata.requests_made,
        ),
      );
      try {
        if (!this.shuttingDown)
          await this.sourceHealth.recordSuccess(sourceBoard?.id);
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
      if (!this.shuttingDown)
        await this.sourceHealth.recordFailure(sourceBoard, message);
      this.logger.error(`Job-board source ${source.id} failed: ${message}`);
      throw error;
    } finally {
      this.inFlightAuditIds.delete(reservation.audit_log_id);
    }
  }

  /**
   * Run one ingestion stage and warn while it is still pending, so a hang is
   * attributable to a stage in the logs. Only the source ID, stage name and
   * elapsed time are logged. The work itself is not cancelled here; callers
   * rely on the fetch abort and the Oracle call timeout to bound it.
   */
  private async runStage<T>(
    sourceId: string,
    stage: string,
    work: () => Promise<T>,
  ): Promise<T> {
    const startedAt = Date.now();
    const watchdog = setInterval(() => {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      this.logger.warn(
        `Job-board source ${sourceId} still in stage ${stage} after ${seconds}s`,
      );
    }, STAGE_WATCHDOG_INTERVAL_MS);
    watchdog.unref?.();
    try {
      return await work();
    } catch (error) {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      this.logger.warn(
        `Job-board source ${sourceId} failed in stage ${stage} after ${seconds}s`,
      );
      throw error;
    } finally {
      clearInterval(watchdog);
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
      .select('id,status')
      .eq('source_id', sourceId)
      .eq('scheduler_run_id', context.schedulerRunId)
      .order('run_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data?.id) {
      // Fetch/authorization/circuit failures can occur before reservation.
      // A selected source still needs a truthful terminal outcome on exhaustion.
      const inserted = await this.supabase.from('ingestion_audit_log').insert({
        source_id: sourceId,
        scheduler_run_id: context.schedulerRunId,
        trigger_origin: context.triggerOrigin,
        status: 'failed',
        error_message: reason.slice(0, 500),
        completed_at: new Date().toISOString(),
      });
      if (inserted.error)
        throw new Error('Could not record terminal source failure');
      return true;
    }
    if (data.status !== 'started') return false;
    // A delayed heartbeat can report a stall while the original promise is
    // still writing. Do not turn that live reservation into a retryable one.
    if (this.inFlightAuditIds.has(String(data.id))) return false;
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
    try {
      // Do not make a still-writing source reclaimable by another worker.
      await Promise.allSettled([...this.activeSourceWork]);
      const auditIds = [...this.inFlightAuditIds];
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
      await this.jobStore.close?.();
    }
  }

  private async persistSourceJobs(
    source: AtsSource,
    scraped: ScrapedAtsJob[],
    responseComplete: boolean,
    runStartedAt?: string,
  ) {
    const ids = [...new Set(scraped.map((job) => job.external_job_id))];
    const persistedStoreJobs = await this.runStage(
      source.id,
      'store-read',
      () => this.jobStore.listSourceJobsForIngestion(source.id),
    );
    const persistedJobs: PersistedJobListing[] = persistedStoreJobs.map(
      (job) => ({
        id: job.id,
        external_job_id: job.externalJobId,
        listing_status: job.listingStatus,
        missing_since_at: job.missingSinceAt,
      }),
    );
    const existingByExternalId = new Map(
      persistedStoreJobs.map((job) => [job.externalJobId, job]),
    );
    const reconciliation = planListingReconciliation(persistedJobs, ids, {
      complete: responseComplete,
      runStartedAt,
    });
    const now = new Date().toISOString();
    const records = buildJobStoreRecords(
      source,
      scraped,
      existingByExternalId,
      now,
    );
    const fresh = records.filter(
      (job) => !existingByExternalId.has(job.externalJobId),
    );
    await this.runStage(source.id, 'store-upsert', () =>
      this.jobStore.upsertJobs(records),
    );
    if (responseComplete) {
      await this.runStage(source.id, 'store-reconcile', () =>
        this.jobStore.reconcileSource(source.id, ids, runStartedAt),
      );
    }
    const employerMatchIds = await this.runStage(
      source.id,
      'employer-match',
      () => this.employerMatches.syncSource(source, records),
    );
    const linkedRecords = records.map((record) => ({
      ...record,
      employerMatchId:
        employerMatchIds.get(record.companyName.trim()) ||
        record.employerMatchId,
    }));
    if (employerMatchIds.size) {
      await this.runStage(source.id, 'store-upsert-linked', () =>
        this.jobStore.upsertJobs(linkedRecords),
      );
    }
    await this.runStage(source.id, 'visa-signals', () =>
      this.visaSignals.syncSource(source.id, linkedRecords),
    );
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
    if (error) throw new Error(`Could not complete ingestion audit ${id}`);
  }

  async markSchedulerRunDeferred(schedulerRunId: string, reason: string) {
    await this.schedulerRuns.markDeferred(schedulerRunId, reason);
  }
}
