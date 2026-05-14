import { NextRequest, NextResponse } from 'next/server';
import { sanitizeError, secureLog } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Cron Job: Trigger USCIS Status Check Batch
 *
 * Runs daily at 9:00 AM ET (14:00 UTC) via Vercel Cron.
 * Schedule: vercel.json → "0 14 * * *"
 *
 * Vercel sends CRON_SECRET in the Authorization header automatically.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.API_SECRET_KEY;

    if (!apiUrl || !apiKey) {
      secureLog.error('[cron] Missing NEXT_PUBLIC_API_URL or API_SECRET_KEY');
      return NextResponse.json(
        { ok: false, error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiUrl}/uscis/check-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      signal: AbortSignal.timeout(59000),
    });

    if (!response.ok) {
      secureLog.error(`[cron] Backend returned ${response.status}`);
      return NextResponse.json(
        { ok: false, error: `Backend error ${response.status}` },
        { status: 502 }
      );
    }

    const result = await response.json();

    return NextResponse.json(
      { ok: true, message: 'Batch job triggered', result },
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
