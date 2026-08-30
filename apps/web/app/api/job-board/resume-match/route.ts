import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildResumeJobProfilePrompt } from '@/lib/ai/prompts/resume-job-profile';
import { generateAiContent } from '@/lib/ai/google-ai';
import { getUserId } from '@/lib/auth/get-user-id';
import { checkRateLimitByUser, rateLimitResponse } from '@/lib/auth/api-rate-limit';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { prepareResumeText, RESUME_TEXT_MAX_CHARS } from '@/lib/resume/resume-text-limits';
import { extractResumeProfileFallback, parseResumeJobProfile, type ResumeJobProfile } from '@/lib/job-board/resume-match';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = {
  'Cache-Control': 'no-store, private, max-age=0',
  Pragma: 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};
const MATCH_LIMIT = { limit: 12, windowSeconds: 3_600, name: 'resume-job-match' } as const;

const RequestSchema = z.object({
  resumeId: z.string().uuid().optional(),
  resumeText: z.string().min(50).max(RESUME_TEXT_MAX_CHARS).optional(),
  filename: z.string().trim().min(1).max(255).optional(),
}).strict().refine((value) => Boolean(value.resumeId) !== Boolean(value.resumeText), {
  message: 'Provide either a saved resume or uploaded resume text',
});

type CachedMatchProfile = {
  schemaVersion: 1;
  contentHash: string;
  createdAt: string;
  source: 'ai' | 'deterministic';
  profile: ResumeJobProfile;
};

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function contentHash(value: string) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function readCache(value: unknown, hash: string): CachedMatchProfile | null {
  const cache = objectValue(objectValue(value).jobMatchProfile);
  if (cache.schemaVersion !== 1 || cache.contentHash !== hash) return null;
  const profile = parseResumeJobProfile(cache.profile);
  if (!profile || (cache.source !== 'ai' && cache.source !== 'deterministic')) return null;
  return {
    schemaVersion: 1,
    contentHash: hash,
    createdAt: typeof cache.createdAt === 'string' ? cache.createdAt : '',
    source: cache.source,
    profile,
  };
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401, headers: PRIVATE_HEADERS });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400, headers: PRIVATE_HEADERS });
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Select or upload a valid resume' }, { status: 400, headers: PRIVATE_HEADERS });
  }

  let resumeId: string | null = null;
  let filename = parsed.data.filename || 'Uploaded resume';
  let resumeText = parsed.data.resumeText || '';
  let structuredData: Record<string, unknown> = {};

  if (parsed.data.resumeId) {
    const { data, error } = await getSupabaseAdminClient()
      .from('resumes')
      .select('id, filename, content, structured_data')
      .eq('id', parsed.data.resumeId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ ok: false, error: 'Unable to load the selected resume' }, { status: 500, headers: PRIVATE_HEADERS });
    }
    if (!data?.content) {
      return NextResponse.json({ ok: false, error: 'Resume not found' }, { status: 404, headers: PRIVATE_HEADERS });
    }
    resumeId = String(data.id);
    filename = data.filename || 'Saved resume';
    resumeText = String(data.content);
    structuredData = objectValue(data.structured_data);
  }

  const prepared = prepareResumeText(resumeText);
  if (prepared.text.length < 50) {
    return NextResponse.json({ ok: false, error: 'The resume does not contain enough readable text' }, { status: 400, headers: PRIVATE_HEADERS });
  }
  const hash = contentHash(prepared.text);
  const cached = resumeId ? readCache(structuredData, hash) : null;
  if (cached) {
    return NextResponse.json({ ok: true, filename, source: cached.source, cached: true, profile: cached.profile }, { headers: PRIVATE_HEADERS });
  }

  const rateLimit = await checkRateLimitByUser(userId, MATCH_LIMIT);
  if (!rateLimit.success) return rateLimitResponse(rateLimit);

  let profile: ResumeJobProfile | null = null;
  let source: CachedMatchProfile['source'] = 'ai';
  try {
    const response = await generateAiContent({
      task: 'resume_job_profile',
      contents: buildResumeJobProfilePrompt(prepared.text),
      config: { responseMimeType: 'application/json', temperature: 0.1 },
      userId,
    });
    profile = parseResumeJobProfile(response.text || '');
  } catch (error) {
    console.warn('[resume-job-match] AI extraction unavailable; using deterministic extraction', error instanceof Error ? error.message : 'unknown provider error');
  }
  if (!profile) {
    source = 'deterministic';
    profile = extractResumeProfileFallback(prepared.text);
  }

  if (resumeId) {
    const jobMatchProfile: CachedMatchProfile = {
      schemaVersion: 1,
      contentHash: hash,
      createdAt: new Date().toISOString(),
      source,
      profile,
    };
    const { error } = await getSupabaseAdminClient()
      .from('resumes')
      .update({ structured_data: { ...structuredData, jobMatchProfile } })
      .eq('id', resumeId)
      .eq('user_id', userId);
    if (error) console.error('[resume-job-match] Unable to cache profile', error.message);
  }

  return NextResponse.json({ ok: true, filename, source, cached: false, profile }, { headers: PRIVATE_HEADERS });
}
