import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import type { ScreeningQuestionDraftRequest, ScreeningQuestionDraftResponse } from '@/lib/ai/screening-answer-contract';
import { AUTOFILL_FEATURE_FLAGS } from '../../../../../extension/src/autofill-feature-flags';
import {
  isSensitiveApplicationQuestion,
  normalizeApplicationQuestion,
} from '../../../../../extension/src/sensitive-question-policy';

const DAILY_LIMIT = 25;
const ITEM_LIMIT = 3;
const hash = (s: string) =>
  crypto
    .createHash('sha256')
    .update(normalizeApplicationQuestion(s))
    .digest('hex');

export async function POST(req: NextRequest) {
  let body: ScreeningQuestionDraftRequest;
  try { body = await req.json(); } catch { return NextResponse.json({ ok:false, error:'insufficient_context' }, { status:400 }); }
  const questionText =
    typeof body?.questionText === 'string'
      ? normalizeApplicationQuestion(body.questionText)
      : '';
  const qh = hash(questionText);
  const base = { ok:false, questionHash: qh, dailyLimit: DAILY_LIMIT, dailyRemaining: 0, itemRegenerationLimit: ITEM_LIMIT, itemRegenerationsRemaining: 0 } as ScreeningQuestionDraftResponse;
  if (!questionText || isSensitiveApplicationQuestion(questionText)) return NextResponse.json({ ...base, error:'sensitive' }, { status:400 });
  return NextResponse.json(
    {
      ...base,
      error: AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts
        ? 'not_implemented'
        : 'feature_disabled',
    },
    { status: 501 }
  );
}
