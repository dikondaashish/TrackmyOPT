/**
 * Lightweight PATCH endpoint for non-date profile flags
 * (onboarding_completed, future toggles).
 *
 * Why separate from /api/profile/update: that route validates and writes the
 * date fields and requires all of them. We needed a no-op-friendly endpoint
 * the onboarding wizard can hit to flip a single boolean without re-saving
 * dates.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_FLAGS = new Set(['onboarding_completed']);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_FLAGS.has(key)) continue;
      if (typeof value !== 'boolean') continue;
      updates[key] = value;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'no_valid_fields' }, { status: 400 });
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      console.error('profile/flags update error:', error);
      return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    console.error('profile/flags exception:', msg);
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 });
  }
}
