import { NextRequest, NextResponse, after } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { sanitizeError, secureLog } from '@/lib/secure-logger';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { sendFreeWelcomeEmail } from '@/lib/notifications/transactional/onboarding';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeadersWebAndExtension(req),
  });
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
  const cors = corsHeadersWebAndExtension(request);
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
            } catch {
              // Cookie setting can fail in middleware
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // Cookie removal can fail in middleware
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    
    let userId: string;
    let currentUser = user;
    let dataClient: SupabaseClient = supabase;
    let supabaseAdmin: SupabaseClient | null = null;
    
    if (user) {
      // Session found via cookies (primary method)
      userId = user.id;
    } else {
      // Fallback: Try JWT token from Authorization header (for backwards compatibility)
      const authHeader = request.headers.get('Authorization');
      
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        secureLog.error('/api/me: no session and no Bearer token');
        return NextResponse.json(
          { error: 'Not authenticated', user: null },
          { status: 401, headers: cors }
        );
      }

      const token = authHeader.substring(7);
      const decoded = await verifyToken(token);
      
      if (!decoded) {
        secureLog.error('/api/me: JWT verification failed');
        return NextResponse.json(
          { error: 'Invalid or expired token', user: null },
          { status: 401, headers: cors }
        );
      }

      userId = decoded.userId || decoded.sub;

      // A verified extension JWT identifies the user, but the cookie-backed
      // Supabase client is still anonymous because extension requests omit
      // cookies. Use the service-role client only after verification and keep
      // every data query explicitly scoped to that verified user ID.
      supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data: authUserData, error: authUserError } =
        await supabaseAdmin.auth.admin.getUserById(userId);
      if (authUserError || !authUserData.user) {
        secureLog.error('/api/me: bearer user no longer exists');
        return NextResponse.json(
          { error: 'Invalid or expired token', user: null },
          { status: 401, headers: cors }
        );
      }
      currentUser = authUserData.user;
      dataClient = supabaseAdmin;
      
      // Record extension session (JWT means it's from extension)
      after(async () => {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.trackmyopt.com'}/api/user/sessions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              device_type: 'extension',
              device_info: 'Chrome Extension',
            }),
          });
        } catch {
          // Session telemetry must never prevent the profile response.
        }
      });
    }

    // Query user profile
    // eslint-disable-next-line prefer-const -- `profile` is reassigned below for the create-on-first-login flow
    let { data: profile, error: profileError } = await dataClient
      .from('profiles')
      .select('timezone, is_stem_eligible, degree_level, major_name')
      .eq('user_id', userId)
      .maybeSingle();

    // If profile doesn't exist (new Google OAuth user), create it
    if (!profile && !profileError) {
      
      // Use service role key to bypass RLS for initial profile creation
      const profileWriter = supabaseAdmin ?? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      supabaseAdmin = profileWriter;
      
      const { data: newProfile, error: insertError } = await profileWriter
        .from('profiles')
        .insert({
          user_id: userId,
          timezone: 'America/New_York',
          is_stem_eligible: false,
        })
        .select('timezone, is_stem_eligible, degree_level, major_name')
        .single();
      
      if (insertError && insertError.code !== '23505') {
        console.error('Failed to create profile:', insertError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500, headers: cors }
        );
      }

      // Two tabs (or an extension plus the browser) can perform this lazy
      // first-login creation at the same time. The unique key correctly lets
      // only one insert win; read that winner instead of returning a false 500.
      if (insertError?.code === '23505') {
        const { data: concurrentProfile, error: concurrentProfileError } =
          await profileWriter
            .from('profiles')
            .select('timezone, is_stem_eligible, degree_level, major_name')
            .eq('user_id', userId)
            .maybeSingle();

        if (concurrentProfileError || !concurrentProfile) {
          console.error(
            'Failed to retrieve concurrently created profile:',
            concurrentProfileError,
          );
          return NextResponse.json(
            { error: 'Failed to create user profile' },
            { status: 500, headers: cors },
          );
        }
        profile = concurrentProfile;
      } else {
        profile = newProfile;
      }

      const sessionEmail = currentUser?.email?.trim();
      const meta = currentUser?.user_metadata as { firstName?: string; first_name?: string } | undefined;
      const metaFirst = meta?.firstName || meta?.first_name || null;
      if (sessionEmail && !insertError) {
        // Keep runtime alive until SMTP + email_queue update complete (Vercel / serverless)
        after(async () => {
          try {
            await sendFreeWelcomeEmail({
              supabase: profileWriter,
              userId,
              toEmail: sessionEmail,
              firstName: metaFirst,
            });
          } catch (err) {
            console.error('sendFreeWelcomeEmail (OAuth profile):', err);
          }
        });
      }

    } else if (profileError) {
      console.error('Profile query error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500, headers: cors }
      );
    }

    // Query OPT status
    const { data: status, error: statusError } = await dataClient
      .from('opt_status')
      .select(
        'program_end_date, dso_recommendation_date, opt_ead_end_date, opt_start_date, stem_start_date'
      )
      .eq('user_id', userId)
      .single();

    const { data: employmentSpans, error: spansError } = await dataClient
      .from('employment_spans')
      .select('id, employer_name, start_date, end_date')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (spansError) {
      console.error('Employment spans query error:', spansError);
    }

    // Application profile (autofill data) — non-sensitive; null when not set yet.
    const { data: applicationProfile } = await dataClient
      .from('application_profile')
      .select(
        'first_name, last_name, application_email, phone, country, street_address, city, state, zip_code, county_district, years_experience, linkedin_url, github_url, portfolio_url'
      )
      .eq('user_id', userId)
      .maybeSingle();

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

            if (clampedEnd >= clampedStart) {
              intervals.push([clampedStart.getTime(), clampedEnd.getTime()]);
            }
          });

          if (intervals.length > 0) {
            intervals.sort((a, b) => a[0] - b[0]);
            const merged: Array<[number, number]> = [];

            for (const [start, end] of intervals) {
              const last = merged[merged.length - 1];
              // Merge overlapping or adjacent (within 1 day) intervals.
              if (!last || start > last[1] + MS_PER_DAY) {
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
        return NextResponse.json({
          user: currentUser,
          profile,
          applicationProfile: applicationProfile ?? null,
          optStatus: null,
          employmentSpans: employmentSpans || [],
          unemploymentDays: 0,
        }, { headers: { ...cors, 'Cache-Control': 'no-store' } });
      }

      console.error('OPT status query error:', statusError);
      return NextResponse.json(
        { error: 'Failed to fetch OPT status' },
        { status: 500, headers: cors }
      );
    }

    // Return combined data
    return NextResponse.json({
      user: currentUser,
      profile,
      applicationProfile: applicationProfile ?? null,
      optStatus: status,
      employmentSpans: employmentSpans || [],
      unemploymentDays,
    }, { headers: { ...cors, 'Cache-Control': 'no-store' } });
  } catch (error) {
    secureLog.error('API /me error:', sanitizeError(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: cors }
    );
  }
}
