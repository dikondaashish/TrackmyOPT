/**
 * GET /api/resume-generator/base-resume
 *
 * Returns the caller's most recently saved base resume (the one they saved in
 * the resume generator). Bearer-auth so the Chrome extension can fetch it to
 * generate a tailored resume from a job page. Read-only; own data only.
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

  const { data, error } = await supabase
    .from('resumes')
    .select('filename, content, updated_at')
    .eq('user_id', userId)
    .not('content', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

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
    { ok: true, filename: data.filename ?? 'resume', content: data.content },
    { headers: cors }
  );
}
