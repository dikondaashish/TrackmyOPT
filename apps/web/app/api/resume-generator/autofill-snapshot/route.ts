import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { getUserId } from '@/lib/auth/getUserId';
import { hasUpstashRedisConfig } from '@/lib/upstash-redis';
import {
  extractAutofillSnapshot,
  FINAL_LATEX_MAX_CHARS,
  hashFinalLatex,
} from '@/lib/resume/extract-autofill-snapshot';

export const dynamic = 'force-dynamic';

const RequestSchema = z
  .object({
    finalLatex: z.string().min(1).max(FINAL_LATEX_MAX_CHARS),
    sourceResumeId: z
      .string()
      .refine(
        (value) =>
          value === '__latest__' ||
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            value
          ),
        'Invalid source resume ID'
      ),
  })
  .strict();

const extractionRateLimit =
  hasUpstashRedisConfig()
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        analytics: false,
      })
    : null;

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

export async function POST(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401, headers: cors }
    );
  }

  const parsed = RequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Invalid input' },
      { status: 400, headers: cors }
    );
  }

  const generatedContentHash = hashFinalLatex(parsed.data.finalLatex);
  if (extractionRateLimit) {
    const limit = await extractionRateLimit.limit(
      `resume-autofill-snapshot:${userId}`
    );
    if (!limit.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Snapshot extraction rate limit reached',
          structuredFieldsAvailable: false,
          generatedContentHash,
        },
        { status: 429, headers: cors }
      );
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  let query = supabase
    .from('resumes')
    .select('id, content')
    .eq('user_id', userId)
    .not('content', 'is', null);
  if (parsed.data.sourceResumeId === '__latest__') {
    query = query.order('updated_at', { ascending: false }).limit(1);
  } else {
    query = query.eq('id', parsed.data.sourceResumeId);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data?.content?.trim()) {
    return NextResponse.json(
      {
        ok: true,
        structuredFieldsAvailable: false,
        generatedContentHash,
        reason: 'source_resume_unavailable',
      },
      { headers: cors }
    );
  }

  const result = await extractAutofillSnapshot({
    finalLatex: parsed.data.finalLatex,
    sourceResumeText: data.content,
  });
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: true,
        structuredFieldsAvailable: false,
        generatedContentHash: result.generatedContentHash,
        reason: result.reason,
      },
      { headers: cors }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      structuredFieldsAvailable: true,
      snapshot: result.snapshot,
      generatedContentHash: result.generatedContentHash,
    },
    { headers: cors }
  );
}
