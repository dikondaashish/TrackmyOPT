import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { getUserId } from '@/lib/auth/get-user-id';
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  const reply = (body: unknown, status = 200) =>
    NextResponse.json(body, {
      status,
      headers: { 'Cache-Control': 'no-store' },
    });
  if (!userId) return reply({ error: 'Unauthorized' }, 401);
  const id = req.nextUrl.searchParams.get('case_id');
  if (!z.string().uuid().safeParse(id).success)
    return reply({ error: 'Invalid case' }, 400);
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const owned = await db
    .from('case_status')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (owned.error || !owned.data)
    return reply({ error: 'Case unavailable' }, owned.error ? 503 : 404);
  const [next, attempt] = await Promise.all([
    db
      .from('case_check_jobs')
      .select('scheduled_for,state')
      .eq('case_id', id)
      .eq('user_id', userId)
      .in('state', ['queued', 'running'])
      .order('scheduled_for')
      .limit(1)
      .maybeSingle(),
    db
      .from('case_check_jobs')
      .select('attempted_at,state,error_code')
      .eq('case_id', id)
      .eq('user_id', userId)
      .not('attempted_at', 'is', null)
      .order('attempted_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (next.error || attempt.error)
    return reply({ error: 'Schedule unavailable' }, 503);
  return reply({ next: next.data, attempt: attempt.data });
}
