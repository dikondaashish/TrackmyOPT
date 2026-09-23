import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { getUserId } from '@/lib/auth/get-user-id';
import { noticeSchema, NOTICE_COLUMNS } from '@/lib/case-status/notices';
import { getActiveUserPlanTier } from '@/lib/premium/user-plan-tier';

export const dynamic = 'force-dynamic';
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const admin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return json({ error: 'Unauthorized' }, 401);
  const caseId = req.nextUrl.searchParams.get('case_id');
  if (!z.string().uuid().safeParse(caseId).success)
    return json({ error: 'Invalid case' }, 400);
  const db = admin();
  const { data: owned, error: ownershipError } = await db
    .from('case_status')
    .select('id')
    .eq('id', caseId)
    .eq('user_id', userId)
    .maybeSingle();
  if (ownershipError) return json({ error: 'Could not load case' }, 503);
  if (!owned) return json({ error: 'Case not found' }, 404);
  const { data, error } = await db
    .from('case_notices')
    .select(NOTICE_COLUMNS)
    .eq('case_id', caseId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error)
    return json(
      {
        error:
          'Notice organizer is temporarily unavailable. Keep using your official notices and calendar.',
      },
      503
    );
  return json({ ok: true, notices: data });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return json({ error: 'Unauthorized' }, 401);
  return saveNotice(userId, await req.json().catch(() => null));
}

async function saveNotice(userId: string, body: unknown, noticeId?: string) {
  const parsed = noticeSchema.safeParse(body);
  if (!parsed.success)
    return json(
      { error: parsed.error.issues[0]?.message || 'Invalid notice' },
      400
    );
  const value = parsed.data;
  if (
    value.email_reminder &&
    value.due_date! < new Date().toISOString().slice(0, 10)
  )
    return json(
      { error: 'Choose a current or future deadline for an email reminder.' },
      400
    );
  if (value.email_reminder && (await getActiveUserPlanTier(userId)) === 'free')
    return json(
      {
        error:
          'Email reminders require Pro. You can save the notice and use calendar export without Pro.',
      },
      403
    );
  const db = admin();
  const { data: owned, error: ownershipError } = await db
    .from('case_status')
    .select('id')
    .eq('id', value.case_id)
    .eq('user_id', userId)
    .maybeSingle();
  if (ownershipError)
    return json({ error: 'Could not check case ownership' }, 503);
  if (!owned) return json({ error: 'Case not found' }, 404);
  if (value.document_id) {
    const { data: doc, error } = await db
      .from('documents')
      .select('id')
      .eq('id', value.document_id)
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !doc)
      return json({ error: 'Choose a document from your own vault.' }, 400);
  }
  const { deadline_confirmed, ...record } = value;
  const savedRecord = {
    ...record,
    user_id: userId,
    deadline_confirmed_at: deadline_confirmed ? new Date().toISOString() : null,
    reminder_state: value.email_reminder ? 'pending' : 'off',
  };
  if (noticeId) {
    const { data: old, error: readError } = await db
      .from('case_notices')
      .select('due_date,email_reminder,reminder_state,completed_at')
      .eq('id', noticeId)
      .eq('case_id', value.case_id)
      .eq('user_id', userId)
      .maybeSingle();
    if (readError) return json({ error: 'Could not load notice' }, 503);
    if (!old || old.completed_at || old.reminder_state === 'sending')
      return json(
        {
          error:
            'Notice is complete, unavailable or sending a reminder. Refresh before editing.',
        },
        409
      );
    if (
      value.email_reminder &&
      old.email_reminder &&
      old.due_date === value.due_date
    )
      savedRecord.reminder_state = old.reminder_state;
    const { data, error } = await db
      .from('case_notices')
      .update(savedRecord)
      .eq('id', noticeId)
      .eq('case_id', value.case_id)
      .eq('user_id', userId)
      .eq('reminder_state', old.reminder_state)
      .is('completed_at', null)
      .select(NOTICE_COLUMNS)
      .maybeSingle();
    if (error) return json({ error: 'Could not save changes' }, 503);
    if (!data)
      return json(
        { error: 'This notice changed while saving. Refresh and try again.' },
        409
      );
    return json({ ok: true, notice: data });
  }
  const { count, error: countError } = await db
    .from('case_notices')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', value.case_id)
    .eq('user_id', userId);
  if (countError)
    return json({ error: 'Notice organizer is unavailable' }, 503);
  if ((count ?? 0) >= 100)
    return json({ error: 'This case already has 100 notices.' }, 400);
  const { data, error } = await db
    .from('case_notices')
    .insert(savedRecord)
    .select(NOTICE_COLUMNS)
    .single();
  if (error)
    return json({ error: 'Could not save notice. Please try again.' }, 503);
  return json({ ok: true, notice: data }, 201);
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return json({ error: 'Unauthorized' }, 401);
  const body = await req.json().catch(() => null);
  if (body?.complete !== true && z.string().uuid().safeParse(body?.id).success)
    return saveNotice(userId, body, body.id);
  const parsed = z
    .object({
      id: z.string().uuid(),
      case_id: z.string().uuid(),
      complete: z.literal(true),
    })
    .safeParse(body);
  if (!parsed.success) return json({ error: 'Invalid request' }, 400);
  const db = admin();
  const { data: old, error: readError } = await db
    .from('case_notices')
    .select('reminder_state')
    .eq('id', parsed.data.id)
    .eq('case_id', parsed.data.case_id)
    .eq('user_id', userId)
    .maybeSingle();
  if (readError) return json({ error: 'Could not load notice' }, 503);
  if (!old || old.reminder_state === 'sending')
    return json(
      { error: 'Notice unavailable or a reminder is currently sending.' },
      409
    );
  const { data, error } = await db
    .from('case_notices')
    .update({
      completed_at: new Date().toISOString(),
      email_reminder: false,
      reminder_state: old.reminder_state === 'sent' ? 'sent' : 'cancelled',
    })
    .eq('id', parsed.data.id)
    .eq('case_id', parsed.data.case_id)
    .eq('user_id', userId)
    .eq('reminder_state', old.reminder_state)
    .neq('reminder_state', 'sending')
    .select(NOTICE_COLUMNS)
    .maybeSingle();
  if (error) return json({ error: 'Could not update notice' }, 503);
  if (!data)
    return json(
      {
        error:
          'Notice not found or a reminder is currently sending. Try again shortly.',
      },
      409
    );
  return json({ ok: true, notice: data });
}
