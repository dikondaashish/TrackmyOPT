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
        subject: '🔐 Your OTP for Passcode Change - TrackMyOPT',
        html: generateOTPEmailHTML(otp, user.user_metadata?.full_name || 'there'),
      });

      console.log('OTP sent to:', userEmail);
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

// Generate OTP email HTML
function generateOTPEmailHTML(otp: string, name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 28px;">🔐</span>
            </div>
            <h1 style="margin: 0; color: #1f2937; font-size: 24px; font-weight: 700;">
              Passcode Change Verification
            </h1>
          </div>
          
          <!-- Message -->
          <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
            Hi ${name}, use the code below to verify your passcode change request.
          </p>
          
          <!-- OTP Code -->
          <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; padding: 24px; margin-bottom: 30px;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
              Your OTP Code
            </p>
            <div style="font-size: 36px; font-weight: 800; color: #1f2937; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <!-- Warning -->
          <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: left;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              ⚠️ <strong>This code expires in 10 minutes.</strong> Do not share this code with anyone. TrackMyOPT will never ask for your OTP.
            </p>
          </div>
          
          <!-- Footer -->
          <p style="margin: 0; color: #9ca3af; font-size: 13px;">
            If you didn't request this change, please ignore this email or contact support.
          </p>
          
        </div>
        
        <!-- Bottom Footer -->
        <p style="margin: 24px 0 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} TrackMyOPT. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}
