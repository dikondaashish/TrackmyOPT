import { NextRequest, NextResponse } from 'next/server';

import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { getUserId } from '@/lib/auth/getUserId';
import { readAiGenerationLimitState } from '@/lib/ai/ai-generation-limits';
import {
  deleteSavedScreeningAnswer,
  findSavedScreeningAnswerByHash,
  SaveScreeningAnswerSchema,
  saveScreeningAnswer,
} from '@/lib/ai/screening-answer-library';

export const dynamic = 'force-dynamic';

const MAX_BODY_CHARACTERS = 16_000;
const SHA256_RE = /^[a-f0-9]{64}$/i;

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

export async function GET(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, {
      status: 401,
      headers: cors,
    });
  }
  const questionHash = req.nextUrl.searchParams.get('question_hash') ?? '';
  if (!SHA256_RE.test(questionHash)) {
    return NextResponse.json({ ok: false, error: 'Invalid question hash' }, {
      status: 400,
      headers: cors,
    });
  }
  try {
    const [answer, limits] = await Promise.all([
      findSavedScreeningAnswerByHash({ userId, questionHash }),
      readAiGenerationLimitState({
        userId,
        kind: 'screening_answer',
        itemHash: questionHash,
      }),
    ]);
    return NextResponse.json({ ok: true, answer, limits, exactOnly: true }, {
      headers: cors,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Library unavailable' }, {
      status: 500,
      headers: cors,
    });
  }
}

export async function PUT(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, {
      status: 401,
      headers: cors,
    });
  }
  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARACTERS) {
    return NextResponse.json({ ok: false, error: 'Payload too large' }, {
      status: 413,
      headers: cors,
    });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    body = null;
  }
  const parsed = SaveScreeningAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid answer' }, {
      status: 400,
      headers: cors,
    });
  }
  try {
    const answer = await saveScreeningAnswer(parsed.data, userId);
    return NextResponse.json({ ok: true, answer }, { headers: cors });
  } catch {
    return NextResponse.json({ ok: false, error: 'Library unavailable' }, {
      status: 500,
      headers: cors,
    });
  }
}

export async function DELETE(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, {
      status: 401,
      headers: cors,
    });
  }
  const raw = await req.text();
  if (raw.length > 1_000) {
    return NextResponse.json({ ok: false, error: 'Payload too large' }, {
      status: 413,
      headers: cors,
    });
  }
  let body: { questionHash?: unknown } | null = null;
  try {
    body = JSON.parse(raw) as { questionHash?: unknown };
  } catch {
    // Invalid body handled below without exposing parser details.
  }
  const questionHash = typeof body?.questionHash === 'string'
    ? body.questionHash
    : '';
  if (!SHA256_RE.test(questionHash)) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, {
      status: 400,
      headers: cors,
    });
  }
  try {
    await deleteSavedScreeningAnswer({ userId, questionHash });
    return NextResponse.json({ ok: true }, { headers: cors });
  } catch {
    return NextResponse.json({ ok: false, error: 'Library unavailable' }, {
      status: 500,
      headers: cors,
    });
  }
}
