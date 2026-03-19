import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { sanitizeError } from '@/lib/secure-logger';

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

function toDayStart(value: string | Date): Date | null {
  if (value instanceof Date) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  const str = String(value).trim();
  if (!str) return null;

  // MM/DD/YYYY
  const mmddyyyy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    const month = Number(mmddyyyy[1]) - 1;
    const day = Number(mmddyyyy[2]);
    const year = Number(mmddyyyy[3]);
    const parsed = new Date(year, month, day);
    if (Number.isNaN(parsed.getTime())) return null;
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  // YYYY-MM-DD (or date-like prefix)
  const yyyymmdd = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (yyyymmdd) {
    const year = Number(yyyymmdd[1]);
    const month = Number(yyyymmdd[2]) - 1;
    const day = Number(yyyymmdd[3]);
    const parsed = new Date(year, month, day);
    if (Number.isNaN(parsed.getTime())) return null;
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    
    // First, try to get user from Supabase session cookies (primary method)
    const cookieStore = await cookies();
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
    } else {
      // Fallback: Try JWT token from Authorization header (for backwards compatibility)
      const authHeader = request.headers.get('Authorization');
      
      
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
      
      // Record extension session (JWT means it's from extension)
      // Fire and forget - don't await
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://trackmyopt.com'}/api/user/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          device_type: 'extension',
          device_info: 'Chrome Extension',
        }),
      }).catch(() => {}); // Silently fail
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

    // Query employment spans
    const { data: employmentSpans } = await supabase
      .from('employment_spans')
      .select('id, employer_name, start_date, end_date, is_current, job_title, location')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    // Calculate unemployment days if we have OPT status
    // Uses merged employment intervals to avoid overlap/double-count issues.
    let unemploymentDays = 0;
    if (status?.opt_start_date) {
      const MS_PER_DAY = 1000 * 60 * 60 * 24;
      const today = toDayStart(new Date())!;
      const optStart = toDayStart(status.opt_start_date);
      const optEnd = status.opt_ead_end_date ? toDayStart(status.opt_ead_end_date) : today;

      if (optStart && optEnd) {
        const effectiveEnd = optEnd < today ? optEnd : today;
        const totalDays = Math.max(
          0,
          Math.ceil((effectiveEnd.getTime() - optStart.getTime()) / MS_PER_DAY)
        );

        let employedDays = 0;
        if (employmentSpans && employmentSpans.length > 0) {
          const intervals: Array<[number, number]> = [];

          employmentSpans.forEach((span: { start_date: string; end_date: string | null }) => {
            const start = toDayStart(span.start_date);
            const end = span.end_date ? toDayStart(span.end_date) : today;
            if (!start || !end) return;

            const clampedStart = start > optStart ? start : optStart;
            const clampedEnd = end < effectiveEnd ? end : effectiveEnd;

            if (clampedEnd > clampedStart) {
              intervals.push([clampedStart.getTime(), clampedEnd.getTime()]);
            }
          });

          if (intervals.length > 0) {
            intervals.sort((a, b) => a[0] - b[0]);
            const merged: Array<[number, number]> = [];

            for (const [start, end] of intervals) {
              const last = merged[merged.length - 1];
              if (!last || start > last[1]) {
                merged.push([start, end]);
              } else {
                last[1] = Math.max(last[1], end);
              }
            }

            employedDays = merged.reduce(
              (sum, [start, end]) => sum + Math.ceil((end - start) / MS_PER_DAY),
              0
            );
          }
        }

        unemploymentDays = Math.max(0, totalDays - employedDays);
      }
    }

    if (statusError) {
      // OPT status might not exist yet for new users
      if (statusError.code === 'PGRST116') {
        // Get user data from Supabase
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        return NextResponse.json({
          user: currentUser,
          profile,
          optStatus: null,
          employmentSpans: employmentSpans || [],
          unemploymentDays: 0,
        }, { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } });
      }

      console.error('OPT status query error:', statusError);
      return NextResponse.json(
        { error: 'Failed to fetch OPT status' },
        { status: 500 }
      );
    }

    // Get user data from Supabase
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // Return combined data
    return NextResponse.json({
      user: currentUser,
      profile,
      optStatus: status,
      employmentSpans: employmentSpans || [],
      unemploymentDays,
    }, { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('API /me error:', sanitizeError(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

