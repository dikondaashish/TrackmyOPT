import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import type { ScreeningQuestionDraftRequest, ScreeningQuestionDraftResponse } from '@/lib/ai/screening-answer-contract';
import { ResumeAutofillSnapshotV1Schema } from '@/lib/resume/autofill-schema';
import { getUserId } from '@/lib/auth/getUserId';
import { consumeAiGeneration } from '@/lib/ai-generation-limits';
import { isSensitiveApplicationQuestion } from '../../../../../extension/src/sensitive-question-policy';

const DAILY_LIMIT = 25;
const ITEM_LIMIT = 3;
const normalized = (s: string) => s.normalize('NFKC').trim().replace(/\s+/g, ' ');
const hash = (s: string) => crypto.createHash('sha256').update(normalized(s)).digest('hex');

export async function POST(req: NextRequest) {
  let body: ScreeningQuestionDraftRequest;
  try { body = await req.json(); } catch { return NextResponse.json({ ok:false, error:'insufficient_context' }, { status:400 }); }
  const questionText = typeof body?.questionText === 'string' ? normalized(body.questionText) : '';
  const qh = hash(questionText);
  const base = { ok:false, questionHash: qh, dailyLimit: DAILY_LIMIT, dailyRemaining: 0, itemRegenerationLimit: ITEM_LIMIT, itemRegenerationsRemaining: 0 } as ScreeningQuestionDraftResponse;
  if (!questionText || isSensitiveApplicationQuestion(questionText)) return NextResponse.json({ ...base, error:'sensitive' }, { status:400 });
  const parsed = ResumeAutofillSnapshotV1Schema.safeParse(body.snapshot);
  if (!parsed.success || !body.job?.jobDescription || !body.sourceContentHash) return NextResponse.json({ ...base, error:'insufficient_context' }, { status:400 });
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ ...base, error:'insufficient_context' }, { status:401 });
  const limit = await consumeAiGeneration(userId, qh, body.regenerate === true);
  if (!limit.allowed) return NextResponse.json({ ...base, ...limit }, { status:429 });
  const exp = parsed.data.experience[0];
  const source = parsed.data.summary || (exp ? `${exp.title} at ${exp.company}${exp.bullets[0] ? ` — ${exp.bullets[0]}` : ''}` : 'my professional experience');
  let draft = `I am interested in ${body.job.roleTitle} at ${body.job.companyName} because the role aligns with my experience. ${source}`;
  if (body.characterLimit && body.characterLimit > 0) draft = draft.slice(0, body.characterLimit);
  return NextResponse.json({ ok:true, questionHash:qh, draft, sourceContentHash:body.sourceContentHash, ...limit });
}
