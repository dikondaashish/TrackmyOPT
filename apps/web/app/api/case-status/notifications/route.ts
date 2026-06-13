import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/getUserId';
import { captureServerEvent, normalizePlanTier } from '@/lib/posthog-server';
import { getReceiptPrefix } from '@/lib/posthog/uscis-status-category';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store',
};



/**
 * PATCH /api/case-status/notifications
 * Toggle notification settings for user's case
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
    const { notifications_enabled } = body;

    if (typeof notifications_enabled !== 'boolean') {
      return NextResponse.json(
        { ok: false, error: 'Invalid notifications_enabled value' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Use service role key to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update notification settings
    const { error: updateError } = await supabaseAdmin
      .from('case_status')
      .update({
        notifications_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating notifications:', updateError);
      return NextResponse.json(
        { ok: false, error: 'Failed to update notification settings' },
        { status: 500, headers: corsHeaders }
      );
    }

    const { data: caseStatus } = await supabaseAdmin
      .from('case_status')
      .select('receipt_number, current_status')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan_tier, premium_status')
      .eq('user_id', userId)
      .maybeSingle();

    await captureServerEvent(userId, 'receipt_updated', {
      receipt_prefix: getReceiptPrefix(caseStatus?.receipt_number),
      notifications_enabled,
      plan_tier: normalizePlanTier(
        profile?.plan_tier || (profile?.premium_status ? 'pro' : 'free')
      ),
      is_new_enrollment: false,
    });

    return NextResponse.json(
      { ok: true, message: 'Notification settings updated' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in PATCH /api/case-status/notifications:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

