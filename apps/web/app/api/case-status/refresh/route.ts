import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/get-user-id';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store',
};

/**
 * POST /api/case-status/refresh
 * Manually trigger a status check for one case (primary if omitted).
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

    const body = await req.json().catch(() => ({}));
    const caseId = typeof body.case_id === 'string' ? body.case_id : null;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let row: { receipt_number: string; last_checked_at: string | null } | null = null;

    if (caseId) {
      const { data } = await supabase
        .from('case_status')
        .select('receipt_number, last_checked_at')
        .eq('user_id', userId)
        .eq('id', caseId)
        .maybeSingle();
      row = data;
    } else {
      const { data: primary } = await supabase
        .from('case_status')
        .select('receipt_number, last_checked_at')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .maybeSingle();
      row = primary;
    }

    if (!row) {
      const { data: fallback } = await supabase
        .from('case_status')
        .select('receipt_number, last_checked_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      row = fallback;
    }

    if (!row) {
      return NextResponse.json(
        { ok: false, error: 'No case status found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const COOLDOWN_MS = 5 * 60 * 1000;

    if (row.last_checked_at) {
      const lastChecked = new Date(row.last_checked_at).getTime();
      const elapsed = Date.now() - lastChecked;
      if (elapsed < COOLDOWN_MS) {
        const remainingSec = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            ok: false,
            error: `Please wait ${remainingSec} seconds before refreshing again`,
            retryAfter: remainingSec,
          },
          { status: 429, headers: { ...corsHeaders, 'Retry-After': String(remainingSec) } }
        );
      }
    }

    const checkResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/case-status/check`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.CRON_SECRET || '',
          'X-Force-Refresh': 'true',
        },
        body: JSON.stringify({ receipt_number: row.receipt_number, user_id: userId }),
      }
    );

    if (!checkResponse.ok) {
      return NextResponse.json(
        { ok: false, error: 'Failed to refresh status' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { ok: true, message: 'Status refreshed successfully' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in POST /api/case-status/refresh:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
