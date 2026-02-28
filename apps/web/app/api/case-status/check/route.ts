import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkUSCISStatus, mockUSCISStatus } from '@/lib/immigration/uscis-checker';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Internal-Secret',
  'Cache-Control': 'no-store',
};

/**
 * POST /api/case-status/check
 * Check USCIS status for a receipt number and update database
 * This endpoint is called by:
 * 1. Cron job (daily via Vercel Cron)
 * 2. User manual refresh
 * 3. Initial save (immediate check)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify internal request or cron authorization
    const authHeader = req.headers.get('authorization');
    const internalSecret = req.headers.get('X-Internal-Secret');
    const expectedSecret = process.env.CRON_SECRET;

    // Check if this is a cron job request or internal request with shared secret
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && internalSecret !== expectedSecret) {
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


    // Use service role key for database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // SMART POLLING: Check if case is in a final state before calling external API
    // Only apply this optimization for automated checks (Cron), not manual user refreshes
    const isManualRefresh = req.headers.get('X-Force-Refresh') === 'true';

    if (!isManualRefresh) {
      const { data: existingCase } = await supabase
        .from('case_status')
        .select('current_status, last_checked_at')
        .eq('receipt_number', receipt_number)
        .single();

      if (existingCase?.current_status) {
        const FINAL_STATUS_KEYWORDS = [
          'Card Was Delivered',
          'Case Was Denied',
          'Withdrawal Acknowledged',
          'Notice Explaining USCIS Actions Was Mailed',
          'Termination Notice Sent',
          'Refund Of An Unused Fee'
        ];

        const isFinalState = FINAL_STATUS_KEYWORDS.some(keyword =>
          existingCase.current_status!.includes(keyword)
        );

        if (isFinalState) {
          console.log(`[case-status] Skipping ${receipt_number} (final state: ${existingCase.current_status})`);
          return NextResponse.json(
            {
              ok: true,
              data: {
                receipt_number,
                status: existingCase.current_status,
                changed: false,
                skipped: true,
                reason: 'Final State'
              }
            },
            { status: 200, headers: corsHeaders }
          );
        }
      }
    }

    // Fetch USCIS status
    // Note: Use mockUSCISStatus for development, checkUSCISStatus for production
    const isDevelopment = process.env.NODE_ENV === 'development';

    // In development, use mock data
    if (isDevelopment) {
      const mockStatus = mockUSCISStatus(receipt_number);
      // Mock always succeeds - use the mock data directly
      const statusHistory = mockStatus.histCaseStatus.map((item: { completedText: string; date: string }) => ({
        status: item.completedText,
        date: item.date,
        description: item.completedText,
      }));

      // Get current case for comparison
      const { data: currentCase } = await supabase
        .from('case_status')
        .select('*')
        .eq('receipt_number', receipt_number)
        .single();

      const isFirstCheck = currentCase && !currentCase.current_status;
      const hasStatusChanged = currentCase &&
        currentCase.current_status !== null &&
        currentCase.current_status !== mockStatus.status;

      // Build change_log entry (our own changelog)
      const existingChangelog = Array.isArray(currentCase?.change_log) ? currentCase.change_log : [];
      if (hasStatusChanged) {
        existingChangelog.push({
          date: new Date().toISOString(),
          old_status: currentCase!.current_status,
          new_status: mockStatus.status,
        });
      }

      await supabase
        .from('case_status')
        .update({
          current_status: mockStatus.status,
          case_type: mockStatus.caseType,
          received_date: mockStatus.receivedDate,
          last_checked_at: new Date().toISOString(),
          last_status_change_at: (isFirstCheck || hasStatusChanged)
            ? new Date().toISOString()
            : currentCase?.last_status_change_at,
          status_history: statusHistory,
          change_log: existingChangelog,
          updated_at: new Date().toISOString(),
        })
        .eq('receipt_number', receipt_number);

      return NextResponse.json(
        {
          ok: true,
          data: {
            receipt_number,
            status: mockStatus.status,
            changed: hasStatusChanged,
            isFirstCheck,
          },
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // Production: Call USCIS API
    const uscisResult = await checkUSCISStatus(receipt_number);

    // Handle USCIS API errors
    if (!uscisResult.success) {
      console.error(`[case-status] USCIS API error for ${receipt_number}: ${uscisResult.error.code}`);
      return NextResponse.json(
        {
          ok: false,
          error: uscisResult.error.userMessage,
          errorCode: uscisResult.error.code,
          errorDetails: uscisResult.error.details,
        },
        { status: uscisResult.error.code === 500 ? 500 : 400, headers: corsHeaders }
      );
    }

    // SUCCESS: Extract data from result
    const uscisStatus = uscisResult.data;

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

    // Check if status has changed OR this is the first check (no previous status)
    const isFirstCheck = currentCase && !currentCase.current_status;
    const hasStatusChanged = currentCase &&
      currentCase.current_status !== null &&
      currentCase.current_status !== uscisStatus.status;

    // Use USCIS-provided history timeline as the primary source
    // Transform histCaseStatus to our status_history format
    const statusHistory = uscisStatus.histCaseStatus.map(item => ({
      status: item.completedText,
      date: item.date,
      description: item.completedText,
    }));


    // Build change_log entry (our own changelog)
    const existingChangelog = Array.isArray(currentCase?.change_log) ? currentCase.change_log : [];
    if (hasStatusChanged) {
      existingChangelog.push({
        date: new Date().toISOString(),
        old_status: currentCase!.current_status,
        new_status: uscisStatus.status,
      });
    }

    // Update database
    const { error: updateError } = await supabase
      .from('case_status')
      .update({
        current_status: uscisStatus.status,
        case_type: uscisStatus.caseType,
        received_date: uscisStatus.receivedDate,
        last_checked_at: new Date().toISOString(),
        last_status_change_at: (isFirstCheck || hasStatusChanged)
          ? new Date().toISOString()
          : currentCase?.last_status_change_at,
        status_history: statusHistory,
        change_log: existingChangelog,
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


    // If status changed, send notification (only for premium users)
    if (hasStatusChanged && currentCase) {

      // Trigger notification (async, don't wait)
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/case-status/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.CRON_SECRET || '',
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
          isFirstCheck,
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

