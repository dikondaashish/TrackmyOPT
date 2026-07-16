import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import type { ScreeningQuestionDraftRequest, ScreeningQuestionDraftResponse } from '@/lib/ai/screening-answer-contract';
import { ResumeAutofillSnapshotV1Schema } from '@/lib/resume/autofill-schema';

const SENSITIVE_FIELD_RE = /\b(visa|sponsor(?:ship|ed|ing)?|work authori[sz]\w*|citizen\w*|immigration|clearance|gender|sex|race|ethnic\w*|hispanic|latino|veteran\w*|disab\w*|eeo|salary|compensation|date of birth|dob|ssn|social security)\b/i;

const DAILY_LIMIT = 25;
const ITEM_LIMIT = 3;
const counters = new Map<string, { day: string; daily: number; items: Map<string, number> }>();
const normalized = (s: string) => s.normalize('NFKC').trim().replace(/\s+/g, ' ');
const hash = (s: string) => crypto.createHash('sha256').update(normalized(s)).digest('hex');

export async function POST(req: NextRequest) {
  let body: ScreeningQuestionDraftRequest;
  try { body = await req.json(); } catch { return NextResponse.json({ ok:false, error:'insufficient_context' }, { status:400 }); }
  const questionText = typeof body?.questionText === 'string' ? normalized(body.questionText) : '';
  const qh = hash(questionText);
  const base = { ok:false, questionHash: qh, dailyLimit: DAILY_LIMIT, dailyRemaining: 0, itemRegenerationLimit: ITEM_LIMIT, itemRegenerationsRemaining: 0 } as ScreeningQuestionDraftResponse;
  if (!questionText || SENSITIVE_FIELD_RE.test(questionText)) return NextResponse.json({ ...base, error:'sensitive' }, { status:400 });
  const parsed = ResumeAutofillSnapshotV1Schema.safeParse(body.snapshot);
  if (!parsed.success || !body.job?.jobDescription || !body.sourceContentHash) return NextResponse.json({ ...base, error:'insufficient_context' }, { status:400 });
  // Authenticated deployments should replace this stable key with the auth user id.
  const userKey = req.headers.get('x-user-id') || 'authenticated-user';
  const day = new Date().toISOString().slice(0,10);
  let state = counters.get(userKey); if (!state || state.day !== day) { state = { day, daily:0, items:new Map() }; counters.set(userKey,state); }
  const used = state.items.get(qh) || 0;
  const remainingItem = Math.max(0, ITEM_LIMIT - used);
  if (state.daily >= DAILY_LIMIT) return NextResponse.json({ ...base, dailyRemaining:0, itemRegenerationsRemaining:remainingItem, error:'ai_daily_limit_reached' }, { status:429 });
  if (body.regenerate && used >= ITEM_LIMIT) return NextResponse.json({ ...base, dailyRemaining: DAILY_LIMIT-state.daily, itemRegenerationsRemaining:0, error:'ai_item_regeneration_limit_reached' }, { status:429 });
  // Reserve atomically before generation. Draft is deliberately assembled only from validated fields.
  state.daily += 1; state.items.set(qh, used + (body.regenerate ? 1 : 0));
  const exp = parsed.data.experience[0];
  const source = parsed.data.summary || (exp ? `${exp.title} at ${exp.company}${exp.bullets[0] ? ` — ${exp.bullets[0]}` : ''}` : 'my professional experience');
  let draft = `I am interested in ${body.job.roleTitle} at ${body.job.companyName} because the role aligns with my experience. ${source}`;
  if (body.characterLimit && body.characterLimit > 0) draft = draft.slice(0, body.characterLimit);
  return NextResponse.json({ ok:true, questionHash:qh, draft, sourceContentHash:body.sourceContentHash, dailyLimit:DAILY_LIMIT, dailyRemaining:DAILY_LIMIT-state.daily, itemRegenerationLimit:ITEM_LIMIT, itemRegenerationsRemaining:Math.max(0, ITEM_LIMIT-state.items.get(qh)! + (body.regenerate ? 0 : 1)) });
}
