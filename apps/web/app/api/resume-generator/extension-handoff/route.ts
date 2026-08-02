/**
 * Authenticated bridge from the Chrome extension to the web LaTeX editor.
 *
 * The generated LaTeX is stored server-side under a random, user-scoped key.
 * The URL contains only that opaque key; the editor still requires the same
 * signed-in user before it can read and consume the payload.
 *
 * When possible we also upsert a resumes row so Job Tracker can show the
 * tailored resume even if the user never opens the editor.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth/getUserId';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { buildResumePdfFilename } from '@/lib/resume/build-resume-filename';
import { ATS_PASS_SCORE } from '@/lib/resume/ats-analysis-types';

export const dynamic = 'force-dynamic';

const HANDOFF_PREFIX = 'extension-handoff-';
const MAX_PAYLOAD_CHARS = 100_000;
const MAX_HANDOFF_AGE_MS = 24 * 60 * 60 * 1000;

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

async function persistGeneratedResume(input: {
  userId: string;
  latex: string;
  resumeText: string;
  jobDescription: string;
  jobTitle: string | null;
  templateId: string;
  applicationId: string | null;
  atsScore: number | null;
}) {
  const supabase = getSupabaseAdminClient();
  const filename = buildResumePdfFilename({
    latex: input.latex,
    jobDescription: input.jobDescription,
    jobTitle: input.jobTitle,
    templateId: input.templateId,
  });
  const structuredData: Record<string, unknown> = {
    latexCode: input.latex,
    jobDescription: input.jobDescription,
    jobTitle: input.jobTitle,
    templateId: input.templateId,
    type: 'generated',
    resumeStatus:
      typeof input.atsScore === 'number' && input.atsScore >= ATS_PASS_SCORE ? 'ready' : 'draft',
    atsScore: input.atsScore,
    ...(input.applicationId ? { applicationId: input.applicationId } : {}),
  };

  if (input.applicationId) {
    const { data: existingRows } = await supabase
      .from('resumes')
      .select('id')
      .eq('user_id', input.userId)
      .contains('structured_data', { applicationId: input.applicationId })
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingRows?.[0]?.id) {
      await supabase
        .from('resumes')
        .update({
          filename,
          content: input.resumeText,
          structured_data: structuredData,
          is_parsed: true,
        })
        .eq('id', existingRows[0].id)
        .eq('user_id', input.userId);
      return;
    }
  }

  await supabase.from('resumes').insert({
    user_id: input.userId,
    filename,
    content: input.resumeText,
    structured_data: structuredData,
    is_parsed: true,
    created_at: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401, headers: cors });
  }

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  const latex = typeof body?.latex === 'string' ? body.latex : '';
  const resumeText = typeof body?.resumeText === 'string' ? body.resumeText : '';
  const jobDescription = typeof body?.jobDescription === 'string' ? body.jobDescription : '';
  const templateId = typeof body?.templateId === 'string' ? body.templateId.slice(0, 50) : '';
  const applicationId =
    typeof body?.applicationId === 'string' && body.applicationId.trim()
      ? body.applicationId.trim().slice(0, 80)
      : null;
  const atsScore =
    typeof body?.atsScore === 'number' && Number.isFinite(body.atsScore)
      ? body.atsScore
      : null;

  if (!latex.trim() || !resumeText.trim() || !jobDescription.trim() || !templateId) {
    return NextResponse.json(
      { ok: false, error: 'Incomplete editor handoff' },
      { status: 400, headers: cors }
    );
  }

  const jobTitle = typeof body?.jobTitle === 'string' ? body.jobTitle.slice(0, 300) : null;
  const payload = {
    latex,
    resumeText,
    resumeFilename: typeof body?.resumeFilename === 'string' ? body.resumeFilename.slice(0, 240) : 'resume',
    jobDescription,
    jobTitle,
    templateId,
    applicationId,
    atsScore,
  };
  if (JSON.stringify(payload).length > MAX_PAYLOAD_CHARS) {
    return NextResponse.json(
      { ok: false, error: 'Editor handoff is too large' },
      { status: 413, headers: cors }
    );
  }

  const handoffId = crypto.randomUUID();
  const draftKey = `${HANDOFF_PREFIX}${handoffId}`;
  const { error } = await getSupabaseAdminClient()
    .from('resume_drafts')
    .insert({ user_id: userId, draft_key: draftKey, step: 'editor', payload });

  if (error) {
    return NextResponse.json(
      { ok: false, error: 'Could not prepare the editor' },
      { status: 500, headers: cors }
    );
  }

  // Best-effort: Job Tracker should see this resume without requiring editor open.
  try {
    await persistGeneratedResume({
      userId,
      latex,
      resumeText,
      jobDescription,
      jobTitle,
      templateId,
      applicationId,
      atsScore,
    });
  } catch (persistError) {
    console.error('extension-handoff resume persist failed:', persistError);
  }

  return NextResponse.json({ ok: true, handoffId }, { headers: cors });
}

export async function GET(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401, headers: cors });
  }

  const handoffId = req.nextUrl.searchParams.get('handoffId') ?? '';
  if (!/^[0-9a-f-]{36}$/i.test(handoffId)) {
    return NextResponse.json({ ok: false, error: 'Invalid handoff' }, { status: 400, headers: cors });
  }

  const draftKey = `${HANDOFF_PREFIX}${handoffId}`;
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('resume_drafts')
    .select('payload, updated_at')
    .eq('user_id', userId)
    .eq('draft_key', draftKey)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: 'Handoff not found' }, { status: 404, headers: cors });
  }

  const updatedAt = new Date(data.updated_at).getTime();
  if (!Number.isFinite(updatedAt) || Date.now() - updatedAt > MAX_HANDOFF_AGE_MS) {
    await supabase.from('resume_drafts').delete().eq('user_id', userId).eq('draft_key', draftKey);
    return NextResponse.json({ ok: false, error: 'Handoff expired' }, { status: 410, headers: cors });
  }

  // Consume once so old generated content cannot unexpectedly overwrite a
  // later editor session. The payload is already in memory for this response.
  await supabase.from('resume_drafts').delete().eq('user_id', userId).eq('draft_key', draftKey);
  return NextResponse.json({ ok: true, payload: data.payload }, { headers: cors });
}
