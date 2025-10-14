import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    console.log('/api/me - Authorization header:', authHeader ? `Bearer ${authHeader.substring(7, 30)}...` : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('/api/me - Missing or invalid Authorization header');
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = await verifyToken(token);
    
    console.log('/api/me - Token decoded:', decoded ? `user: ${decoded.sub}` : 'null');
    
    if (!decoded) {
      console.error('/api/me - Token verification failed');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId || decoded.sub;
    console.log('/api/me - userId:', userId);

    // Create Supabase client for server-side queries
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

    // Query user profile
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('timezone, is_stem_eligible')
      .eq('user_id', userId)
      .single();

    // If profile doesn't exist (new Google OAuth user), create it
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Creating new profile for user:', userId);
      
      // Use service role key to bypass RLS for initial profile creation
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          timezone: 'America/New_York',
          is_stem_eligible: false,
        })
        .select('timezone, is_stem_eligible')
        .single();
      
      if (insertError) {
        console.error('Failed to create profile:', insertError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }
      
      profile = newProfile;
    } else if (profileError) {
      console.error('Profile query error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Query OPT status
    const { data: status, error: statusError } = await supabase
      .from('opt_status')
      .select(
        'program_end_date, dso_recommendation_date, opt_ead_end_date, opt_start_date, stem_start_date'
      )
      .eq('user_id', userId)
      .single();

    if (statusError) {
      // OPT status might not exist yet for new users
      if (statusError.code === 'PGRST116') {
        return NextResponse.json({
          profile,
          status: null,
        });
      }

      console.error('OPT status query error:', statusError);
      return NextResponse.json(
        { error: 'Failed to fetch OPT status' },
        { status: 500 }
      );
    }

    // Return combined data
    return NextResponse.json({
      profile,
      status,
    });
  } catch (error) {
    console.error('API /me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

