import { NextRequest, NextResponse } from 'next/server';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import { sanitizeError, secureLog } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export function jobBoardHourlyRunId(now = new Date()) {
  return `job-board-hour-${now.toISOString().slice(0, 13)}`;
}

/** Queues only the enabled, previously authorized ATS sources. */
export async function GET(req: NextRequest) {
  const denied = verifyCronAuth(req);
  if (denied) return denied;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_SECRET_KEY;
  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      { ok: false, error: 'Server misconfiguration' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${apiUrl}/job-board/ingest-enabled-sources`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'x-scheduler-run-id': jobBoardHourlyRunId(),
        'x-trigger-origin': 'cron_jobs_org',
      },
      signal: AbortSignal.timeout(55_000),
    });

    if (!response.ok) {
      secureLog.error(`[job-board-cron] Backend returned ${response.status}`);
      return NextResponse.json(
        { ok: false, error: `Backend error ${response.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, result: await response.json() });
  } catch (error) {
    secureLog.error(
      '[job-board-cron] Queue request failed:',
      sanitizeError(error)
    );
    return NextResponse.json(
      { ok: false, error: 'Could not queue ingestion' },
      { status: 502 }
    );
  }
}
