import { NextRequest, NextResponse } from 'next/server';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { refreshForecasts } from '@/lib/opt-forecast/service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;
async function handleGET(req: NextRequest) {
  const denied = verifyCronAuth(req);
  if (denied) return denied;
  try {
    return NextResponse.json(await refreshForecasts(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Daily forecast refresh failed' },
      { status: 500 }
    );
  }
}
export const GET = withSentryApiErrors(
  handleGET,
  '/api/cron/refresh-opt-forecasts',
  'GET'
);
