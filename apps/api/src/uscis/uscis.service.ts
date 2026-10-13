import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import * as Bull from 'bull';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { nextDailyCheck } from './check-schedule';

export type CaseSyncOutcome = {
  status?: string;
  changed?: boolean;
  isFirstCheck?: boolean;
  skipped?: boolean;
};

@Injectable()
export class UscisService {
  private readonly logger = new Logger(UscisService.name);
  private supabase: SupabaseClient;

  constructor(
    private configService: ConfigService,
    @InjectQueue('uscis') private uscisQueue: Bull.Queue,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
    ) as SupabaseClient;
  }

  /**
   * Queue every currently enrolled case, regardless of tier or last status.
   */
  async queueAllActiveCases(dryRun = false) {
    // PostgREST caps each response. Stable ordering and explicit ranges keep
    // users after the first page eligible. Queue nothing on a partial read.
    const cases: {
      id: string;
      receipt_number: string;
      user_id: string;
      current_status?: string;
    }[] = [];
    const pageSize = 1000;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await this.supabase
        .from('case_status')
        .select('id, receipt_number, user_id, current_status')
        .order('id')
        .range(offset, offset + pageSize - 1);
      if (error) throw new Error('Failed to fetch cases');
      const rows = (data ?? []) as {
        id: string;
        receipt_number: string;
        user_id: string;
        current_status?: string;
      }[];
      cases.push(...rows);
      if (rows.length < pageSize) break;
    }
    // Daily cron also disposes of legacy Redis payloads for removed cases.
    if (!dryRun) await this.purgeUnenrolledJobs(cases);
    if (!cases || cases.length === 0) {
      this.logger.log('No cases found to check');
      return { count: 0, skippedFree: 0, queued: 0 };
    }

    if (dryRun)
      return { count: cases.length, skippedFree: 0, dryRun: true, queued: 0 };
    this.logger.log(`Queueing ${cases.length} enrolled cases for daily sync`);
    // Staggering spreads queue work; the shared provider gate enforces the limit.
    const now = new Date();
    const todaySlot = new Date(now);
    todaySlot.setUTCHours(14, 0, 0, 0);
    const next = nextDailyCheck(
      new Date(Math.max(now.getTime(), todaySlot.getTime())),
    );
    const scheduledCases = cases.flatMap((c, index) => [
      {
        c,
        scheduled: new Date(now.getTime() + index * 1000),
        day: now.toISOString().slice(0, 10),
      },
      {
        c,
        scheduled: new Date(next.getTime() + index * 1000),
        day: next.toISOString().slice(0, 10),
      },
    ]);
    // Deterministic IDs prevent overlapping cron requests from adding duplicates.
    const jobs = scheduledCases.map(({ c, scheduled, day }) => ({
      name: 'check-status',
      data: { receiptNumber: c.receipt_number, userId: c.user_id },
      opts: {
        jobId: `daily-${c.id}-${day}`,
        removeOnComplete: true,
        removeOnFail: true, // Durable content-free failures go to monitoring, not Redis payloads
        attempts: 3,
        backoff: { type: 'fixed' as const, delay: 5 * 60 * 1000 },
        delay: Math.max(0, scheduled.getTime() - Date.now()),
      },
    }));

    // Durable outcomes outlive Redis payload removal. Re-running cron must not
    // recheck a completed case on the same day; unfinished dispatches recover.
    const completed = new Set<string>();
    for (let offset = 0; offset < jobs.length; offset += 100) {
      const { data, error } = await this.supabase
        .from('case_check_jobs')
        .select('job_id,state')
        .in(
          'job_id',
          jobs.slice(offset, offset + 100).map((j) => j.opts.jobId),
        );
      if (error) throw new Error('Could not read check schedule');
      for (const row of (data ?? []) as { job_id: string; state: string }[])
        if (row.state === 'succeeded') completed.add(row.job_id);
    }
    const pendingJobs = jobs.filter((j) => !completed.has(j.opts.jobId));
    if (!pendingJobs.length)
      return { count: cases.length, skippedFree: 0, queued: 0 };
    const { error: scheduleError } = await this.supabase
      .from('case_check_jobs')
      .upsert(
        scheduledCases
          .filter(({ c, day }) => !completed.has(`daily-${c.id}-${day}`))
          .map(({ c, scheduled, day }) => ({
            job_id: `daily-${c.id}-${day}`,
            case_id: c.id,
            user_id: c.user_id,
            scheduled_for: scheduled.toISOString(),
            state: 'scheduling',
          })),
        { onConflict: 'job_id', ignoreDuplicates: true },
      );
    if (scheduleError) throw new Error('Could not persist check schedule');
    if (pendingJobs.length) await this.uscisQueue.addBulk(pendingJobs);
    for (let offset = 0; offset < pendingJobs.length; offset += 100) {
      const { error } = await this.supabase
        .from('case_check_jobs')
        .update({ state: 'queued' })
        .in(
          'job_id',
          pendingJobs.slice(offset, offset + 100).map((j) => j.opts.jobId),
        )
        .in('state', ['scheduling', 'failed', 'cancelled']);
      if (error) throw new Error('Could not confirm check schedule');
    }
    return { count: cases.length, skippedFree: 0, queued: pendingJobs.length };
  }

  /** Bounded sweep of inactive legacy jobs; active jobs finish under the live
   * enrollment guard and are swept on the next cron if legacy options kept them.
   * Collect before removing so offset pagination does not skip shifted entries.
   */
  async purgeUnenrolledJobs(
    cases: { user_id: string; receipt_number: string }[],
  ) {
    const enrolled = new Set(
      cases.map((c) => c.user_id + ':' + c.receipt_number.trim().toUpperCase()),
    );
    const jobs: Bull.Job[] = [];
    for (let offset = 0; ; offset += 1000) {
      const page = await this.uscisQueue.getJobs(
        ['waiting', 'delayed', 'paused', 'completed', 'failed'],
        offset,
        offset + 999,
      );
      jobs.push(...page);
      if (page.length < 1000) break;
      if (jobs.length >= 100000)
        throw new Error('Case queue cleanup exceeded its bounded batch');
    }
    let removed = 0;
    for (const job of jobs) {
      if (job.name !== 'check-status') continue;
      // Rebuild inactive daily jobs created before the shared-client release.
      // Bull retains old options when addBulk sees the same deterministic ID.
      // Durable succeeded outcomes prevent rechecking completed days.
      const backoff = job.opts?.backoff;
      const legacyDaily =
        String(job.id).startsWith('daily-') &&
        (job.opts.removeOnComplete !== true ||
          job.opts.removeOnFail !== true ||
          typeof backoff !== 'object' ||
          !backoff ||
          backoff.delay !== 300000 ||
          backoff.type !== 'fixed');
      const data = (job.data ?? {}) as {
        userId?: unknown;
        receiptNumber?: unknown;
      };
      if (
        legacyDaily ||
        !enrolled.has(
          (typeof data.userId === 'string' ? data.userId : '') +
            ':' +
            (typeof data.receiptNumber === 'string'
              ? data.receiptNumber.trim().toUpperCase()
              : ''),
        )
      ) {
        await job.remove();
        removed++;
      }
    }
    return removed;
  }

  /**
   * Queue a single check status job
   */
  async queueCheckStatus(receiptNumber: string, userId: string) {
    this.logger.log('Queueing an enrolled USCIS case check');
    return this.uscisQueue.add(
      'check-status',
      { receiptNumber, userId },
      { removeOnComplete: true, removeOnFail: true },
    );
  }

  /**
   * Check Status (Called by Worker) — enrollment guard enforced in fetchCaseStatus.
   */
  async checkUSCISStatus(
    receiptNumber: string,
    userId: string,
  ): Promise<CaseSyncOutcome> {
    // One HTTP client/credential source for manual and scheduled checks. The
    // web endpoint verifies current enrollment before reading USCIS credentials.
    const siteUrl =
      this.configService.get<string>('NEXT_PUBLIC_SITE_URL') ||
      'https://www.trackmyopt.com';
    const key = this.configService.get<string>('API_SECRET_KEY');
    if (!key) throw new Error('USCIS worker authentication missing');
    const response = await fetch(`${siteUrl}/api/internal/uscis-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify({ receiptNumber, userId }),
      signal: AbortSignal.timeout(175_000),
    });
    if (response.status === 403) return { skipped: true };
    if (!response.ok) {
      const failure = (await response.json().catch(() => null)) as {
        errorCode?: number;
      } | null;
      const code = failure?.errorCode;
      throw new Error(
        `USCIS_UPSTREAM_${code && [401, 403, 404, 422, 429, 500, 503].includes(code) ? code : response.status}`,
      );
    }
    const result = (await response.json()) as {
      ok?: boolean;
      skipped?: boolean;
      data?: CaseSyncOutcome;
    };
    if (result.ok && result.skipped) return { skipped: true };
    if (!result.ok || !result.data?.status)
      throw new Error('USCIS_INVALID_RESPONSE');
    return result.data;
  }
}
