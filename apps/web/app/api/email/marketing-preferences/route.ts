import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserId } from '@/lib/auth/get-user-id';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  checkRateLimitByUser,
  rateLimitResponse,
} from '@/lib/auth/api-rate-limit';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';

async function handleGET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await getSupabaseAdminClient()
    .from('email_preferences')
    .select('marketing_emails')
    .eq('user_id', userId)
    .maybeSingle();
  if (result.error)
    return NextResponse.json(
      { error: 'Product email preference unavailable' },
      { status: 503 }
    );
  return NextResponse.json(
    { enabled: result.data?.marketing_emails === true },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
async function handlePOST(req: NextRequest) {
  if (req.headers.get('origin') !== req.nextUrl.origin)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const userId = await getUserId(req);
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (Number(req.headers.get('content-length') ?? '0') > 2048)
    return NextResponse.json({ error: 'Invalid request' }, { status: 413 });
  const parsed = z
    .object({ enabled: z.boolean() })
    .strict()
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Choose a product email preference' },
      { status: 400 }
    );
  const allowance = await checkRateLimitByUser(userId, {
    name: 'marketing-preferences',
    limit: 10,
    windowSeconds: 60,
  });
  if (!allowance.success) return rateLimitResponse(allowance);
  const db = getSupabaseAdminClient();
  const update = () =>
    db
      .from('email_preferences')
      .update({ marketing_emails: parsed.data.enabled })
      .eq('user_id', userId)
      .select('user_id');
  const existing = await update();
  if (existing.error)
    return NextResponse.json(
      { error: 'Unable to save product email preference' },
      { status: 503 }
    );
  if (!existing.data?.length) {
    const account = await db.auth.admin.getUserById(userId);
    if (account.error && account.error.status !== 404)
      return NextResponse.json(
        { error: 'Account verification unavailable' },
        { status: 503 }
      );
    if (!account.data?.user?.email)
      return NextResponse.json(
        { error: 'Account unavailable' },
        { status: 409 }
      );
    const inserted = await db
      .from('email_preferences')
      .insert({
        user_id: userId,
        email_address: account.data.user.email,
        marketing_emails: parsed.data.enabled,
      });
    if (inserted.error) {
      if (inserted.error.code !== '23505')
        return NextResponse.json(
          { error: 'Unable to save product email preference' },
          { status: 503 }
        );
      const raced = await update();
      if (raced.error || !raced.data?.length)
        return NextResponse.json(
          { error: 'Unable to save product email preference' },
          { status: 503 }
        );
    }
  }
  return NextResponse.json({ enabled: parsed.data.enabled });
}
export const GET = withSentryApiErrors(
  handleGET,
  '/api/email/marketing-preferences',
  'GET'
);
export const POST = withSentryApiErrors(
  handlePOST,
  '/api/email/marketing-preferences',
  'POST'
);
