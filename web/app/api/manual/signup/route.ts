import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { mmddyyyyToISO } from '@/lib/date';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      programEnd,
      dsoReco,
      optEadEnd,
      optStart,
      stemStart,
      isStem,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!programEnd || !optEadEnd || !optStart) {
      return NextResponse.json(
        { ok: false, error: 'Missing required OPT dates' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Step 1: Sign up user with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
        },
      },
    });

    // Step 2: If error, return error
    if (signUpError) {
      console.error('Sign up error:', signUpError);
      return NextResponse.json(
        { ok: false, error: signUpError.message },
        { status: 400 }
      );
    }

    // Step 3: Get user id from response
    if (!data.user) {
      return NextResponse.json(
        { ok: false, error: 'User creation failed' },
        { status: 500 }
      );
    }

    const userId = data.user.id;

    // Step 4: Insert into profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: userId,
      timezone: 'America/New_York',
      is_stem_eligible: !!isStem,
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { ok: false, error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    // Step 5: Insert into opt_status with parsed dates
    const { error: optError } = await supabase.from('opt_status').insert({
      user_id: userId,
      program_end_date: mmddyyyyToISO(programEnd),
      dso_recommendation_date: dsoReco ? mmddyyyyToISO(dsoReco) : null,
      opt_ead_end_date: mmddyyyyToISO(optEadEnd),
      opt_start_date: mmddyyyyToISO(optStart),
      stem_start_date: stemStart ? mmddyyyyToISO(stemStart) : null,
    });

    if (optError) {
      console.error('OPT status creation error:', optError);
      return NextResponse.json(
        { ok: false, error: 'Failed to save OPT information' },
        { status: 500 }
      );
    }

    // Step 6: Return success
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Manual signup error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

