import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextResponse } from 'next/server';
import { getI765ObservedTrends } from '@/lib/case-status/i765-observed-trends-server';

export const dynamic = 'force-dynamic';

async function handleGET() {
  const trends = await getI765ObservedTrends();
  if (!trends) {
    return NextResponse.json(
      { ok: false, error: 'Broader I-765 data is temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  return NextResponse.json(
    { ok: true, trends },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    }
  );
}

export const GET = withSentryApiErrors(handleGET, '/api/case-status/i765-observed-trends', 'GET');
