import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { safeInternalRedirectTarget } from '@/lib/auth/safe-oauth-redirect';
import { sanitizeError, secureLog } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';

/**
 * OAuth Callback Route for Web-Only Flows
 * 
 * This route handles Google OAuth callbacks for web users (not extension).
 * It exchanges the OAuth code for a session and redirects to the dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const nextRaw = url.searchParams.get('next');


    if (!code) {
      secureLog.warn('No OAuth code in callback (server)');
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
            } catch (_error) {
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (_error) {
            }
          },
        },
      }
    );

    // Exchange the OAuth code for a session
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      secureLog.error('Code exchange failed (server callback):', sanitizeError(exchangeError));
      return NextResponse.redirect(
        new URL(
          `/login?error=exchange_failed`,
          req.url
        )
      );
    }

    if (!sessionData.session || !sessionData.user) {
      secureLog.warn('No session or user after code exchange (server callback)');
      return NextResponse.redirect(
        new URL('/login?error=no_session', req.url)
      );
    }


    // Redirect to the dashboard or specified next page (never external origins)
    const redirectUrl = safeInternalRedirectTarget(nextRaw, req.url);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    secureLog.error('OAuth callback error (server):', sanitizeError(error));
    return NextResponse.redirect(
      new URL(
        `/login?error=callback_failed`,
        req.url
      )
    );
  }
}

