import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';

import { consumeAiGeneration } from '@/lib/ai-generation-limits';
import { generateGroundedText } from '@/lib/ai/generate-grounded-text';
import { buildCoverLetterPrompt } from '@/lib/ai/prompts/cover-letter';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { getUserId } from '@/lib/auth/getUserId';
import { getActiveUserPlanTier } from '@/lib/premium/user-plan-tier';
import {
  GenerateCoverLetterRequestSchema,
  type GeneratedCoverLetterAttachment,
} from '@/lib/resume/autofill-schema';
import { compileCoverLetterPdf } from '@/lib/resume/cover-letter-pdf';
import { AUTOFILL_FEATURE_FLAGS } from '../../../../../extension/src/autofill-feature-flags';

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
  if (!AUTOFILL_FEATURE_FLAGS.coverLetter) {
    return json(req, { error: 'feature_disabled' }, 501);
  }

  let untrusted: unknown;
  try {
    untrusted = await req.json();
  } catch {
    return json(req, { error: 'invalid_request' }, 400);
  }
  const parsed = GenerateCoverLetterRequestSchema.safeParse(untrusted);
  if (!parsed.success) {
    return json(req, { error: 'invalid_request' }, 400);
  }

  const userId = await getUserId(req);
  if (!userId) {
    return json(req, { error: 'unauthorized' }, 401);
  }
  const body = parsed.data;
  const planTier = await getActiveUserPlanTier(userId);
  const itemKey = [
    'cover-letter',
    body.sourceContentHash,
    body.job.companyName,
    body.job.roleTitle,
  ].join(':');
  const limits = await consumeAiGeneration(
    userId,
    itemKey,
    body.isRegeneration === true,
    {
      feature: 'cover_letter',
      planTier,
    },
  );
  if (!limits.allowed) {
    return json(
      req,
      { error: limits.error || 'ai_rate_limited', limits },
      429
    );
  }

  try {
    const draftText = await generateGroundedText(buildCoverLetterPrompt(body));
    const pdf = await compileCoverLetterPdf(draftText);
    const bytes = Buffer.from(pdf);
    const attachment: GeneratedCoverLetterAttachment = {
      filename: 'TrackMyOPT-cover-letter.pdf',
      base64: bytes.toString('base64'),
      sha256: createHash('sha256').update(bytes).digest('hex'),
      generatedAt: new Date().toISOString(),
      sourceContentHash: body.sourceContentHash,
    };
    return json(req, {
      attachment,
      draftText,
      limits,
    });
  } catch (error) {
    console.error(
      'Cover-letter generation failed:',
      error instanceof Error ? error.message : 'unknown error'
    );
    return json(
      req,
      { error: 'generation_failed', limits },
      502
    );
  }
}
