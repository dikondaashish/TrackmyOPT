/**
 * Authenticated bridge from the Chrome extension to the web LaTeX editor.
 *
 * The generated LaTeX is stored server-side under a random, user-scoped key.
 * The URL contains only that opaque key; the editor still requires the same
 * signed-in user before it can read and consume the payload.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth/getUserId';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';

export const dynamic = 'force-dynamic';

const HANDOFF_PREFIX = 'extension-handoff-';
const MAX_PAYLOAD_CHARS = 100_000;
const MAX_HANDOFF_AGE_MS = 24 * 60 * 60 * 1000;

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
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

  if (!latex.trim() || !resumeText.trim() || !jobDescription.trim() || !templateId) {
    return NextResponse.json(
      { ok: false, error: 'Incomplete editor handoff' },
      { status: 400, headers: cors }
    );
  }

  const payload = {
    latex,
    resumeText,
    resumeFilename: typeof body?.resumeFilename === 'string' ? body.resumeFilename.slice(0, 240) : 'resume',
    jobDescription,
    jobTitle: typeof body?.jobTitle === 'string' ? body.jobTitle.slice(0, 300) : null,
    templateId,
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
