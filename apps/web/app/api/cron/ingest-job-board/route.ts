import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse, after } from 'next/server';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import { sanitizeError, secureLog } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RENDER_WAKE_TIMEOUT_MS = 5_000;
const ENQUEUE_TIMEOUT_MS = 30_000;

export function jobBoardHourlyRunId(now = new Date()) {
  return `job-board-hour-${now.toISOString().slice(0, 13)}`;
}

function schedulerLedger() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase service credentials are not configured');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function recordDispatch(schedulerRunId: string) {
  const { error } = await schedulerLedger().from('scheduler_runs').insert({
    scheduler_run_id: schedulerRunId,
    trigger_origin: 'cron_jobs_org',
    bull_job_id: schedulerRunId,
    dispatch_status: 'dispatched',
    dispatched_at: new Date().toISOString(),
  });
  if (error && error.code !== '23505') throw new Error(error.message);
}

async function recordFailedDispatch(schedulerRunId: string, errorMessage: string) {
  const supabase = schedulerLedger();
  const { error: updateError } = await supabase
    .from('scheduler_runs')
    .update({
      dispatch_status: 'failed',
      error_message: errorMessage.slice(0, 500),
    })
    .eq('scheduler_run_id', schedulerRunId)
    .eq('dispatch_status', 'dispatched');
  if (updateError) throw new Error(updateError.message);

  // If the dispatch insert itself failed, preserve a visible failure row.
  const { error: insertError } = await supabase.from('scheduler_runs').insert({
    scheduler_run_id: schedulerRunId,
    trigger_origin: 'cron_jobs_org',
    bull_job_id: schedulerRunId,
    dispatch_status: 'failed',
    error_message: errorMessage.slice(0, 500),
  });
  if (insertError && insertError.code !== '23505') {
    throw new Error(insertError.message);
  }
}

async function dispatchInBackground(
  apiUrl: string,
  apiKey: string,
  schedulerRunId: string,
) {
  try {
    await recordDispatch(schedulerRunId);

    // Render's configured health path is `/`; this wakes a sleeping free-tier
    // instance without coupling the response to cold-start latency.
    try {
      await fetch(apiUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(RENDER_WAKE_TIMEOUT_MS),
      });
    } catch (error) {
      secureLog.warn('[job-board-cron] Render wake ping failed:', sanitizeError(error));
    }

    const response = await fetch(`${apiUrl}/job-board/ingest-enabled-sources`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'x-scheduler-run-id': schedulerRunId,
        'x-trigger-origin': 'cron_jobs_org',
      },
      signal: AbortSignal.timeout(ENQUEUE_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not queue ingestion';
    secureLog.error('[job-board-cron] Queue request failed:', sanitizeError(error));
    try {
      await recordFailedDispatch(schedulerRunId, message);
    } catch (ledgerError) {
      secureLog.error(
        '[job-board-cron] Failed to persist dispatch outcome:',
        sanitizeError(ledgerError),
      );
    }
  }
}

/** Queues only the enabled, previously authorized ATS sources. */
export async function GET(req: NextRequest) {
  const denied = verifyCronAuth(req);
  if (denied) return denied;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiUrl || !apiKey || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: 'Server misconfiguration' },
      { status: 500 }
    );
  }

  const schedulerRunId = jobBoardHourlyRunId();
  after(() => dispatchInBackground(apiUrl, apiKey, schedulerRunId));

  return NextResponse.json(
    { ok: true, result: { status: 'dispatched', jobId: schedulerRunId } },
    { status: 202 },
  );
}
