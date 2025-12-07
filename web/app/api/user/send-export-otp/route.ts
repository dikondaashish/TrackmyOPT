import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { otpStore, cleanupExpiredOtps } from '@/lib/otp-store';

/**
 * POST /api/user/send-export-otp
 * 
 * Send OTP to user's email for ZIP export verification
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is premium from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_status')
      .eq('user_id', user.id)
      .single();

    if (!profile || !profile.premium_status) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in memory with user ID as key
    otpStore.set(user.id, { otp, expiresAt });

    // Clean up expired OTPs
    cleanupExpiredOtps();

    // Also create a signed token as backup (in case serverless function restarts)
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret';
    const tokenData = JSON.stringify({ otp, exp: expiresAt, userId: user.id });
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(tokenData);
    const signature = hmac.digest('hex');
    const otpToken = Buffer.from(tokenData).toString('base64') + '.' + signature;

    // Send OTP email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"TrackMyOPT" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Your Data Export Verification Code - TrackMyOPT',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">TrackMyOPT</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Data Export Verification</h2>
            <p style="color: #4b5563; margin-bottom: 20px;">
              You requested to export your data. Use this code to verify your identity:
            </p>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This code expires in 10 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
          <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} TrackMyOPT. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, otpToken });
  } catch (error) {
    console.error('❌ Error sending export OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
