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
 * POST /api/case-status/refresh
 * Manually trigger a status check for user's case
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

    // Use service role key for database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch user's case status
    const { data: caseStatus, error: dbError } = await supabase
      .from('case_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dbError || !caseStatus) {
      return NextResponse.json(
        { ok: false, error: 'No case status found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Rate limit: 1 manual refresh per 5 minutes per user
    const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
    if (caseStatus.last_checked_at) {
      const lastChecked = new Date(caseStatus.last_checked_at).getTime();
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
        body: JSON.stringify({ receipt_number: caseStatus.receipt_number }),
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

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

