import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendExportOtpEmail } from '@/lib/notifications/email-service';

/**
 * POST /api/user/send-export-otp
 * 
 * Send OTP to user's email for ZIP export verification
 * Uses the centralized email service with proper SMTP configuration
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.email) {
      return NextResponse.json({ error: 'No email address found' }, { status: 400 });
    }

    // Check if user is premium from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_status, first_name')
      .eq('user_id', user.id)
      .single();

    if (!profile || !profile.premium_status) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const { error: upsertError } = await supabase
      .from('export_otps')
      .upsert({
        user_id: user.id,
        otp_hash: otp,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('❌ Error storing OTP:', upsertError);
      return NextResponse.json({ error: 'Failed to store verification code' }, { status: 500 });
    }

    // Send OTP email using centralized email service
    const emailResult = await sendExportOtpEmail(
      user.email,
      otp,
      profile.first_name || undefined
    );

    if (!emailResult.success) {
      console.error('❌ Email sending failed:', emailResult.error);
      return NextResponse.json({ 
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('❌ Error sending export OTP:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
