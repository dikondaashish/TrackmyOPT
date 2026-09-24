import { Process, Processor, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as Bull from 'bull';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UscisService } from './uscis.service';
import { isTerminalCase, checkFailureCode } from './check-schedule';

type StatusHistoryEntry = { status: string; date: string; description: string };

function normalizeStatusText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function buildStatusHistoryFromUscis(
  currentStatus: string,
  currentDescription: string,
  histCaseStatus: Array<{ date: string; completedText: string }>,
): StatusHistoryEntry[] {
  const sanitizedDescription = currentDescription.trim();

  if (!histCaseStatus.length) {
    if (!currentStatus.trim()) return [];
    return [
      {
        status: currentStatus,
        // Observation time is stored in last_checked_at, not an event date.
        date: '',
        description: sanitizedDescription || currentStatus,
      },
    ];
  }

  const mapped = histCaseStatus.map((item, index) => {
    const isLatest = index === 0;
    const matchesCurrent =
      item.completedText === currentStatus ||
      normalizeStatusText(item.completedText) ===
        normalizeStatusText(currentStatus);
    const useFullDescription =
      isLatest && matchesCurrent && Boolean(sanitizedDescription);

    return {
      status: item.completedText,
      date: item.date,
      description: useFullDescription
        ? sanitizedDescription
        : item.completedText,
    };
  });

  const latest = mapped[0];
  const latestMatchesCurrent =
    latest &&
    (latest.status === currentStatus ||
      normalizeStatusText(latest.status) ===
        normalizeStatusText(currentStatus));

  if (currentStatus.trim() && !latestMatchesCurrent) {
    return [
      {
        status: currentStatus,
        date: '',
        description: sanitizedDescription || currentStatus,
      },
      ...mapped,
    ];
  }

  if (sanitizedDescription && mapped.length > 0) {
    mapped[0] = {
      ...mapped[0],
      status: currentStatus || mapped[0].status,
      description: sanitizedDescription,
    };
  }

  return mapped;
}

/**
 * Final status keywords — cases in these states will never change again.
 * Skipping them avoids wasting USCIS API quota.
 */

/**
 * Circuit breaker for USCIS API outages.
 * After FAILURE_THRESHOLD consecutive API errors, we trip the circuit
 * and skip remaining jobs for COOLDOWN_MS to avoid burning retries.
 */
const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

@Processor('uscis')
export class UscisProcessor {
  private readonly logger = new Logger(UscisProcessor.name);
  private supabase: SupabaseClient;

  // Circuit breaker state
  private consecutiveFailures = 0;
  private circuitOpenUntil: number | null = null;

  constructor(
    private readonly uscisService: UscisService,
    private readonly configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
    ) as unknown as SupabaseClient;
  }

  /**
   * Dead letter handler — fires when a job exhausts all retries.
   * Logs the failure for debugging so it doesn't silently disappear.
   */
  @OnQueueFailed()
  async onFailed(
    job: Bull.Job<{ receiptNumber: string; userId: string }>,
    error: Error,
  ) {
    const { receiptNumber, userId } = job.data;
    const isFinalFailure = job.attemptsMade >= (job.opts?.attempts || 1);

    if (isFinalFailure) {
      await this.recordSchedule(job, 'failed', checkFailureCode(error.message));
      this.logger.error(
        `[DEAD LETTER] Job ${job.id} permanently failed for ${receiptNumber} ` +
          `(User: ${userId}) after ${job.attemptsMade} attempts: ${error.message}`,
      );

      // Optionally update the case_status to reflect the failure
      try {
        const { error: updateError } = await this.supabase
          .from('case_status')
          .update({
            last_check_failed_at: new Date().toISOString(),
            last_check_error_code: checkFailureCode(error.message),
            last_check_error_message:
              'Automatic check could not complete after retries. Try a manual refresh.',
            updated_at: new Date().toISOString(),
          })
          .eq('receipt_number', receiptNumber)
          .eq('user_id', userId);
        if (updateError) throw new Error(updateError.message);
      } catch (dbErr) {
        this.logger.error(
          `[DEAD LETTER] Failed to record check failure: ${dbErr}`,
        );
      }
    } else {
      this.logger.warn(
        `[Retry ${job.attemptsMade}/${job.opts?.attempts || 3}] ` +
          `Job ${job.id} failed for ${receiptNumber}: ${error.message}`,
      );
    }
  }

  @Process('check-status')
  async handleCheckStatus(
    job: Bull.Job<{ receiptNumber: string; userId: string }>,
  ) {
    const { receiptNumber, userId } = job.data;
    await this.recordSchedule(job, 'running');
    this.logger.log(
      `[Job ${job.id}] Checking status for ${receiptNumber} (User: ${userId})...`,
    );

    // ── Circuit Breaker: Skip if USCIS API is down ──
    if (this.circuitOpenUntil && Date.now() < this.circuitOpenUntil) {
      this.logger.warn(
        `[Job ${job.id}] Circuit OPEN — skipping ${receiptNumber} ` +
          `(resumes in ${Math.ceil((this.circuitOpenUntil - Date.now()) / 1000)}s)`,
      );
      throw new Error('USCIS_CIRCUIT_OPEN');
    }

    try {
      // ── Step 1: Smart Polling — Skip cases in final states ──
      const { data: existingCase, error: fetchError } = await this.supabase
        .from('case_status')
        .select(
          'current_status, last_checked_at, notifications_enabled, change_log',
        )
        .eq('receipt_number', receiptNumber)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        this.logger.error(
          `[Job ${job.id}] Failed to fetch existing case: ${fetchError.message}`,
        );
        throw new Error(fetchError.message);
      }

      if (existingCase?.current_status) {
        const isFinalState = isTerminalCase(
          String(existingCase.current_status),
        );

        if (isFinalState) {
          await this.recordSchedule(job, 'cancelled');
          this.logger.log(
            `[Job ${job.id}] Skipping ${receiptNumber} — final state: ${existingCase.current_status}`,
          );
          return { skipped: true, reason: 'Final State' };
        }
      }

      // Delayed daily jobs re-check entitlement before calling USCIS.
      if (String(job.id).startsWith('daily-')) {
        const profile = await this.supabase
          .from('profiles')
          .select('premium_status')
          .eq('user_id', userId)
          .single();
        if (profile.error)
          throw new Error('Could not verify monitoring entitlement');
        if (!profile.data?.premium_status) {
          await this.recordSchedule(job, 'cancelled');
          return { skipped: true, reason: 'Automatic monitoring disabled' };
        }
      }

      // ── Step 2: Call USCIS API ──
      const result = await this.uscisService.checkUSCISStatus(
        receiptNumber,
        userId,
      );

      // ✅ Reset circuit breaker on success
      this.consecutiveFailures = 0;
      this.circuitOpenUntil = null;

      // ── Step 3: Detect status change ──
      const isFirstCheck = existingCase && !existingCase.current_status;
      const hasStatusChanged =
        existingCase &&
        existingCase.current_status !== null &&
        existingCase.current_status !== String(result.status);

      // ── Step 4: Transform history to match DB schema ──
      const statusHistory = buildStatusHistoryFromUscis(
        String(result.status),
        String(result.description),
        result.histCaseStatus,
      );

      // ── Step 5: Build change_log entry (our own changelog) ──
      const existingChangelog = (
        Array.isArray(existingCase?.change_log) ? existingCase.change_log : []
      ) as Array<{
        date: string;
        old_status: string | null;
        new_status: string;
      }>;

      if (hasStatusChanged) {
        existingChangelog.push({
          date: new Date().toISOString(),
          old_status: existingCase.current_status
            ? String(existingCase.current_status)
            : null,
          new_status: result.status,
        });
      }

      // ── Step 6: Update database with correct column names ──
      const updateData: Record<string, unknown> = {
        current_status: result.status,
        case_type: result.caseType,
        received_date: result.receivedDate,
        last_checked_at: new Date().toISOString(),
        last_check_failed_at: null,
        last_check_error_code: null,
        last_check_error_message: null,
        consecutive_failures: 0,
        status_history: statusHistory,
        change_log: existingChangelog,
        updated_at: new Date().toISOString(),
      };

      // Only update last_status_change_at if status actually changed
      if (isFirstCheck || hasStatusChanged) {
        updateData.last_status_change_at = new Date().toISOString();
      }

      // Free-tier wedge: persist change moment when email alert is suppressed
      if (hasStatusChanged && !isFirstCheck) {
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('premium_status')
          .eq('user_id', userId)
          .single();

        const isPremium = profile?.premium_status === true;
        if (!isPremium) {
          updateData.status_last_changed_at = new Date().toISOString();
          updateData.last_change_alert_suppressed = true;
        }
      }

      const { error: updateError } = await this.supabase
        .from('case_status')
        .update(updateData)
        .eq('receipt_number', receiptNumber)
        .eq('user_id', userId);

      if (updateError) {
        this.logger.error(
          `[Job ${job.id}] Failed to update DB for ${receiptNumber}: ${updateError.message}`,
        );
        throw new Error(updateError.message);
      }

      this.logger.log(
        `[Job ${job.id}] Updated ${receiptNumber}: "${result.status}" (changed: ${hasStatusChanged})`,
      );

      // ── Step 7: Trigger email notification on status change (premium only) ──
      if (hasStatusChanged && existingCase?.notifications_enabled) {
        await this.triggerNotification(
          userId,
          receiptNumber,
          String(existingCase.current_status),
          String(result.status),
        );
      }

      await this.recordSchedule(job, 'succeeded');

      return {
        receiptNumber,
        status: result.status,
        changed: hasStatusChanged,
        isFirstCheck,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // ── Circuit Breaker: Track consecutive failures ──
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= FAILURE_THRESHOLD) {
        this.circuitOpenUntil = Date.now() + COOLDOWN_MS;
        this.logger.error(
          `[CIRCUIT BREAKER] Tripped after ${this.consecutiveFailures} consecutive failures. ` +
            `Pausing all USCIS checks for ${COOLDOWN_MS / 1000}s.`,
        );
      }

      this.logger.error(
        `[Job ${job.id}] Failed for ${receiptNumber}: ${errorMessage}`,
      );
      throw error;
    }
  }

  private async recordSchedule(
    job: Bull.Job<{ receiptNumber: string; userId: string }>,
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
          ? { attempted_at: stamp }
          : { completed_at: stamp }),
      })
      .eq('job_id', String(job.id))
      .eq('user_id', job.data.userId);
    if (error) throw new Error('Could not record scheduled check outcome');
  }

  /**
   * Trigger a status change notification via the Next.js notify endpoint.
   * Fire-and-forget — we don't block the worker on email delivery.
   */
  private async triggerNotification(
    userId: string,
    receiptNumber: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    const siteUrl =
      this.configService.get<string>('NEXT_PUBLIC_SITE_URL') ||
      'http://localhost:3001';
    const cronSecret = this.configService.get<string>('CRON_SECRET');

    if (!cronSecret) {
      this.logger.warn(
        `[Notification] CRON_SECRET not set — skipping notification for ${receiptNumber}`,
      );
      return;
    }

    try {
      const response = await fetch(`${siteUrl}/api/case-status/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': cronSecret,
        },
        body: JSON.stringify({
          user_id: userId,
          receipt_number: receiptNumber,
          old_status: oldStatus,
          new_status: newStatus,
        }),
      });

      if (response.ok) {
        this.logger.log(
          `[Notification] Sent for ${receiptNumber}: "${oldStatus}" → "${newStatus}"`,
        );
      } else {
        this.logger.warn(
          `[Notification] Failed for ${receiptNumber}: HTTP ${response.status}`,
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `[Notification] Error for ${receiptNumber}: ${errorMessage}`,
      );
      // Don't throw — notification failure shouldn't fail the job
    }
  }
}
