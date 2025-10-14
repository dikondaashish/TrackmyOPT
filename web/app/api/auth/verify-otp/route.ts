import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signToken } from '@/lib/jwt';
import { otpStore } from '@/lib/otpStore';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, firstName, lastName, password } = await req.json();

    // Validate required fields
    if (!email || !otp || !firstName || !lastName || !password) {
      return NextResponse.json(
        { ok: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Get stored OTP
    const storedOTP = otpStore.get(email);

    if (!storedOTP) {
      return NextResponse.json(
        { ok: false, error: 'Verification code not found or expired' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedOTP.code !== otp) {
      return NextResponse.json(
        { ok: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // OTP is valid, delete it
    otpStore.delete(email);

    // Create user account
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Email is already verified via OTP
      user_metadata: { firstName, lastName },
    });

    if (signUpError || !signUpData.user) {
      console.error('Signup error:', signUpError);
      return NextResponse.json(
        {
          ok: false,
          error: signUpError?.message ?? 'Account creation failed',
        },
        { status: 400 }
      );
    }

    const uid = signUpData.user.id;

    // Create user profile
    await supabase.from('profiles').upsert({
      user_id: uid,
      timezone: 'America/New_York',
      is_stem_eligible: false, // Default, can be updated later
    });

    // Generate JWT token for extension authentication
    const jwt = await signToken({ userId: uid, email: email }, '10m');

    return NextResponse.json({ ok: true, token: jwt });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { ok: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

