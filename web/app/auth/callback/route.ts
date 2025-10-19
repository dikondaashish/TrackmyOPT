import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

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
    console.log('🚀 OAUTH CALLBACK ROUTE HIT');
    const url = new URL(req.url);
    console.log('Full URL:', url.toString());
    
    const code = url.searchParams.get('code');
    const next = url.searchParams.get('next') || '/dashboard';
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    console.log('📋 Callback Parameters:');
    console.log('  - code:', code ? `${code.substring(0, 20)}...` : 'MISSING');
    console.log('  - next:', next);
    console.log('  - error:', error || 'none');
    console.log('  - error_description:', errorDescription || 'none');

    if (!code) {
      console.error('❌ No OAuth code in callback');
      return NextResponse.redirect(
        new URL('/auth/extension?error=no_code&redirect=/dashboard', req.url)
      );
    }

    // Create Supabase client with proper cookie handling
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
              console.warn('Cookie set error:', error);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              console.warn('Cookie remove error:', error);
            }
          },
        },
      }
    );

    // Exchange the OAuth code for a session
    console.log('🔐 Exchanging OAuth code for session...');
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('❌ Code exchange failed:', exchangeError);
      return NextResponse.redirect(
        new URL(
          `/auth/extension?error=exchange_failed&error_description=${encodeURIComponent(exchangeError.message)}&redirect=/dashboard`,
          req.url
        )
      );
    }

    if (!sessionData.session || !sessionData.user) {
      console.error('❌ No session or user after code exchange');
      return NextResponse.redirect(
        new URL('/auth/extension?error=no_session&redirect=/dashboard', req.url)
      );
    }

    console.log('✅ OAuth session established for user:', sessionData.user.id);
    console.log('📧 User email:', sessionData.user.email);

    // Redirect to the dashboard or specified next page
    const redirectUrl = new URL(next, req.url);
    console.log('↗️ Redirecting to:', redirectUrl.toString());

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/auth/extension?error=callback_failed&error_description=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}&redirect=/dashboard`,
        req.url
      )
    );
  }
}
