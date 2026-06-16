import { Process, Processor, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as Bull from 'bull';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UscisService } from './uscis.service';

type StatusHistoryEntry = { status: string; date: string; description: string };

function normalizeStatusText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function buildStatusHistoryFromUscis(
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
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        description: sanitizedDescription || currentStatus,
      },
    ];
  }

  const mapped = histCaseStatus.map((item, index) => {
    const isLatest = index === 0;
    const matchesCurrent =
      item.completedText === currentStatus ||
      normalizeStatusText(item.completedText) === normalizeStatusText(currentStatus);
    const useFullDescription =
      isLatest && matchesCurrent && Boolean(sanitizedDescription);

    return {
      status: item.completedText,
      date: item.date,
      description: useFullDescription ? sanitizedDescription : item.completedText,
    };
  });

  const latest = mapped[0];
  const latestMatchesCurrent =
    latest &&
    (latest.status === currentStatus ||
      normalizeStatusText(latest.status) === normalizeStatusText(currentStatus));

  if (currentStatus.trim() && !latestMatchesCurrent) {
    return [
      {
        status: currentStatus,
        date:
          latest?.date ||
          new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
        description: sanitizedDescription || currentStatus,
      },
      ...mapped,
    ];
  }

  if (sanitizedDescription && mapped.length > 0) {
    mapped[0] = {
      ...mapped[0]!,
      status: currentStatus || mapped[0]!.status,
      description: sanitizedDescription,
    };
  }

  return mapped;
}

/**
 * Final status keywords — cases in these states will never change again.
 * Skipping them avoids wasting USCIS API quota.
 */
const FINAL_STATUS_KEYWORDS = [
  'Card Was Delivered',
  'Case Was Denied',
  'Withdrawal Acknowledged',
  'Notice Explaining USCIS Actions Was Mailed',
  'Termination Notice Sent',
  'Refund Of An Unused Fee',
];

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
    const isFinalFailure = job.attemptsMade >= (job.opts?.attempts || 3);

    if (isFinalFailure) {
      this.logger.error(
        `[DEAD LETTER] Job ${job.id} permanently failed for ${receiptNumber} ` +
          `(User: ${userId}) after ${job.attemptsMade} attempts: ${error.message}`,
      );

      // Optionally update the case_status to reflect the failure
      try {
        await this.supabase
          .from('case_status')
          .update({
            last_checked_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('receipt_number', receiptNumber)
          .eq('user_id', userId);
      } catch (dbErr) {
        this.logger.error(
          `[DEAD LETTER] Failed to update last_checked_at: ${dbErr}`,
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
    this.logger.log(
      `[Job ${job.id}] Checking status for ${receiptNumber} (User: ${userId})...`,
    );

    // ── Circuit Breaker: Skip if USCIS API is down ──
    if (this.circuitOpenUntil && Date.now() < this.circuitOpenUntil) {
      this.logger.warn(
        `[Job ${job.id}] Circuit OPEN — skipping ${receiptNumber} ` +
          `(resumes in ${Math.ceil((this.circuitOpenUntil - Date.now()) / 1000)}s)`,
      );
      return {
        skipped: true,
        reason: 'Circuit breaker open — USCIS API outage',
      };
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
        const isFinalState = FINAL_STATUS_KEYWORDS.some((keyword) =>
          String(existingCase.current_status).includes(keyword),
        );

        if (isFinalState) {
          this.logger.log(
            `[Job ${job.id}] Skipping ${receiptNumber} — final state: ${existingCase.current_status}`,
          );
          return { skipped: true, reason: 'Final State' };
        }
      }

      // ── Step 2: Call USCIS API ──
      const result = await this.uscisService.checkUSCISStatus(receiptNumber);

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
