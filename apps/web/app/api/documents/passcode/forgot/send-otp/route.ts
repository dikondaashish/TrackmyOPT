/**
 * Forgot-passcode OTP issuance (ISS-020).
 *
 * Sends a one-time code to the user's verified email. Unlike the "change"
 * flow, the user does NOT need to know their current passcode. Verifying the
 * code lets them set a brand-new passcode AND wipes the document vault
 * contents because the OLD documents are not recoverable client-side (we use
 * passcode-derived UX gating, not encryption — but the policy stays: forgot
 * = vault reset). The OLD passcode rows + reminders are removed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { getSmtpFromHeader } from '@/lib/notifications/email-smtp';
import { buildForgotVaultPasscodeResetEmail } from '@/lib/notifications/document-expiry-email';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
  return `${maskedLocal}@${domain}`;
}

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Throttle if there's an active locked_until on a reset OTP for this user
    const { data: existing } = await supabase
      .from('passcode_otps')
      .select('locked_until, attempts, purpose')
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing?.locked_until && new Date(existing.locked_until) > new Date()) {
      const minsLeft = Math.ceil((new Date(existing.locked_until).getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${minsLeft} minute(s).` },
        { status: 429 },
      );
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const otpHash = await bcrypt.hash(otp, 10);

    const { error: upsertErr } = await supabase
      .from('passcode_otps')
      .upsert({
        user_id: user.id,
        otp_hash: otpHash,
        new_passcode_hash: null, // we set the new passcode at verify time
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0,
        locked_until: null,
        purpose: 'reset',
      }, { onConflict: 'user_id' });

    if (upsertErr) {
      console.error('forgot/send-otp upsert error:', upsertErr);
      return NextResponse.json({ error: 'Could not start reset flow' }, { status: 500 });
    }

    try {
      await transporter.sendMail({
        from: getSmtpFromHeader(),
        to: user.email,
        subject: 'Reset your Document Vault passcode',
        html: buildForgotVaultPasscodeResetEmail(
          otp,
          user.user_metadata?.full_name || 'there',
        ),
      });
    } catch (mailErr) {
      console.error('forgot/send-otp mail error:', mailErr);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      email: maskEmail(user.email),
      expiresIn: 600,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    console.error('forgot/send-otp:', msg);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
