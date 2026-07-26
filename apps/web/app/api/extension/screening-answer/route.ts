import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { z } from 'zod';
import type { ScreeningQuestionDraftRequest, ScreeningQuestionDraftResponse } from '@/lib/ai/screening-answer-contract';
import { consumeAiGeneration } from '@/lib/ai-generation-limits';
import { generateGroundedText } from '@/lib/ai/generate-grounded-text';
import { buildScreeningAnswerPrompt } from '@/lib/ai/prompts/screening-answer';
import { validateScreeningDraftGrounding } from '@/lib/ai/screening-answer-grounding';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { getUserId } from '@/lib/auth/getUserId';
import { getActiveUserPlanTier } from '@/lib/premium/user-plan-tier';
import { ResumeAutofillSnapshotV1Schema } from '@/lib/resume/autofill-schema';
import { AUTOFILL_FEATURE_FLAGS } from '../../../../../extension/src/autofill-feature-flags';
import {
  isSensitiveApplicationQuestion,
  normalizeApplicationQuestion,
  SCREENING_QUESTION_TEXT_MAX_CHARS,
} from '../../../../../extension/src/sensitive-question-policy';

const DAILY_LIMIT = 25;
const ITEM_LIMIT = 3;
const ScreeningQuestionDraftRequestSchema = z.object({
  questionText: z.string().trim().min(1).max(SCREENING_QUESTION_TEXT_MAX_CHARS),
  characterLimit: z.number().int().min(1).max(2_000).optional(),
  job: z.object({
    companyName: z.string().trim().min(1).max(200),
    roleTitle: z.string().trim().min(1).max(200),
    jobDescription: z.string().trim().min(1).max(20_000),
  }).strict(),
  snapshot: ResumeAutofillSnapshotV1Schema,
  sourceContentHash: z.string().regex(/^[a-f0-9]{64}$/i),
  regenerate: z.boolean().optional(),
}).strict();
const hash = (s: string) =>
  crypto
    .createHash('sha256')
    .update(normalizeApplicationQuestion(s))
    .digest('hex');

function json(req: NextRequest, body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: corsHeadersWebAndExtension(req),
  });
}

export async function OPTIONS(req: NextRequest) {
  return json(req, {});
}

export async function POST(req: NextRequest) {
  let untrusted: unknown;
  try { untrusted = await req.json(); } catch { return json(req, { ok:false, error:'insufficient_context' }, 400); }
  const questionText =
    untrusted &&
    typeof untrusted === 'object' &&
    typeof (untrusted as { questionText?: unknown }).questionText === 'string'
      ? normalizeApplicationQuestion(
          (untrusted as { questionText: string }).questionText
        )
      : '';
  const qh = hash(questionText);
  const base = {
    ok: false,
    allowed: false,
    questionHash: qh,
    quotaPeriod: 'month' as const,
    quotaLimit: 5,
    quotaRemaining: 0,
    dailyLimit: DAILY_LIMIT,
    dailyRemaining: 0,
    itemRegenerationLimit: ITEM_LIMIT,
    itemRegenerationsRemaining: 0,
  } satisfies ScreeningQuestionDraftResponse;
  if (!questionText) {
    return json(req, { ...base, error: 'insufficient_context' }, 400);
  }
  if (isSensitiveApplicationQuestion(questionText)) {
    return json(req, { ...base, error:'sensitive' }, 400);
  }
  if (!AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts) {
    return json(req, { ...base, error: 'feature_disabled' }, 501);
  }

  const parsed = ScreeningQuestionDraftRequestSchema.safeParse({
    ...(untrusted as Record<string, unknown>),
    questionText,
  });
  if (!parsed.success) {
    return json(req, { ...base, error: 'insufficient_context' }, 400);
  }
  const body: ScreeningQuestionDraftRequest = parsed.data;

  const userId = await getUserId(req);
  if (!userId) {
    return json(req, { ...base, error: 'generation_failed' }, 401);
  }
  const planTier = await getActiveUserPlanTier(userId);
  const quota = await consumeAiGeneration(
    userId,
    `screening:${qh}:${body.sourceContentHash}`,
    body.regenerate === true,
    {
      feature: 'screening_answer',
      planTier,
    },
  );
  const limits = {
    quotaPeriod: quota.quotaPeriod,
    quotaLimit: quota.quotaLimit,
    quotaRemaining: quota.quotaRemaining,
    dailyLimit: quota.dailyLimit,
    dailyRemaining: quota.dailyRemaining,
    itemRegenerationLimit: quota.itemRegenerationLimit,
    itemRegenerationsRemaining: quota.itemRegenerationsRemaining,
    resetsAt: quota.resetsAt,
  };
  if (!quota.allowed) {
    return json(
      req,
      { ok: false, questionHash: qh, ...limits, error: quota.error || 'limit' },
      429
    );
  }

  try {
    const generated = await generateGroundedText(
      buildScreeningAnswerPrompt(body)
    );
    const maxLength = body.characterLimit ?? 1_200;
    const draft = generated.slice(0, maxLength).trim();
    const grounding = validateScreeningDraftGrounding(draft, body);
    if (!grounding.valid) {
      return json(
        req,
        { ok: false, questionHash: qh, ...limits, error: 'insufficient_context' },
        422
      );
    }
    return json(req, {
      ok: true,
      questionHash: qh,
      draft,
      sourceContentHash: body.sourceContentHash,
      allowed: true,
      ...limits,
    } satisfies ScreeningQuestionDraftResponse);
  } catch (error) {
    console.error(
      'Screening-answer generation failed:',
      error instanceof Error ? error.message : 'unknown error'
    );
    return json(
      req,
      { ok: false, questionHash: qh, ...limits, error: 'generation_failed' },
      502
    );
  }
}
