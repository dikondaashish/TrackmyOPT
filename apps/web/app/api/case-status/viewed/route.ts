import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/getUserId';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store',
};

/**
 * POST /api/case-status/viewed
 * Mark the case status page as viewed (dismisses the free-tier change wedge).
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('case_status')
      .update({
        last_status_viewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating last_status_viewed_at:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to update view timestamp' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error in POST /api/case-status/viewed:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
