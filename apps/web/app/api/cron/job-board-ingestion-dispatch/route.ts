import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import {
  parseScheduleStart,
  scheduledSlot,
} from '@/lib/job-board/ingestion-health';
import {
  DEFAULT_JOB_BOARD_WORKER_URL,
  dispatchScheduledIngestion,
  DispatchError,
} from '@/lib/job-board/dispatch-scheduled-ingestion';

export const dynamic = 'force-dynamic';
// Waking a cold Render service can take about a minute; see the timeouts in
// dispatchScheduledIngestion. The run itself is not supervised here.
export const maxDuration = 300;

/** One fixed, body-free Sentry issue for every failed scheduled dispatch. */
function reportDispatchFailure(reason: string, status?: number) {
  Sentry.withScope((scope) => {
    scope.setFingerprint(['job-board-ingestion', 'dispatch-failed']);
    scope.setTag('job_board_health', 'dispatch-failed');
    scope.setTag('job_board_dispatch_reason', reason);
    if (status) scope.setTag('job_board_dispatch_status', String(status));
    Sentry.captureMessage('Scheduled job-board ingestion dispatch failed', 'error');
  });
}

/**
 * Scheduler for the daily job-board ingestion (Mon–Fri 14:00 and 21:00,
 * Sat–Sun 21:00 America/New_York). vercel.json fires it in every UTC hour
 * that can be a slot in EST or EDT; firings outside a New York slot window
 * are no-ops, and repeat firings inside one slot share a `job-board-hour-*`
 * run ID that the API's scheduler ledger suppresses.
 *
 * Inert until the Vercel env JOB_BOARD_SCHEDULE_ENABLED is "true". Slots
 * before JOB_BOARD_SCHEDULE_START (when set) are skipped.
 */
async function handleGET(request: NextRequest) {
  const denied = verifyCronAuth(request);
  if (denied) return denied;
  if (process.env.JOB_BOARD_SCHEDULE_ENABLED !== 'true') {
    return NextResponse.json({ ok: true, skipped: 'disabled' });
  }

  const slot = scheduledSlot(new Date());
  if (!slot) return NextResponse.json({ ok: true, skipped: 'outside-slot' });

  const scheduleStart = parseScheduleStart(process.env.JOB_BOARD_SCHEDULE_START);
  if (scheduleStart && slot.slotStart < scheduleStart) {
    return NextResponse.json({
      ok: true,
      skipped: 'before-schedule-start',
      schedulerRunId: slot.runId,
    });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_SECRET_KEY;
  if (!apiUrl || !apiKey) {
    reportDispatchFailure('misconfigured');
    return NextResponse.json({
      ok: false,
      error: 'dispatch_failed',
      reason: 'misconfigured',
      schedulerRunId: slot.runId,
    });
  }

  try {
    const result = await dispatchScheduledIngestion({
      apiUrl,
      apiKey,
      schedulerRunId: slot.runId,
      wakeUrls: [process.env.JOB_BOARD_WORKER_URL || DEFAULT_JOB_BOARD_WORKER_URL],
    });
    // "suppressed": this slot was already dispatched (earlier firing or a
    // manual recovery). That is the ledger working, not a failure.
    return NextResponse.json({
      ok: true,
      status: result.status,
      schedulerRunId: slot.runId,
    });
  } catch (error) {
    const reason = error instanceof DispatchError ? error.reason : 'unexpected';
    const status = error instanceof DispatchError ? error.status : undefined;
    reportDispatchFailure(reason, status);
    // HTTP 200 so withSentryApiErrors does not raise a second, unfingerprinted
    // issue for the same failure; the body still says it failed.
    return NextResponse.json({
      ok: false,
      error: 'dispatch_failed',
      reason,
      schedulerRunId: slot.runId,
    });
  }
}

export const GET = withSentryApiErrors(
  handleGET,
  '/api/cron/job-board-ingestion-dispatch',
  'GET'
);
