import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { otpStore } from '@/lib/otpStore';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP (in production, use Redis with TTL)
    otpStore.set(email, otp, 10 * 60 * 1000); // 10 minutes

    // Send OTP via email using Resend
    try {
      const resend = new Resend(process.env.RESEND_API_KEY_ONBOARDING);
      
      await resend.emails.send({
        from: 'TrackMyOPT <noreply@trackmyopt.com>',
        to: email,
        subject: 'Your TrackMyOPT Verification Code',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verification Code</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">TrackMyOPT</h1>
                  <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Your OPT Timeline Companion</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                  <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Email Verification</h2>
                  
                  <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                    Thank you for signing up! To complete your registration, please enter the verification code below:
                  </p>
                  
                  <!-- OTP Code -->
                  <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                    <p style="color: #666; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                    <p style="color: #667eea; margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${otp}
                    </p>
                  </div>
                  
                  <p style="color: #999; font-size: 14px; margin: 20px 0 0 0; line-height: 1.5;">
                    ⏱️ This code will expire in <strong>10 minutes</strong>.<br>
                    🔒 For security reasons, do not share this code with anyone.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                  
                  <p style="color: #999; font-size: 13px; margin: 0; line-height: 1.5;">
                    If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                  <p style="color: #999; font-size: 12px; margin: 0; line-height: 1.5;">
                    © 2025 TrackMyOPT. All rights reserved.<br>
                    <a href="https://trackmyopt.vercel.app" style="color: #667eea; text-decoration: none;">trackmyopt.vercel.app</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log(`OTP sent to ${email}: ${otp}`); // For development/debugging
      
      return NextResponse.json({ ok: true });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Still return success to prevent email enumeration attacks
      // In production, you might want to handle this differently
      return NextResponse.json({ ok: true });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

