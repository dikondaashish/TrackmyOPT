import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import { secureLog, sanitizeError } from '@/lib/secure-logger';

/** Record real executions only. A dry run never writes or sends anything. */
export async function observeCaseWorker(
  worker: string,
  request: NextRequest,
  run: () => Promise<NextResponse>
) {
  const denied = verifyCronAuth(request);
  if (denied) return denied;
  if (request.nextUrl.searchParams.get('dry_run') === '1') return run();
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await db
    .from('case_worker_runs')
    .insert({ worker })
    .select('id')
    .single();
  if (error || !data) {
    secureLog.error(`[case-worker:${worker}] Worker audit unavailable`);
    return NextResponse.json(
      { ok: false, error: 'Worker audit unavailable' },
      { status: 503 }
    );
  }
  let response: NextResponse;
  try {
    response = await run();
  } catch (error) {
    secureLog.error(
      `[case-worker:${worker}] Worker failed`,
      sanitizeError(error)
    );
    response = NextResponse.json(
      { ok: false, error: 'Worker failed' },
      { status: 503 }
    );
  }
  const body = await response
    .clone()
    .json()
    .catch(() => ({}));
  const counts = Object.fromEntries(
    ['sent', 'failed', 'skipped', 'eligible', 'queued'].flatMap((key) =>
      typeof body[key] === 'number' ? [[key, body[key]]] : []
    )
  );
  if (typeof counts.failed === 'number' && counts.failed > 0) {
    secureLog.error(`[case-worker:${worker}] ${counts.failed} worker failures`);
  }
  const saved = await db
    .from('case_worker_runs')
    .update({
      outcome: response.ok && body.ok !== false ? 'succeeded' : 'failed',
      finished_at: new Date().toISOString(),
      http_status: response.status,
      counts,
    })
    .eq('id', data.id);
  if (saved.error) {
    secureLog.error(
      `[case-worker:${worker}] Worker result could not be recorded`
    );
    return NextResponse.json(
      {
        ok: false,
        error:
          'Worker result could not be recorded; do not blindly retry delivery',
      },
      { status: 503 }
    );
  }
  return response;
}
