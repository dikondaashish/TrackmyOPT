import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signToken } from '@/lib/jwt';

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

    // Create Supabase client (anon key for OTP verification)
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify OTP using Supabase
    const { data: verifyData, error: verifyError } = await supabaseAnon.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (verifyError) {
      console.error('❌ OTP verification failed:', verifyError);
      return NextResponse.json(
        { ok: false, error: verifyError.message || 'Invalid verification code' },
        { status: 400 }
      );
    }

    console.log('✅ OTP verified successfully');

    // OTP is valid, now create the user account with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user already exists (from OTP verification)
    let userId = verifyData.user?.id;

    if (!userId) {
      // Create user account if not created by OTP verification
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
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

      userId = signUpData.user.id;
    } else {
      // User was created by OTP, update password and metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          password,
          user_metadata: { firstName, lastName },
        }
      );

      if (updateError) {
        console.error('Update user error:', updateError);
        return NextResponse.json(
          { ok: false, error: 'Failed to update user information' },
          { status: 400 }
        );
      }
    }

    // Create user profile
    await supabaseAdmin.from('profiles').upsert({
      user_id: userId,
      timezone: 'America/New_York',
      is_stem_eligible: false, // Default, can be updated later
    });

    console.log('✅ User account created:', userId);

    // Generate JWT token for extension authentication
    const jwt = await signToken({ userId, email }, '10m');

    return NextResponse.json({ ok: true, token: jwt });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { ok: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

