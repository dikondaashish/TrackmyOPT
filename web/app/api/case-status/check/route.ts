import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkUSCISStatus, mockUSCISStatus } from '@/lib/uscis-checker';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Internal-Request',
  'Cache-Control': 'no-store',
};

/**
 * POST /api/case-status/check
 * Check USCIS status for a receipt number and update database
 * This endpoint is called by:
 * 1. Cron job (every 6 hours)
 * 2. User manual refresh
 * 3. Initial save (immediate check)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify internal request or cron authorization
    const authHeader = req.headers.get('authorization');
    const internalHeader = req.headers.get('X-Internal-Request');
    
    // Check if this is a cron job request
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && internalHeader !== 'true') {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { receipt_number } = body;

    if (!receipt_number) {
      return NextResponse.json(
        { ok: false, error: 'Receipt number is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`📋 Checking status for receipt: ${receipt_number}`);

    // Use service role key for database updates
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch USCIS status
    // Note: Use mockUSCISStatus for development, checkUSCISStatus for production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const uscisStatus = isDevelopment
      ? mockUSCISStatus(receipt_number)
      : await checkUSCISStatus(receipt_number);

    if (!uscisStatus) {
      console.log(`❌ Could not fetch status for ${receipt_number}`);
      return NextResponse.json(
        { ok: false, error: 'Could not fetch case status from USCIS' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Get current case status from database
    const { data: currentCase, error: fetchError } = await supabase
      .from('case_status')
      .select('*')
      .eq('receipt_number', receipt_number)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching current case:', fetchError);
      return NextResponse.json(
        { ok: false, error: 'Database error' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Check if status has changed
    const hasStatusChanged = currentCase && 
      currentCase.current_status !== uscisStatus.status;

    // Prepare status history
    let statusHistory = currentCase?.status_history || [];
    
    if (hasStatusChanged) {
      // Add new status to history
      statusHistory = [
        {
          status: uscisStatus.status,
          date: new Date().toISOString(),
          description: uscisStatus.description,
        },
        ...statusHistory,
      ].slice(0, 20); // Keep only last 20 status updates
    }

    // Update database
    const { error: updateError } = await supabase
      .from('case_status')
      .update({
        current_status: uscisStatus.status,
        case_type: uscisStatus.caseType,
        received_date: uscisStatus.receivedDate,
        last_checked_at: new Date().toISOString(),
        last_status_change_at: hasStatusChanged
          ? new Date().toISOString()
          : currentCase?.last_status_change_at,
        status_history: statusHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('receipt_number', receipt_number);

    if (updateError) {
      console.error('Error updating case status:', updateError);
      return NextResponse.json(
        { ok: false, error: 'Failed to update database' },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`✅ Updated status for ${receipt_number}: ${uscisStatus.status}`);

    // If status changed, send notification (only for premium users)
    if (hasStatusChanged && currentCase) {
      console.log(`📧 Status changed! Sending notification...`);
      
      // Trigger notification (async, don't wait)
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/case-status/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Request': 'true',
        },
        body: JSON.stringify({
          user_id: currentCase.user_id,
          receipt_number,
          old_status: currentCase.current_status,
          new_status: uscisStatus.status,
        }),
      }).catch((err) => {
        console.error('Failed to send notification:', err);
      });
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          receipt_number,
          status: uscisStatus.status,
          changed: hasStatusChanged,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in POST /api/case-status/check:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

