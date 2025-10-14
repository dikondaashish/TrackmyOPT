import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName } = await req.json();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Send OTP using Supabase's built-in functionality
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // Store user metadata for later use when verifying
        data: {
          firstName: firstName || '',
          lastName: lastName || '',
        },
        // Don't create session yet - we'll do that after OTP verification
        shouldCreateUser: false,
      },
    });

    if (error) {
      console.error('❌ Failed to send OTP:', error);
      return NextResponse.json(
        { ok: false, error: error.message || 'Failed to send verification code' },
        { status: 400 }
      );
    }

    console.log('✅ OTP sent successfully via Supabase to:', email);
    console.log('📧 Using Supabase SMTP (Hostinger)');

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

