import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/getUserId';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store',
};

/**
 * PATCH /api/case-status/primary
 * Set which case appears on the dashboard summary.
 */
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { case_id } = body;

    if (!case_id || typeof case_id !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'case_id is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: target } = await supabase
      .from('case_status')
      .select('id')
      .eq('user_id', userId)
      .eq('id', case_id)
      .maybeSingle();

    if (!target) {
      return NextResponse.json(
        { ok: false, error: 'Case not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    await supabase
      .from('case_status')
      .update({ is_primary: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    const { error } = await supabase
      .from('case_status')
      .update({ is_primary: true, updated_at: new Date().toISOString() })
      .eq('id', case_id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'Failed to set primary case' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error in PATCH /api/case-status/primary:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
