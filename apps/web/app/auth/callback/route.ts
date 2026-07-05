import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { captureServerEvent, identifyServerUser } from '@/lib/posthog-server';
import { safeInternalRedirectTarget } from '@/lib/auth/safe-oauth-redirect';
import { sanitizeError, secureLog, logIdPrefix } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';

/**
 * OAuth Callback Route for Web-Only Flows
 * 
 * This route handles Google OAuth callbacks for web users (not extension).
 * It exchanges the OAuth code for a session and redirects to the dashboard.
 * 
 * CRITICAL: This route is at /auth/callback (not /auth/callback/server)
 * Make sure Supabase and Google Console redirect URIs point to this exact path.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const code = url.searchParams.get('code');
    const nextRaw = url.searchParams.get('next');


    if (!code) {
      secureLog.warn('No OAuth code in callback');
      return NextResponse.redirect(
        new URL('/login?error=no_code', req.url)
      );
    }

    // Create Supabase client with proper cookie handling
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
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
            }
          },
        },
      }
    );

    // Exchange the OAuth code for a session
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      secureLog.error('Code exchange failed:', sanitizeError(exchangeError));
      return NextResponse.redirect(
        new URL(
          `/login?error=exchange_failed`,
          req.url
        )
      );
    }

    if (!sessionData.session || !sessionData.user) {
      secureLog.warn('No session or user after code exchange');
      return NextResponse.redirect(
        new URL('/login?error=no_session', req.url)
      );
    }

    // Check if this email is blocked (previously deleted account)
    const userEmail = sessionData.user.email;
    if (userEmail) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: blockedData } = await supabaseAdmin
        .from('blocked_emails')
        .select('email')
        .eq('email', userEmail.toLowerCase())
        .single();

      if (blockedData) {
        // Sign out the user immediately
        await supabase.auth.signOut();

        // Delete the newly created user since they're blocked
        await supabaseAdmin.auth.admin.deleteUser(sessionData.user.id);

        secureLog.warn('Blocked email attempted OAuth login', { user: logIdPrefix(sessionData.user.id) });
        return NextResponse.redirect(
          new URL('/login?error=This+email+has+been+permanently+blocked.+Previously+deleted+accounts+cannot+be+recreated.', req.url)
        );
      }
    }

    // --- Referral Attribution for Google OAuth ---
    // The referral code is passed through the OAuth redirect URL as ?ref=code
    const refCode = url.searchParams.get('ref');
    if (refCode && sessionData.user) {
      const sanitizedRef = refCode.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
      if (sanitizedRef) {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Check if this user already has a referral attribution
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('referred_by')
          .eq('user_id', sessionData.user.id)
          .single();

        if (!profile?.referred_by) {
          // Verify the referral code exists and is active
          const { data: referral } = await supabaseAdmin
            .from('referrals')
            .select('code')
            .eq('code', sanitizedRef)
            .eq('is_active', true)
            .single();

          if (referral) {
            // Attribute the referral
            await supabaseAdmin
              .from('profiles')
              .update({ referred_by: sanitizedRef })
              .eq('user_id', sessionData.user.id);

            // Increment signup counter
            await supabaseAdmin.rpc('increment_referral_signups', { ref_code: sanitizedRef });
          }
        }
      }
    }

    // Track sign-in / sign-up with PostHog
    const userId = sessionData.user.id;
    const isNewUser =
      sessionData.user.created_at &&
      Date.now() - new Date(sessionData.user.created_at).getTime() < 10_000;

    const authProvider = sessionData.user.app_metadata?.provider ?? 'oauth';
    const referredBy = url.searchParams.get('ref') ?? undefined;

    await identifyServerUser(userId, {
      provider: authProvider,
      signup_date: sessionData.user.created_at?.slice(0, 10),
      plan_tier: "free",
      premium_status: false,
      onboarding_completed: false,
      ...(isNewUser ? { activation_state: "onboarding_incomplete" } : {}),
    });

    if (isNewUser) {
      await captureServerEvent(userId, 'user_signed_up', {
        provider: authProvider,
        ...(referredBy ? { referred_by: referredBy } : {}),
      });
    } else {
      await captureServerEvent(userId, 'user_signed_in', {
        provider: authProvider,
      });
    }

    // Redirect to the dashboard or specified next page (never external origins)
    const redirectUrl = safeInternalRedirectTarget(nextRaw, req.url);

    // Add a small delay to ensure cookies are set before redirect
    // Redirect to the dashboard or specified URL
    const response = NextResponse.redirect(redirectUrl);

    // Ensure cookies are set properly
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    return response;
  } catch (error) {
    secureLog.error('OAuth callback error:', sanitizeError(error));
    return NextResponse.redirect(
      new URL(
        `/login?error=callback_failed`,
        req.url
      )
    );
  }
}
