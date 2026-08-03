import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getUserId } from '@/lib/auth/get-user-id';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { SavedScreeningAnswerWriteSchema } from '@/lib/ai/saved-screening-answer-schema';
import {
  ownedAnswerMatch,
  toSavedScreeningAnswer,
  toUserScopedUpsert,
} from '@/lib/ai/saved-screening-answer-store';

export const dynamic = 'force-dynamic';

const HASH_RE = /^[0-9a-f]{64}$/;

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

export async function GET(req: NextRequest) {
  const headers = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401, headers });

  const questionHash = req.nextUrl.searchParams.get('questionHash') || '';
  if (!HASH_RE.test(questionHash)) {
    return NextResponse.json({ ok: false, error: 'invalid_question_hash' }, { status: 400, headers });
  }

  const owner = ownedAnswerMatch(userId, questionHash);
  const { data, error } = await getSupabaseAdminClient()
    .from('screening_answers')
    .select('question_hash, normalized_question_text, edited_answer, source, created_at, updated_at')
    .eq('user_id', owner.user_id)
    .eq('question_hash', owner.question_hash)
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: 'storage_failed' }, { status: 500, headers });
  return NextResponse.json({ ok: true, answer: data ? toSavedScreeningAnswer(data) : null }, { headers });
}

export async function POST(req: NextRequest) {
  const headers = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401, headers });

  const parsed = SavedScreeningAnswerWriteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_answer' }, { status: 400, headers });
  }

  const row = toUserScopedUpsert(userId, parsed.data);
  const { data, error } = await getSupabaseAdminClient()
    .from('screening_answers')
    .upsert(row, { onConflict: 'user_id,question_hash' })
    .select('question_hash, normalized_question_text, edited_answer, source, created_at, updated_at')
    .single();
  if (error || !data) return NextResponse.json({ ok: false, error: 'storage_failed' }, { status: 500, headers });
  return NextResponse.json({ ok: true, answer: toSavedScreeningAnswer(data) }, { headers });
}

export async function DELETE(req: NextRequest) {
  const headers = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401, headers });

  const questionHash = req.nextUrl.searchParams.get('questionHash') || '';
  if (!HASH_RE.test(questionHash)) {
    return NextResponse.json({ ok: false, error: 'invalid_question_hash' }, { status: 400, headers });
  }
  const owner = ownedAnswerMatch(userId, questionHash);
  const { error } = await getSupabaseAdminClient()
    .from('screening_answers')
    .delete()
    .eq('user_id', owner.user_id)
    .eq('question_hash', owner.question_hash);
  if (error) return NextResponse.json({ ok: false, error: 'storage_failed' }, { status: 500, headers });
  return NextResponse.json({ ok: true, deleted: true }, { headers });
}

