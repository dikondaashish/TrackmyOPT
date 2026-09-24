import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import * as Bull from 'bull';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fetchCaseStatus, type USCISStatus } from './uscis-client';
import { filterCasesForPremiumAutoCheck } from './premium-auto-check';
import { nextDailyCheck, isTerminalCase } from './check-schedule';

export type { USCISHistoryItem, USCISStatus } from './uscis-client';

@Injectable()
export class UscisService {
  private readonly logger = new Logger(UscisService.name);
  private cachedToken: { token: string; expiresAt: number } | null = null;
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
   * Queue daily auto-checks for Pro/Dedicated (premium_status) cases only.
   * Free users refresh manually via case-status/check.
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
    const premiumIds: string[] = [];
    const pageSize = 1000;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await this.supabase
        .from('case_status')
        .select('id, receipt_number, user_id, current_status')
        .order('id')
        .range(offset, offset + pageSize - 1);
      if (error) throw new Error(`Failed to fetch cases: ${error.message}`);
      const rows = (data ?? []) as {
        id: string;
        receipt_number: string;
        user_id: string;
        current_status?: string;
      }[];
      cases.push(...rows);
      if (rows.length < pageSize) break;
    }
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('user_id')
        .eq('premium_status', true)
        .order('user_id')
        .range(offset, offset + pageSize - 1);
      if (error)
        throw new Error(`Failed to fetch premium profiles: ${error.message}`);
      const rows = (data ?? []) as { user_id: string }[];
      premiumIds.push(...rows.map((p) => p.user_id));
      if (rows.length < pageSize) break;
    }
    if (!cases || cases.length === 0) {
      this.logger.log('No cases found to check');
      return { count: 0, skippedFree: 0 };
    }

    const { premiumCases, skippedFree } = filterCasesForPremiumAutoCheck(
      cases.filter((c) => !isTerminalCase(c.current_status)),
      premiumIds,
    );

    if (dryRun)
      return { count: premiumCases.length, skippedFree, dryRun: true };

    if (premiumCases.length === 0) {
      this.logger.log(
        `No premium cases to auto-check (skipped ${skippedFree} free)`,
      );
      return { count: 0, skippedFree };
    }

    this.logger.log(
      `Queueing ${premiumCases.length} premium cases for auto-check (skipped ${skippedFree} free)`,
    );

    // Stagger jobs with 150ms delay between each to stay within USCIS 10 TPS limit
    const now = new Date();
    const todaySlot = new Date(now);
    todaySlot.setUTCHours(14, 0, 0, 0);
    const next = nextDailyCheck(
      new Date(Math.max(now.getTime(), todaySlot.getTime())),
    );
    const scheduledCases = premiumCases.flatMap((c, index) => [
      {
        c,
        scheduled: new Date(now.getTime() + index * 150),
        day: now.toISOString().slice(0, 10),
      },
      {
        c,
        scheduled: new Date(next.getTime() + index * 150),
        day: next.toISOString().slice(0, 10),
      },
    ]);
    // Deterministic IDs prevent overlapping cron requests from adding duplicates.
    const jobs = scheduledCases.map(({ c, scheduled, day }) => ({
      name: 'check-status',
      data: { receiptNumber: c.receipt_number, userId: c.user_id },
      opts: {
        jobId: `daily-${c.id}-${day}`,
        removeOnComplete: { age: 3 * 86400, count: 20000 },
        removeOnFail: false, // Keep failed jobs for dead letter inspection
        attempts: 3,
        backoff: { type: 'exponential' as const, delay: 5000 },
        delay: Math.max(0, scheduled.getTime() - Date.now()),
      },
    }));

    const { error: scheduleError } = await this.supabase
      .from('case_check_jobs')
      .upsert(
        scheduledCases.map(({ c, scheduled, day }) => ({
          job_id: `daily-${c.id}-${day}`,
          case_id: c.id,
          user_id: c.user_id,
          scheduled_for: scheduled.toISOString(),
          state: 'scheduling',
        })),
        { onConflict: 'job_id', ignoreDuplicates: true },
      );
    if (scheduleError) throw new Error('Could not persist check schedule');
    await this.uscisQueue.addBulk(jobs);
    for (let offset = 0; offset < jobs.length; offset += 100) {
      const { error: queuedError } = await this.supabase
        .from('case_check_jobs')
        .update({ state: 'queued' })
        .in(
          'job_id',
          jobs.slice(offset, offset + 100).map((j) => j.opts.jobId),
        )
        .eq('state', 'scheduling');
      if (queuedError) throw new Error('Could not confirm check schedule');
    }

    return { count: premiumCases.length, skippedFree };
  }

  /**
   * Queue a single check status job
   */
  async queueCheckStatus(receiptNumber: string, userId: string) {
    this.logger.log(`Queueing check for ${receiptNumber} (User: ${userId})`);
    return this.uscisQueue.add('check-status', {
      receiptNumber,
      userId,
    });
  }

  /**
   * Check Status (Called by Worker) — enrollment guard enforced in fetchCaseStatus.
   */
  async checkUSCISStatus(
    receiptNumber: string,
    userId: string,
  ): Promise<USCISStatus> {
    const clientId = this.configService.get<string>('USCIS_CLIENT_ID') || '';
    const clientSecret =
      this.configService.get<string>('USCIS_CLIENT_SECRET') || '';
    const baseUrl =
      this.configService.get<string>('USCIS_API_BASE_URL') ||
      'https://api.uscis.gov/case-status';
    const tokenUrl =
      this.configService.get<string>('USCIS_TOKEN_URL') ||
      'https://api.uscis.gov/oauth/accesstoken';

    return fetchCaseStatus({
      receiptNumber,
      userId,
      callSite: 'api/uscis.processor',
      supabase: this.supabase,
      clientId,
      clientSecret,
      baseUrl,
      tokenUrl,
      cachedToken: this.cachedToken,
      setCachedToken: (token) => {
        this.cachedToken = token;
      },
      logger: this.logger,
    });
  }
}
