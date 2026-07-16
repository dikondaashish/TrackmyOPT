import { NextRequest, NextResponse } from 'next/server';

import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { getUserId } from '@/lib/auth/getUserId';
import { processScreeningQuestionDraft } from '@/lib/ai/screening-answer';
import { SCREENING_QUESTION_LIMITS } from '@/lib/ai/screening-answer-contract';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

export async function POST(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json(
      { ok: false, questionHash: '', error: 'Unauthorized' },
      { status: 401, headers: cors },
    );
  }

  const raw = await req.text();
  if (raw.length > SCREENING_QUESTION_LIMITS.requestBytes) {
    return NextResponse.json(
      { ok: false, questionHash: '', error: 'insufficient_context' },
      { status: 413, headers: cors },
    );
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { ok: false, questionHash: '', error: 'insufficient_context' },
      { status: 400, headers: cors },
    );
  }

  const result = await processScreeningQuestionDraft(body, userId);
  const status = result.ok
    ? 200
    : result.error === 'sensitive'
      ? 400
      : result.error === 'limit'
        ? 429
        : result.error === 'insufficient_context'
          ? 422
          : 502;
  return NextResponse.json(result, { status, headers: cors });
}
