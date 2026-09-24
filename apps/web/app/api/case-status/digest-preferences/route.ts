import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/get-user-id';
import { getActiveUserPlanTier } from '@/lib/premium/user-plan-tier';
import { z } from 'zod';
export const dynamic = 'force-dynamic';
const db = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
const reply = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return reply({ error: 'Unauthorized' }, 401);
  const client = db();
  const [prefs, delivery] = await Promise.all([
    client
      .from('case_digest_preferences')
      .select('enabled')
      .eq('user_id', userId)
      .maybeSingle(),
    client
      .from('case_digest_deliveries')
      .select('week_start,state,started_at,finished_at')
      .eq('user_id', userId)
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (prefs.error || delivery.error)
    return reply({ error: 'Digest settings unavailable' }, 503);
  return reply({
    enabled: prefs.data?.enabled ?? false,
    delivery: delivery.data,
  });
}
export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return reply({ error: 'Unauthorized' }, 401);
  const parsed = z
    .object({ enabled: z.boolean() })
    .strict()
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return reply({ error: 'Invalid preference' }, 400);
  const client = db();
  if (
    parsed.data.enabled &&
    (await getActiveUserPlanTier(userId, client)) === 'free'
  )
    return reply({ error: 'Weekly digests require Pro.' }, 403);
  const result = await client
    .from('case_digest_preferences')
    .upsert(
      {
        user_id: userId,
        enabled: parsed.data.enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  return result.error
    ? reply({ error: 'Could not save preference' }, 503)
    : reply({ ok: true, enabled: parsed.data.enabled });
}
