/**
 * GET /api/resume-generator/base-resume
 *
 * Lists the caller's saved resumes or returns one selected resume. Bearer-auth
 * lets the Chrome extension show an explicit resume picker before tailoring.
 * Read-only; every query is scoped to the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/getUserId';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

export async function GET(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401, headers: cors });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const mode = req.nextUrl.searchParams.get('mode');
  if (mode === 'list') {
    const { data, error } = await supabase
      .from('resumes')
      .select('id, filename, updated_at, created_at')
      .eq('user_id', userId)
      .not('content', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'Failed to load resumes' },
        { status: 500, headers: cors }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        resumes: (data ?? []).map((resume) => ({
          id: resume.id,
          filename: resume.filename || 'Untitled resume',
          updatedAt: resume.updated_at ?? resume.created_at,
        })),
      },
      { headers: cors }
    );
  }

  const resumeId = req.nextUrl.searchParams.get('resumeId');
  const isUuid = resumeId
    ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resumeId)
    : false;
  if (resumeId && !isUuid) {
    return NextResponse.json(
      { ok: false, error: 'Invalid resume selection' },
      { status: 400, headers: cors }
    );
  }

  let query = supabase
    .from('resumes')
    .select('id, filename, content, updated_at')
    .eq('user_id', userId)
    .not('content', 'is', null);

  if (resumeId) {
    query = query.eq('id', resumeId);
  } else {
    query = query.order('updated_at', { ascending: false }).limit(1);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: 'Failed to load resume' }, { status: 500, headers: cors });
  }
  if (!data?.content || !data.content.trim()) {
    return NextResponse.json(
      { ok: false, error: 'no_base_resume' },
      { status: 404, headers: cors }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      id: data.id,
      filename: data.filename ?? 'resume',
      content: data.content,
    },
    { headers: cors }
  );
}
