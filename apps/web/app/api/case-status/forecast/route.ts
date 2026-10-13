import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserId } from '@/lib/auth/get-user-id';
import { getActiveUserPlanTier } from '@/lib/premium/user-plan-tier';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { getCaseForecast } from '@/lib/opt-forecast/service';

export const dynamic = 'force-dynamic';
async function handleGET(req: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' };
  try {
    const userId = await getUserId(req);
    if (!userId)
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers }
      );
    const parsed = z
      .string()
      .uuid()
      .safeParse(req.nextUrl.searchParams.get('case_id'));
    if (!parsed.success)
      return NextResponse.json(
        { ok: false, error: 'Invalid case identifier' },
        { status: 400, headers }
      );
    const db = getSupabaseAdminClient();
    if ((await getActiveUserPlanTier(userId, db)) === 'free')
      return NextResponse.json(
        { ok: false, error: 'Case metrics require premium' },
        { status: 403, headers }
      );
    const forecast = await getCaseForecast(db, parsed.data, userId);
    if (!forecast)
      return NextResponse.json(
        { ok: false, error: 'Case not found' },
        { status: 404, headers }
      );
    return NextResponse.json({ ok: true, forecast }, { headers });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Unable to load approval forecast' },
      { status: 500, headers }
    );
  }
}
export const GET = withSentryApiErrors(
  handleGET,
  '/api/case-status/forecast',
  'GET'
);
