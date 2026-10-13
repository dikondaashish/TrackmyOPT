import { verifyWorkerAuth } from '@/lib/api/verify-worker-auth';
import { resolveActivePlanTier } from '@/lib/premium/user-plan-tier';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import {
  buildCaseStatusChangeEmailHtml,
  CASE_STATUS_CHANGE_SUBJECT_PREFIX,
} from '@/lib/notifications/case-status-email';
import { getSmtpFromHeader } from '@/lib/notifications/email-smtp';
import {
  isWebPushConfigured,
  sendCaseStatusPush,
} from '@/lib/notifications/web-push';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Internal-Secret',
  'Cache-Control': 'no-store',
};

// Create SMTP transporter for Hostinger
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: (process.env.SMTP_PORT || '465') === '465',
  requireTLS: (process.env.SMTP_PORT || '465') !== '465',
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * POST /api/case-status/notify
 * Send email notification when case status changes
 * (Premium feature only)
 */
async function handlePOST(req: NextRequest) {
  try {
    // Verify internal request via shared secret (not spoofable header)
    const internalSecret = req.headers.get('X-Internal-Secret');
    const expectedSecret = process.env.CRON_SECRET;

    if (
      (!expectedSecret || internalSecret !== expectedSecret) &&
      verifyWorkerAuth(req)
    ) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { user_id, receipt_number, old_status, new_status } = body;

    if (
      typeof user_id !== 'string' ||
      typeof receipt_number !== 'string' ||
      !/^[A-Z]{3}\d{10}$/i.test(receipt_number) ||
      typeof new_status !== 'string' ||
      !new_status.trim() ||
      new_status.length > 500 ||
      (old_status != null && typeof old_status !== 'string')
    ) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Use service role key for database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user details and check if premium
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select(
        'email, notification_email, first_name, last_name, premium_status, subscription_expires_at, plan_tier'
      )
      .eq('user_id', user_id)
      .single();

    if (userError || !userData) {
      if (userError && userError.code !== 'PGRST116') {
        console.error('Case notification profile lookup failed');
        return NextResponse.json(
          { ok: false, error: 'Database error' },
          { status: 500, headers: corsHeaders }
        );
      }
      return NextResponse.json(
        { ok: false, error: 'User not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if user has notifications enabled
    const { data: caseData, error: caseError } = await supabase
      .from('case_status')
      .select('notifications_enabled')
      .eq('user_id', user_id)
      .eq('receipt_number', receipt_number.toUpperCase())
      .maybeSingle();

    if (caseError)
      throw new Error('Case notification enrollment lookup failed');
    if (!caseData || !caseData.notifications_enabled) {
      return NextResponse.json(
        { ok: true, message: 'Notifications disabled' },
        { status: 200, headers: corsHeaders }
      );
    }

    // Check if user is premium
    if (resolveActivePlanTier(userData) === 'free') {
      return NextResponse.json(
        { ok: true, message: 'Notifications are a premium feature' },
        { status: 200, headers: corsHeaders }
      );
    }

    // Get user's email from auth.users table
    const { data: authData, error: authError } =
      await supabase.auth.admin.getUserById(user_id);

    if (authError || !authData.user) {
      console.error('Case notification Auth lookup failed');
      return NextResponse.json(
        { ok: false, error: 'Could not fetch user email' },
        { status: 500, headers: corsHeaders }
      );
    }

    const userEmail =
      userData.notification_email?.trim() || authData.user.email;

    if (!userEmail) {
      console.error('User email not found');
      return NextResponse.json(
        { ok: false, error: 'User email not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Revalidate at delivery, after the profile/Auth lookups. A delayed event
    // must not send a case removed since the initial check.
    const deliveryAllowed = async () => {
      const { data, error } = await supabase
        .from('case_status')
        .select('notifications_enabled, current_status')
        .eq('user_id', user_id)
        .eq('receipt_number', receipt_number.toUpperCase())
        .maybeSingle();
      if (error) throw new Error('Case notification delivery lookup failed');
      const { data: profile, error: planError } = await supabase
        .from('profiles')
        .select('premium_status, subscription_expires_at, plan_tier')
        .eq('user_id', user_id)
        .maybeSingle();
      if (planError)
        throw new Error('Case notification plan revalidation failed');
      return Boolean(
        data?.notifications_enabled &&
          data.current_status === new_status &&
          resolveActivePlanTier(profile) !== 'free'
      );
    };
    if (!(await deliveryAllowed())) {
      return NextResponse.json(
        { ok: true, message: 'Tracking removed or notification superseded' },
        { status: 200, headers: corsHeaders }
      );
    }

    // Send email notification via SMTP
    try {
      const info = await transporter.sendMail({
        from: getSmtpFromHeader(),
        to: userEmail,
        subject: `${CASE_STATUS_CHANGE_SUBJECT_PREFIX}${receipt_number}`,
        html: buildCaseStatusChangeEmailHtml({
          name:
            [userData.first_name, userData.last_name]
              .filter(Boolean)
              .join(' ') || 'there',
          receipt_number,
          old_status: old_status ?? null,
          new_status,
        }),
      });

      if (!info.accepted?.length)
        throw new Error('Email provider did not accept the message');

      if (isWebPushConfigured() && (await deliveryAllowed())) {
        const { data: subs, error: pushLookupError } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth')
          .eq('user_id', user_id);

        if (pushLookupError)
          throw new Error('Case notification push lookup failed');
        const pushTitle = 'USCIS case status updated';
        const pushBody = new_status;
        const pushResults = await Promise.allSettled(
          (subs ?? []).map((sub) =>
            sendCaseStatusPush(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              { title: pushTitle, body: pushBody }
            )
          )
        );
        if (pushResults.some((result) => result.status === 'rejected'))
          console.error('Case notification push delivery failed');
      }

      // Log successful email to email_queue for delivery tracking
      const { error: deliveryLogError } = await supabase
        .from('email_queue')
        .insert({
          user_id,
          email_address: userEmail,
          email_type: 'case_status_change',
          email_subject: `TrackMyOPT — USCIS case status update — ${receipt_number}`,
          email_data: { receipt_number, old_status, new_status },
          sent_at: new Date().toISOString(),
          status: 'sent',
          provider_message_id: info.messageId || null,
        });
      if (deliveryLogError)
        console.error('Case notification delivery log failed');

      return NextResponse.json(
        { ok: true, message: 'Notification sent', email_id: info.messageId },
        { status: 200, headers: corsHeaders }
      );
    } catch {
      console.error('Case notification delivery failed');

      // Log failed email to email_queue for debugging/retry
      try {
        const { error: failureLogError } = await supabase
          .from('email_queue')
          .insert({
            user_id,
            email_address: userEmail,
            email_type: 'case_status_change',
            email_subject: `TrackMyOPT — USCIS case status update — ${receipt_number}`,
            email_data: { receipt_number, old_status, new_status },
            status: 'failed',
            error_message: 'Notification delivery failed',
          });
        if (failureLogError)
          console.error('Case notification failure log failed');
      } catch {
        console.error('Case notification failure log failed');
      }

      return NextResponse.json(
        { ok: false, error: 'Failed to send email' },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch {
    console.error('Case notification failed');
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function handleOPTIONS(_req: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export const POST = withSentryApiErrors(
  handlePOST,
  '/api/case-status/notify',
  'POST'
);
export const OPTIONS = withSentryApiErrors(
  handleOPTIONS,
  '/api/case-status/notify',
  'OPTIONS'
);
