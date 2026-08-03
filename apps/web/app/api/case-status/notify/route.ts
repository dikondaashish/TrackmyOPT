import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import {
  buildCaseStatusChangeEmailHtml,
  CASE_STATUS_CHANGE_SUBJECT_PREFIX,
} from '@/lib/notifications/case-status-email';
import { getSmtpFromHeader } from '@/lib/notifications/email-smtp';
import { isWebPushConfigured, sendCaseStatusPush } from '@/lib/notifications/web-push';

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
  secure: true,
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
export async function POST(req: NextRequest) {
  try {
    // Verify internal request via shared secret (not spoofable header)
    const internalSecret = req.headers.get('X-Internal-Secret');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || internalSecret !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { user_id, receipt_number, old_status, new_status } = body;

    if (!user_id || !receipt_number || !new_status) {
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
      .select('email, first_name, last_name, premium_status')
      .eq('user_id', user_id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user:', userError);
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

    if (caseError || !caseData || !caseData.notifications_enabled) {
      return NextResponse.json(
        { ok: true, message: 'Notifications disabled' },
        { status: 200, headers: corsHeaders }
      );
    }

    // Check if user is premium
    if (!userData.premium_status) {
      return NextResponse.json(
        { ok: true, message: 'Notifications are a premium feature' },
        { status: 200, headers: corsHeaders }
      );
    }

    // Get user's email from auth.users table
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(user_id);

    if (authError || !authData.user) {
      console.error('Error fetching auth user:', authError);
      return NextResponse.json(
        { ok: false, error: 'Could not fetch user email' },
        { status: 500, headers: corsHeaders }
      );
    }

    const userEmail = authData.user.email;

    if (!userEmail) {
      console.error('User email not found');
      return NextResponse.json(
        { ok: false, error: 'User email not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Send email notification via SMTP
    try {
      const info = await transporter.sendMail({
        from: getSmtpFromHeader(),
        to: userEmail,
        subject: `${CASE_STATUS_CHANGE_SUBJECT_PREFIX}${receipt_number}`,
        html: buildCaseStatusChangeEmailHtml({
          name: [userData.first_name, userData.last_name].filter(Boolean).join(' ') || 'there',
          receipt_number,
          old_status: old_status ?? null,
          new_status,
        }),
      });

      console.log('Email sent:', info.messageId);

      if (isWebPushConfigured()) {
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth')
          .eq('user_id', user_id);

        const pushTitle = 'USCIS case status updated';
        const pushBody = new_status;
        await Promise.allSettled(
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
      }

      // Log successful email to email_queue for delivery tracking
      await supabase.from('email_queue').insert({
        user_id,
        email_address: userEmail,
        email_type: 'case_status_change',
        email_subject: `TrackMyOPT — USCIS case status update — ${receipt_number}`,
        email_data: { receipt_number, old_status, new_status },
        sent_at: new Date().toISOString(),
        status: 'sent',
        provider_message_id: info.messageId || null,
      });

      return NextResponse.json(
        { ok: true, message: 'Notification sent', email_id: info.messageId },
        { status: 200, headers: corsHeaders }
      );
    } catch (emailError) {
      console.error('Error sending email:', emailError);

      // Log failed email to email_queue for debugging/retry
      try {
        await supabase.from('email_queue').insert({
          user_id,
          email_address: userEmail,
          email_type: 'case_status_change',
          email_subject: `TrackMyOPT — USCIS case status update — ${receipt_number}`,
          email_data: { receipt_number, old_status, new_status },
          status: 'failed',
          error_message: emailError instanceof Error ? emailError.message : 'Unknown error',
        });
      } catch (logErr) {
        console.error('Failed to log email to queue:', logErr);
      }

      return NextResponse.json(
        { ok: false, error: 'Failed to send email' },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/case-status/notify:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(_req: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

