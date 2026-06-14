import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/getUserId';
import { sendEnrollmentEmail } from '@/lib/notifications/email-service';
import { caseLimitMessage, getCaseTrackingLimit } from '@/lib/case-status/case-limits';
import { pickPrimaryCase } from '@/lib/case-status/select-primary-case';
import { captureServerEvent, normalizePlanTier } from '@/lib/posthog-server';
import { getReceiptPrefix } from '@/lib/posthog/uscis-status-category';
import { redactReceiptNumber, secureLog } from '@/lib/secure-logger';
import type { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

async function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getUserPremium(
  supabase: Awaited<ReturnType<typeof getSupabaseAdmin>>,
  userId: string
) {
  const { data } = await supabase
    .from('profiles')
    .select('plan_tier, premium_status, first_name')
    .eq('user_id', userId)
    .maybeSingle();
  const isPremium = data?.premium_status === true;
  return {
    isPremium,
    planTier: normalizePlanTier(data?.plan_tier || (isPremium ? 'pro' : 'free')),
    firstName: data?.first_name ?? 'there',
  };
}

function sortCases<T extends { is_primary?: boolean | null; created_at?: string | null }>(
  cases: T[]
): T[] {
  return [...cases].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return aTime - bTime;
  });
}

/**
 * GET /api/case-status
 * Returns all tracked cases; `data` is the primary case (backward compatible).
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const supabase = await getSupabaseAdmin();

    const { data: cases, error: dbError } = await supabase
      .from('case_status')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (dbError) {
      console.error('Database error fetching case status:', dbError);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch case status' },
        { status: 500, headers: corsHeaders }
      );
    }

    const sorted = sortCases(cases ?? []);
    const primary = pickPrimaryCase(sorted);

    return NextResponse.json(
      {
        ok: true,
        data: primary ?? null,
        cases: sorted,
        primaryCaseId: primary?.id ?? null,
      },
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
 * Add a new receipt or update an existing one (matched by receipt number).
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

    const body = await req.json();
    const {
      receipt_number,
      notifications_enabled = true,
      label = null,
      case_type = 'I-765',
      set_primary = false,
    } = body;

    if (!receipt_number || typeof receipt_number !== 'string') {
      await captureServerEvent(userId, 'receipt_validation_failed', {
        validation_error_code: 'missing_receipt',
      });
      return NextResponse.json(
        { ok: false, error: 'Receipt number is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedReceipt = receipt_number.toUpperCase().trim();
    const receiptPattern = /^[A-Z]{3}\d{10}$/;
    if (!receiptPattern.test(normalizedReceipt)) {
      await captureServerEvent(userId, 'receipt_validation_failed', {
        receipt_prefix: getReceiptPrefix(normalizedReceipt),
        validation_error_code: 'invalid_format',
      });
      return NextResponse.json(
        { ok: false, error: 'Invalid receipt number format' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseAdmin = await getSupabaseAdmin();
    const { isPremium, planTier, firstName } = await getUserPremium(supabaseAdmin, userId);

    const { data: userCases } = await supabaseAdmin
      .from('case_status')
      .select('id, receipt_number, current_status, is_primary')
      .eq('user_id', userId);

    const existing = (userCases ?? []).find(
      (c) => c.receipt_number === normalizedReceipt
    );
    const isFirstCase = (userCases ?? []).length === 0;
    const isNewReceipt = !existing;

    if (isNewReceipt) {
      const limit = getCaseTrackingLimit(isPremium);
      if ((userCases ?? []).length >= limit) {
        return NextResponse.json(
          {
            ok: false,
            error: caseLimitMessage(isPremium),
            code: 'case_limit_reached',
            limit,
          },
          { status: 403, headers: corsHeaders }
        );
      }
    }

    const shouldBePrimary =
      set_primary || isFirstCase || (userCases ?? []).every((c) => !c.is_primary);

    if (shouldBePrimary && !isFirstCase) {
      await supabaseAdmin
        .from('case_status')
        .update({ is_primary: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    }

    const upsertPayload = {
      user_id: userId,
      receipt_number: normalizedReceipt,
      notifications_enabled,
      label: typeof label === 'string' && label.trim() ? label.trim() : null,
      case_type: typeof case_type === 'string' ? case_type : 'I-765',
      is_primary: shouldBePrimary,
      updated_at: new Date().toISOString(),
    };

    let caseStatus;
    let dbError;

    if (existing) {
      const result = await supabaseAdmin
        .from('case_status')
        .update(upsertPayload)
        .eq('id', existing.id)
        .select()
        .single();
      caseStatus = result.data;
      dbError = result.error;
    } else {
      const result = await supabaseAdmin
        .from('case_status')
        .insert(upsertPayload)
        .select()
        .single();
      caseStatus = result.data;
      dbError = result.error;
    }

    if (dbError || !caseStatus) {
      console.error('Database error saving case status:', dbError);
      return NextResponse.json(
        { ok: false, error: 'Failed to save case status' },
        { status: 500, headers: corsHeaders }
      );
    }

    const isNewEnrollment = notifications_enabled && isNewReceipt;
    const receiptPrefix = getReceiptPrefix(normalizedReceipt);

    await captureServerEvent(
      userId,
      isNewReceipt ? 'receipt_added' : 'receipt_updated',
      {
        receipt_prefix: receiptPrefix,
        notifications_enabled,
        plan_tier: planTier,
        is_new_enrollment: isNewEnrollment,
        case_count: (userCases ?? []).length + (isNewReceipt ? 1 : 0),
      }
    );

    if (isNewEnrollment && isPremium) {
      secureLog.log(`[case-status] New enrollment: ${redactReceiptNumber(normalizedReceipt)}`);
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const userEmail = userData?.user?.email;
      if (userEmail) {
        try {
          await sendEnrollmentEmail(userEmail, firstName, 'case-status');
        } catch (err) {
          secureLog.error(`[case-status] Enrollment email error:`, err);
        }
      }
    }

    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/case-status/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': process.env.CRON_SECRET || '',
        'X-Check-Trigger': 'initial',
      },
      body: JSON.stringify({ receipt_number: normalizedReceipt }),
    }).catch((err) => {
      console.error('Failed to trigger initial status check:', err);
    });

    if (isPremium && isNewReceipt) {
      fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/case-status/nearby/scan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Secret': process.env.CRON_SECRET || '',
          },
          body: JSON.stringify({
            receipt: normalizedReceipt,
            before: 100,
            after: 100,
          }),
        }
      ).catch((err) => {
        console.error('Failed to warm nearby case cache:', err);
      });
    }

    return NextResponse.json(
      { ok: true, data: caseStatus, enrollmentEmailSent: isNewEnrollment },
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

/**
 * DELETE /api/case-status?id=<case_uuid>
 * Remove one tracked case.
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const caseId =
      req.nextUrl.searchParams.get('id') ||
      (await req.json().catch(() => ({}))).id;

    const supabaseAdmin = await getSupabaseAdmin();

    const { data: userCases } = await supabaseAdmin
      .from('case_status')
      .select('id')
      .eq('user_id', userId);

    if (!userCases?.length) {
      return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders });
    }

    let targetId = caseId as string | null;
    if (!targetId) {
      if (userCases.length > 1) {
        return NextResponse.json(
          { ok: false, error: 'case id is required when tracking multiple cases' },
          { status: 400, headers: corsHeaders }
        );
      }
      targetId = userCases[0].id;
    }

    const { data: deleted, error: dbError } = await supabaseAdmin
      .from('case_status')
      .delete()
      .eq('user_id', userId)
      .eq('id', targetId)
      .select('id, is_primary');

    if (dbError) {
      console.error('Database error deleting case status:', dbError);
      return NextResponse.json(
        { ok: false, error: 'Failed to delete case status' },
        { status: 500, headers: corsHeaders }
      );
    }

    const removed = deleted?.[0];
    if (removed?.is_primary) {
      const { data: remaining } = await supabaseAdmin
        .from('case_status')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1);
      if (remaining?.[0]) {
        await supabaseAdmin
          .from('case_status')
          .update({ is_primary: true, updated_at: new Date().toISOString() })
          .eq('id', remaining[0].id);
      }
    }

    return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error in DELETE /api/case-status:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
