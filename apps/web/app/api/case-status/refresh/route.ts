import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/get-user-id';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const maxDuration = 180;
const headers = { 'Cache-Control': 'no-store' };
const reply = (
  body: unknown,
  status = 200,
  extra: Record<string, string> = {}
) => NextResponse.json(body, { status, headers: { ...headers, ...extra } });

async function handlePOST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return reply({ ok: false, error: 'Unauthorized' }, 401);
  const body = await req.json().catch(() => null);
  if (
    !body ||
    (body.case_id != null && !z.string().uuid().safeParse(body.case_id).success)
  )
    return reply({ ok: false, error: 'Invalid case' }, 400);
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  let caseId = body.case_id;
  if (!caseId) {
    const { data, error } = await db
      .from('case_status')
      .select('id')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at')
      .limit(1)
      .maybeSingle();
    if (error) throw new Error('Manual case lookup failed');
    caseId = data?.id;
  }
  if (!caseId) return reply({ ok: false, error: 'No case status found' }, 404);
  const { data: action, error } = await db.rpc('prepare_case_refresh', {
    p_case_id: caseId,
    p_user_id: userId,
  });
  if (error || !action)
    throw new Error('Manual case refresh preparation failed');
  if (action.source === 'missing')
    return reply({ ok: false, error: 'No case status found' }, 404);
  if (action.source === 'cooldown')
    return reply(
      {
        ok: false,
        error: 'Please wait before refreshing again',
        retryAfter: action.retry_after,
      },
      429,
      { 'Retry-After': String(action.retry_after) }
    );
  if (action.source === 'database')
    return reply({ ok: true, source: 'database' });
  if (action.source !== 'uscis')
    throw new Error('Invalid manual case refresh action');
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/case-status/check`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': process.env.CRON_SECRET || '',
        'X-Force-Refresh': 'true',
      },
      body: JSON.stringify({
        receipt_number: action.receipt_number,
        user_id: userId,
      }),
      signal: AbortSignal.timeout(175_000),
    }
  );
  const result = await response.json();
  if (!response.ok || result.ok !== true || result.skipped) {
    if (response.ok && result.ok !== true)
      console.error('Manual case check returned an unsuccessful response');
    const status =
      response.status === 429 ? 429 : response.status >= 500 ? 502 : 400;
    return reply(
      {
        ok: false,
        error: result.error || 'Could not refresh this case',
        retryAfter: result.retryAfter,
      },
      status,
      response.headers.has('Retry-After')
        ? { 'Retry-After': response.headers.get('Retry-After')! }
        : {}
    );
  }
  return reply({ ok: true, source: 'uscis' });
}
export const POST = withSentryApiErrors(
  handlePOST,
  '/api/case-status/refresh',
  'POST'
);
