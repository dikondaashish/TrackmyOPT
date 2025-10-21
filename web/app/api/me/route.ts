import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 /api/me - Checking authentication...');
    
    // First, try to get user from Supabase session cookies (primary method)
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
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Cookie setting can fail in middleware
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Cookie removal can fail in middleware
            }
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    let userId: string;
    
    if (user) {
      // Session found via cookies (primary method)
      userId = user.id;
      console.log('✅ /api/me - User authenticated via session cookies:', user.email);
    } else {
      // Fallback: Try JWT token from Authorization header (for backwards compatibility)
      const authHeader = request.headers.get('Authorization');
      
      console.log('/api/me - No session cookies, trying JWT. Auth header:', authHeader ? 'present' : 'missing');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('❌ /api/me - No session cookies and no JWT token');
        return NextResponse.json(
          { error: 'Not authenticated', user: null },
          { status: 401, headers: corsHeaders }
        );
      }

      const token = authHeader.substring(7);
      const decoded = await verifyToken(token);
      
      if (!decoded) {
        console.error('❌ /api/me - JWT token verification failed');
        return NextResponse.json(
          { error: 'Invalid or expired token', user: null },
          { status: 401, headers: corsHeaders }
        );
      }

      userId = decoded.userId || decoded.sub;
      console.log('✅ /api/me - User authenticated via JWT token');
    }

    // Supabase client already created above for user authentication

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
        console.log('⚠️ /api/me - No OPT status found for user, returning with user:', user?.email);
        return NextResponse.json({
          user: user,  // Include user object!
          profile,
          status: null,
        }, { headers: corsHeaders });
      }

      console.error('OPT status query error:', statusError);
      return NextResponse.json(
        { error: 'Failed to fetch OPT status' },
        { status: 500 }
      );
    }

    // Get user data from Supabase
    let currentUser = null;
    if (user) {
      // If we already have user from session cookies (primary method)
      currentUser = user;
      console.log('✅ /api/me - Using user from session:', user.email);
    } else {
      // Fallback: try to get user again
      const { data: { user: fetchedUser } } = await supabase.auth.getUser();
      currentUser = fetchedUser;
      console.log('✅ /api/me - Fetched user:', fetchedUser?.email);
    }

    console.log('📤 /api/me - Returning response with user:', currentUser?.email);

    // Return combined data
    return NextResponse.json({
      user: currentUser,
      profile,
      status,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('API /me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

