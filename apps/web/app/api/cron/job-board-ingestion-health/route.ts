import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  evaluateIngestionHealth,
  LOOKBACK_MS,
  type AuditRow,
  type IngestionHealth,
  type SchedulerRunRow,
} from '@/lib/job-board/ingestion-health';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** Each problem kind is its own Sentry issue so alerts stay distinguishable. */
function report(health: IngestionHealth) {
  const issues: [string, boolean, string][] = [
    [
      'missing-run',
      health.missingRuns.length > 0,
      `Scheduled job-board ingestion did not run: ${health.missingRuns.join(', ')}`,
    ],
    [
      'stalled-source',
      health.stalledSources > 0,
      `Job-board ingestion has ${health.stalledSources} stalled source(s)`,
    ],
    [
      'oracle-error',
      health.oracleErrorSources > 0,
      `Job-board ingestion Oracle errors on ${health.oracleErrorSources} source(s): ${health.errorCodes.join(', ')}`,
    ],
    [
      'failed-source',
      health.failedSources > 0,
      `Job-board ingestion failed for ${health.failedSources} source(s)`,
    ],
  ];
  for (const [kind, active, message] of issues) {
    if (!active) continue;
    Sentry.withScope((scope) => {
      scope.setFingerprint(['job-board-ingestion', kind]);
      scope.setTag('job_board_health', kind);
      Sentry.captureMessage(message, 'error');
    });
  }
}

/**
 * Read-only check of the scheduled ingestion. Only run IDs, counts and
 * Oracle error codes are reported: no job content, applicant data or raw
 * error text. Disabled until JOB_BOARD_INGESTION_HEALTH_ENABLED is "true",
 * so it cannot alert on missing runs before the schedule is switched on.
 */
async function handleGET(request: NextRequest) {
  const denied = verifyCronAuth(request);
  if (denied) return denied;
  if (process.env.JOB_BOARD_INGESTION_HEALTH_ENABLED !== 'true') {
    return NextResponse.json({ ok: true, skipped: 'disabled' });
  }

  const now = new Date();
  const since = new Date(now.getTime() - LOOKBACK_MS).toISOString();
  const supabase = getSupabaseAdminClient();
  const [runs, audits] = await Promise.all([
    supabase
      .from('scheduler_runs')
      .select('scheduler_run_id,dispatch_status')
      .like('scheduler_run_id', 'job-board-hour-%')
      .gte('created_at', since)
      .limit(500),
    supabase
      .from('ingestion_audit_log')
      .select('source_id,scheduler_run_id,status,error_message,run_at')
      .like('scheduler_run_id', 'job-board-hour-%')
      .gte('run_at', since)
      .limit(5000),
  ]);
  if (runs.error || audits.error) {
    return NextResponse.json(
      { ok: false, error: 'Ingestion audit unavailable' },
      { status: 503 }
    );
  }

  const health = evaluateIngestionHealth(
    now,
    (runs.data ?? []) as SchedulerRunRow[],
    (audits.data ?? []) as AuditRow[]
  );
  report(health);
  const ok =
    !health.missingRuns.length &&
    !health.failedSources &&
    !health.stalledSources;
  return NextResponse.json({ ok, ...health });
}

export const GET = withSentryApiErrors(
  handleGET,
  '/api/cron/job-board-ingestion-health',
  'GET'
);
