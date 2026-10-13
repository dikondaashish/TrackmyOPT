import { Process, Processor, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as Bull from 'bull';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UscisService } from './uscis.service';
import { checkFailureCode } from './check-schedule';

const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 2 * 60 * 1000;
type CaseJob = Bull.Job<{ receiptNumber: string; userId: string }>;

@Processor('uscis')
export class UscisProcessor {
  private readonly logger = new Logger(UscisProcessor.name);
  private supabase: SupabaseClient;
  private consecutiveFailures = 0;
  private circuitOpenUntil = 0;
  constructor(
    private readonly uscisService: UscisService,
    private readonly configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
    ) as unknown as SupabaseClient;
  }
  @Process('check-status')
  async handleCheckStatus(job: CaseJob) {
    if (String(job.id).startsWith('daily-')) {
      const { data, error } = await this.supabase
        .from('case_check_jobs')
        .select('state')
        .eq('job_id', String(job.id))
        .eq('user_id', job.data.userId)
        .maybeSingle();
      if (error) {
        await this.reportFailure();
        throw new Error('Could not read daily check outcome');
      }
      if (data?.state === 'succeeded')
        return { skipped: true, reason: 'Daily check already completed' };
    }
    await this.recordSchedule(job, 'running');
    if (Date.now() < this.circuitOpenUntil)
      throw new Error('USCIS_CIRCUIT_OPEN');
    try {
      // The authenticated web flow revalidates enrollment and ownership before
      // USCIS, persistence and sending. This includes every tier and final status.
      const result = await this.uscisService.checkUSCISStatus(
        job.data.receiptNumber,
        job.data.userId,
      );
      this.consecutiveFailures = 0;
      this.circuitOpenUntil = 0;
      await this.recordSchedule(
        job,
        result.skipped ? 'cancelled' : 'succeeded',
      );
      return result;
    } catch (error) {
      if (error instanceof Error && /UPSTREAM_(404|422)/.test(error.message))
        await job.discard();
      if (
        !(
          error instanceof Error &&
          /UPSTREAM_(400|404|422|429)/.test(error.message)
        )
      ) {
        this.consecutiveFailures++;
        if (this.consecutiveFailures >= FAILURE_THRESHOLD)
          this.circuitOpenUntil = Date.now() + COOLDOWN_MS;
      }
      this.logger.warn(
        `USCIS case sync failed (${checkFailureCode(error instanceof Error ? error.message : '')})`,
      );
      throw error;
    }
  }
  @OnQueueFailed()
  async onFailed(job: CaseJob, error: Error) {
    if (
      job.attemptsMade < (job.opts.attempts || 1) &&
      !/UPSTREAM_(404|422)/.test(error.message)
    )
      return;
    try {
      await this.recordSchedule(job, 'failed', checkFailureCode(error.message));
      const { error: updateError } = await this.supabase
        .from('case_status')
        .update({
          last_check_failed_at: new Date().toISOString(),
          last_check_error_code: checkFailureCode(error.message),
          last_check_error_message:
            'Automatic check could not complete. Try a manual refresh.',
        })
        .eq('receipt_number', job.data.receiptNumber)
        .eq('user_id', job.data.userId);
      if (updateError) throw new Error('USCIS failure bookkeeping failed');
    } catch {
      this.logger.error('USCIS failure bookkeeping failed');
      await this.reportFailure();
    }
    if (!/UPSTREAM_(400|404|422|429)/.test(error.message))
      await this.reportFailure();
  }
  private async recordSchedule(
    job: CaseJob,
    state: string,
    errorCode: string | null = null,
  ) {
    if (!String(job.id).startsWith('daily-')) return;
    const stamp = new Date().toISOString();
    const { error } = await this.supabase
      .from('case_check_jobs')
      .update({
        state,
        error_code: errorCode,
        ...(state === 'running'
          ? { attempted_at: stamp, completed_at: null }
          : { completed_at: stamp }),
      })
      .eq('job_id', String(job.id))
      .eq('user_id', job.data.userId);
    if (error) {
      await this.reportFailure();
      throw new Error('Could not record scheduled check outcome');
    }
  }
  private async reportFailure() {
    const key = this.configService.get<string>('API_SECRET_KEY');
    const site =
      this.configService.get<string>('NEXT_PUBLIC_SITE_URL') ||
      'https://www.trackmyopt.com';
    if (!key) {
      this.logger.error('USCIS worker monitoring authentication missing');
      return;
    }
    try {
      const response = await fetch(`${site}/api/internal/case-worker-failure`, {
        method: 'POST',
        headers: { 'x-api-key': key },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok && response.status !== 429)
        this.logger.error('USCIS worker error reporting unavailable');
    } catch {
      this.logger.error('USCIS worker error reporting unavailable');
    }
  }
}
