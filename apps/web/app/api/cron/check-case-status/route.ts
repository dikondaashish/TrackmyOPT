import { NextRequest, NextResponse } from 'next/server';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import { sanitizeError, secureLog } from '@/lib/secure-logger';
import { observeCaseWorker } from '@/lib/case-status/worker-observability';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Cron Job: Trigger USCIS Status Check Batch
 *
 * Runs daily at 14:00 UTC via Vercel Cron (local time varies with DST).
 * Schedule: vercel.json → "0 14 * * *"
 *
 * Vercel sends CRON_SECRET in the Authorization header automatically.
 */
export async function GET(req: NextRequest) {
  return observeCaseWorker('case-checks', req, () => run(req));
}
async function run(req: NextRequest) {
  try {
    const cronAuthError = verifyCronAuth(req);
    if (cronAuthError) return cronAuthError;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.API_SECRET_KEY;

    if (!apiUrl || !apiKey) {
      secureLog.error('[cron] Missing NEXT_PUBLIC_API_URL or API_SECRET_KEY');
      return NextResponse.json(
        { ok: false, error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    const dryRun = req.nextUrl.searchParams.get('dry_run') === '1';
    const response = await fetch(
      `${apiUrl}/uscis/check-all${dryRun ? '?dry_run=1' : ''}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        // Render free instances can take over 50 seconds to wake. Leave time
        // for the paginated queue build after startup, within the function budget.
        signal: AbortSignal.timeout(240000),
      }
    );

    if (!response.ok) {
      secureLog.error(`[cron] Backend returned ${response.status}`);
      return NextResponse.json(
        { ok: false, error: `Backend error ${response.status}` },
        { status: 502 }
      );
    }

    const result = await response.json();

    return NextResponse.json(
      {
        ok: true,
        dryRun,
        queued: dryRun ? 0 : result.count,
        eligible: result.count,
        message: dryRun ? 'No checks queued' : 'Batch job triggered',
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    secureLog.error('[cron] check-case-status error:', sanitizeError(error));
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
