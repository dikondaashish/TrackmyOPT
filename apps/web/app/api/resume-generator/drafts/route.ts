/**
 * Resume draft autosave API (ISS-025).
 *
 * GET  /api/resume-generator/drafts?draftKey=foo  → fetch a single draft
 * POST /api/resume-generator/drafts               → upsert { draftKey, step, payload }
 *
 * Client uses a stable `draftKey` (per browser tab/session) so refreshes
 * resume where the user left off.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const draftKey = searchParams.get('draftKey');
    if (!draftKey) {
      // Return most recent draft for this user
      const { data, error } = await supabase
        .from('resume_drafts')
        .select('draft_key, step, payload, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, draft: data?.[0] ?? null });
    }

    const { data, error } = await supabase
      .from('resume_drafts')
      .select('draft_key, step, payload, updated_at')
      .eq('user_id', user.id)
      .eq('draft_key', draftKey)
      .maybeSingle();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, draft: data ?? null });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const draftKey = typeof body.draftKey === 'string' && body.draftKey.length > 0
      ? body.draftKey.slice(0, 80)
      : null;
    const step = typeof body.step === 'string' ? body.step.slice(0, 40) : null;
    const payload = body.payload;

    if (!draftKey || !payload || typeof payload !== 'object') {
      return NextResponse.json({ ok: false, error: 'draftKey and payload required' }, { status: 400 });
    }

    // Soft cap on payload size — ~100KB stringified
    const json = JSON.stringify(payload);
    if (json.length > 100_000) {
      return NextResponse.json({ ok: false, error: 'Draft too large' }, { status: 413 });
    }

    const { error } = await supabase
      .from('resume_drafts')
      .upsert(
        { user_id: user.id, draft_key: draftKey, step, payload },
        { onConflict: 'user_id,draft_key' },
      );
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const draftKey = searchParams.get('draftKey');
    if (!draftKey) {
      return NextResponse.json({ ok: false, error: 'draftKey required' }, { status: 400 });
    }
    const { error } = await supabase
      .from('resume_drafts')
      .delete()
      .eq('user_id', user.id)
      .eq('draft_key', draftKey);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
