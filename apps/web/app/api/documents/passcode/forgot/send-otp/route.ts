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

export async function POST(req: NextRequest) {
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
        from: `TrackMyOPT <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
        to: user.email,
        subject: '🔑 Reset your Document Vault passcode',
        html: `
<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h1 style="font-size:20px;">Reset your Document Vault passcode</h1>
  <p>You requested to reset your passcode. Enter this code in TrackMyOPT to set a new one:</p>
  <div style="font-size:36px;letter-spacing:8px;font-weight:800;text-align:center;padding:18px;background:#f3f4f6;border-radius:12px;margin:16px 0;">${otp}</div>
  <p style="font-size:13px;color:#6b7280;">
    This code expires in 10 minutes. <strong>For your safety, completing this reset will remove all documents currently in your vault.</strong> You can re-upload them after setting your new passcode.
  </p>
  <p style="font-size:12px;color:#9ca3af;">If you did not request this, you can ignore this email.</p>
</div>`,
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
