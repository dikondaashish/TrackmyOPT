import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { checkUSCISStatus, mockUSCISStatus } from '@/lib/immigration/uscis-checker';
import {
  resolveCaseCheckSource,
  resolveCaseCheckTrigger,
  trackCaseStatusCheckCompleted,
  trackCaseStatusCheckFailed,
  trackCaseStatusCheckStarted,
} from '@/lib/posthog/case-status-analytics';
import { redactReceiptNumber, secureLog } from '@/lib/secure-logger';
import { applyFreeUserChangeWedgeToUpdate } from '@/lib/case-status/free-change-wedge';
import { resolveReceivedDate } from '@/lib/case-status/filing-date';
import { resolvePpStartDateForStorage } from '@/lib/case-status/premium-processing';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Internal-Secret',
  'Cache-Control': 'no-store',
};

async function getUserIsPremium(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('premium_status')
    .eq('user_id', userId)
    .single();
  const profile = data as { premium_status?: boolean | null } | null;
  return profile?.premium_status === true;
}

/**
 * POST /api/case-status/check
 * Check USCIS status for a receipt number and update database
 * This endpoint is called by:
 * 1. Cron job (daily via Vercel Cron)
 * 2. User manual refresh
 * 3. Initial save (immediate check)
 */
export async function POST(req: NextRequest) {
  const checkStartedAt = Date.now();
  let receiptNumberForLog: string | null = null;
  let analyticsUserId: string | null = null;
  let analyticsTrigger: ReturnType<typeof resolveCaseCheckTrigger> = 'unknown';
  let analyticsSource: ReturnType<typeof resolveCaseCheckSource> = 'api';
  let analyticsReceiptNumber: string | null = null;

  const finishCompleted = async (
    statusText: string | null | undefined,
    httpStatus: number
  ) => {
    if (!analyticsReceiptNumber) return;
    await trackCaseStatusCheckCompleted({
      userId: analyticsUserId,
      receiptNumber: analyticsReceiptNumber,
      trigger: analyticsTrigger,
      source: analyticsSource,
      durationMs: Date.now() - checkStartedAt,
      statusText,
      httpStatus,
    });
  };

  const finishFailed = async (
    httpStatus: number,
    errorCode?: string | number | null
  ) => {
    if (!analyticsReceiptNumber) return;
    await trackCaseStatusCheckFailed({
      userId: analyticsUserId,
      receiptNumber: analyticsReceiptNumber,
      trigger: analyticsTrigger,
      source: analyticsSource,
      durationMs: Date.now() - checkStartedAt,
      httpStatus,
      errorCode,
    });
  };

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
    receiptNumberForLog = receipt_number || null;

    if (!receipt_number) {
      return NextResponse.json(
        { ok: false, error: 'Receipt number is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedReceipt = receipt_number.toUpperCase();
    analyticsReceiptNumber = normalizedReceipt;
    analyticsTrigger = resolveCaseCheckTrigger(req);
    analyticsSource = resolveCaseCheckSource(analyticsTrigger);

    // Use service role key for database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: caseMeta } = await supabase
      .from('case_status')
      .select('user_id, current_status')
      .eq('receipt_number', normalizedReceipt)
      .maybeSingle();
    analyticsUserId = caseMeta?.user_id ?? null;

    await trackCaseStatusCheckStarted({
      userId: analyticsUserId,
      receiptNumber: normalizedReceipt,
      trigger: analyticsTrigger,
      source: analyticsSource,
    });

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
          secureLog.log(
            `[case-status] Skipping ${redactReceiptNumber(receipt_number)} (final state: [status redacted])`,
          );
          await finishCompleted(existingCase.current_status, 200);
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

    // Mock is OFF by default. We require BOTH conditions to enable mock:
    //  1) USCIS_MOCK === 'true' explicitly set, AND
    //  2) NOT running in production (extra safety so a stray env var
    //     cannot accidentally show fake data to real users).
    const useMock =
      process.env.USCIS_MOCK === 'true' &&
      process.env.VERCEL_ENV !== 'production' &&
      process.env.NODE_ENV !== 'production';

    // Loud, single warning if USCIS_MOCK was set in prod — we ignored it.
    if (process.env.USCIS_MOCK === 'true' && !useMock) {
      console.warn('[USCIS] USCIS_MOCK=true was set but ignored in production environment.');
    }

    if (useMock) {
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

      const isPremium = currentCase?.user_id
        ? await getUserIsPremium(supabase, currentCase.user_id)
        : false;

      const mockUpdateData: Record<string, unknown> = {
        current_status: mockStatus.status,
        case_type: mockStatus.caseType,
        received_date: resolveReceivedDate({
          uscisReceivedDate: mockStatus.receivedDate,
          statusHistory,
          existingReceivedDate: currentCase?.received_date,
        }),
        pp_start_date: resolvePpStartDateForStorage({
          existingManual: currentCase?.pp_start_date,
          statusHistory,
          currentStatus: mockStatus.status,
        }),
        last_checked_at: new Date().toISOString(),
        last_status_change_at: (isFirstCheck || hasStatusChanged)
          ? new Date().toISOString()
          : currentCase?.last_status_change_at,
        status_history: statusHistory,
        change_log: existingChangelog,
        updated_at: new Date().toISOString(),
      };

      applyFreeUserChangeWedgeToUpdate(mockUpdateData, {
        hasStatusChanged: Boolean(hasStatusChanged),
        isFirstCheck: Boolean(isFirstCheck),
        isPremium,
      });

      await supabase
        .from('case_status')
        .update(mockUpdateData)
        .eq('receipt_number', receipt_number);

      await finishCompleted(mockStatus.status, 200);

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

    // Handle USCIS API errors (ISS-012: persist failure + observability log)
    if (!uscisResult.success) {
      const errorCode = String(uscisResult.error.code);
      const errorMessage = uscisResult.error.userMessage || 'USCIS check failed';
      secureLog.error(
        `[case-status] USCIS API error for ${redactReceiptNumber(receipt_number)}: ${errorCode}`,
      );

      // Persist failure state so the UI can show "last refresh failed" and
      // cron can apply exponential backoff via consecutive_failures.
      try {
        const { data: row } = await supabase
          .from('case_status')
          .select('consecutive_failures')
          .eq('receipt_number', receipt_number)
          .single();
        const prevFails = row?.consecutive_failures || 0;
        await supabase
          .from('case_status')
          .update({
            last_check_failed_at: new Date().toISOString(),
            last_check_error_code: errorCode,
            last_check_error_message: errorMessage.slice(0, 500),
            consecutive_failures: prevFails + 1,
          })
          .eq('receipt_number', receipt_number);
      } catch (e) {
        console.error('Failed to persist USCIS failure state:', e);
      }

      // Append to uscis_check_log for ops observability
      try {
        await supabase.from('uscis_check_log').insert({
          receipt_number,
          success: false,
          source: isManualRefresh ? 'manual' : 'cron',
          duration_ms: Date.now() - checkStartedAt,
          error_code: errorCode,
          error_message: errorMessage.slice(0, 500),
        });
      } catch { /* ignore log failures */ }

      const failureHttpStatus = uscisResult.error.code === 500 ? 500 : 400;
      await finishFailed(failureHttpStatus, uscisResult.error.code);

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
      await finishFailed(500, 'db_fetch_error');
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

    const isPremium = currentCase?.user_id
      ? await getUserIsPremium(supabase, currentCase.user_id)
      : false;

    const updateData: Record<string, unknown> = {
      current_status: uscisStatus.status,
      case_type: uscisStatus.caseType,
      received_date: resolveReceivedDate({
        uscisReceivedDate: uscisStatus.receivedDate,
        statusHistory,
        existingReceivedDate: currentCase?.received_date,
      }),
      pp_start_date: resolvePpStartDateForStorage({
        existingManual: currentCase?.pp_start_date,
        statusHistory,
        currentStatus: uscisStatus.status,
      }),
      last_checked_at: new Date().toISOString(),
      last_status_change_at: (isFirstCheck || hasStatusChanged)
        ? new Date().toISOString()
        : currentCase?.last_status_change_at,
      status_history: statusHistory,
      change_log: existingChangelog,
      updated_at: new Date().toISOString(),
      last_check_failed_at: null,
      last_check_error_code: null,
      last_check_error_message: null,
      consecutive_failures: 0,
    };

    applyFreeUserChangeWedgeToUpdate(updateData, {
      hasStatusChanged: Boolean(hasStatusChanged),
      isFirstCheck: Boolean(isFirstCheck),
      isPremium,
    });

    // Update database — reset failure counters on success (ISS-012)
    const { error: updateError } = await supabase
      .from('case_status')
      .update(updateData)
      .eq('receipt_number', receipt_number);

    // Log successful check (ISS-015 observability)
    try {
      await supabase.from('uscis_check_log').insert({
        receipt_number,
        success: true,
        source: isManualRefresh ? 'manual' : 'cron',
        duration_ms: Date.now() - checkStartedAt,
      });
    } catch { /* ignore */ }

    if (updateError) {
      console.error('Error updating case status:', updateError);
      await finishFailed(500, 'db_update_error');
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

    await finishCompleted(uscisStatus.status, 200);

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
    await finishFailed(500, 'internal_error');
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

