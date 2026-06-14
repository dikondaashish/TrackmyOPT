/**
 * Passcode Change OTP API
 * 
 * POST /api/documents/passcode/send-otp
 * Body: { currentPasscode?: "123456", newPasscode: "654321" }
 * 
 * Validates passcode change request and sends OTP to user's email
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPasscode, isValidPasscode, hashPasscode } from '@/lib/auth/passcode';
import nodemailer from 'nodemailer';
import { getSmtpFromHeader } from '@/lib/notifications/email-smtp';
import { buildPasscodeChangeOtpEmailHtml } from '@/lib/notifications/document-expiry-email';
import { secureLog } from '@/lib/secure-logger';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';

// Create a rate limiter that allows 3 requests per 10 minutes per IP
const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN 
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, '10 m'),
      analytics: true,
    }) 
  : null;

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // IP-based Rate Limiting for OTPs
    if (ratelimit) {
      const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
      const { success, limit, remaining, reset } = await ratelimit.limit(`ratelimit_otp_${ip}`);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Too many OTP requests. Please try again after 10 minutes.' },
          { 
            status: 429, 
            headers: { 
              'X-RateLimit-Limit': limit.toString(), 
              'X-RateLimit-Remaining': remaining.toString(), 
              'X-RateLimit-Reset': reset.toString() 
            } 
          }
        );
      }
    }

    const body = await request.json();
    const { currentPasscode, newPasscode } = body;

    // Validate new passcode format
    if (!isValidPasscode(newPasscode)) {
      return NextResponse.json(
        { error: 'Invalid passcode. Must be exactly 6 digits.' },
        { status: 400 }
      );
    }

    // Check if passcode already exists
    const { data: existing } = await supabase
      .from('document_passcodes')
      .select('id, passcode_hash')
      .eq('user_id', user.id)
      .single();

    // If passcode exists, verify current passcode first
    if (existing && existing.passcode_hash) {
      if (!currentPasscode) {
        return NextResponse.json(
          { error: 'Current passcode is required' },
          { status: 400 }
        );
      }

      const isValid = await verifyPasscode(currentPasscode, existing.passcode_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current passcode is incorrect' },
          { status: 400 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    // ISS-033: hash the OTP and the proposed new passcode at issuance.
    // Plaintext OTPs in the DB were vulnerable to read-only DB compromise.
    const otpHash = await bcrypt.hash(otp, 10);
    const newPasscodeHash = await hashPasscode(newPasscode);

    const { error: otpError } = await supabase
      .from('passcode_otps')
      .upsert({
        user_id: user.id,
        otp_hash: otpHash,
        new_passcode_hash: newPasscodeHash,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0,
        locked_until: null,
        purpose: 'change',
      }, {
        onConflict: 'user_id'
      });

    if (otpError) {
      console.error('OTP storage error:', otpError);
      // If table doesn't exist, create it
      if (otpError.code === '42P01') {
        // Table doesn't exist - we'll handle this gracefully
        console.log('passcode_otps table may not exist');
      }
    }

    // Get user email
    const userEmail = user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Send OTP email
    try {
      await transporter.sendMail({
        from: getSmtpFromHeader(),
        to: userEmail,
        subject: 'Your OTP for Passcode Change - TrackMyOPT',
        html: buildPasscodeChangeOtpEmailHtml(otp, user.user_metadata?.full_name || 'there'),
      });

      secureLog.log('OTP sent for passcode change');
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      email: maskEmail(userEmail),
      expiresIn: 600, // 10 minutes in seconds
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

// Mask email for privacy
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
  return `${maskedLocal}@${domain}`;
}
