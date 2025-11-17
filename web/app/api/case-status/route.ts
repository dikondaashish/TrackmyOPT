import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

/**
 * GET /api/case-status
 * Fetch user's current case status
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Fetch case status from database
    const { data: caseStatus, error: dbError } = await supabase
      .from('case_status')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (dbError) {
      if (dbError.code === 'PGRST116') {
        // No case status found (not an error, just empty)
        return NextResponse.json(
          { ok: true, data: null },
          { status: 200, headers: corsHeaders }
        );
      }
      
      console.error('Database error fetching case status:', dbError);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch case status' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { ok: true, data: caseStatus },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in GET /api/case-status:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/case-status
 * Save or update user's case receipt number
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { receipt_number, notifications_enabled = true } = body;

    // Validate receipt number
    if (!receipt_number || typeof receipt_number !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Receipt number is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const receiptPattern = /^[A-Z]{3}\d{10}$/;
    if (!receiptPattern.test(receipt_number)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid receipt number format' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Use service role key for upsert to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Upsert case status (insert or update)
    const { data: caseStatus, error: dbError } = await supabaseAdmin
      .from('case_status')
      .upsert(
        {
          user_id: user.id,
          receipt_number: receipt_number.toUpperCase(),
          notifications_enabled,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (dbError) {
      console.error('Database error saving case status:', dbError);
      return NextResponse.json(
        { ok: false, error: 'Failed to save case status' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Trigger immediate status check (async, don't wait)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/case-status/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Request': 'true',
      },
      body: JSON.stringify({ receipt_number: receipt_number.toUpperCase() }),
    }).catch((err) => {
      console.error('Failed to trigger initial status check:', err);
    });

    return NextResponse.json(
      { ok: true, data: caseStatus },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in POST /api/case-status:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

