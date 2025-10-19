import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

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
    const access_token = url.searchParams.get('access_token');
    const refresh_token = url.searchParams.get('refresh_token');
    const next = url.searchParams.get('next') || '/dashboard';

    console.log('🔄 OAuth callback for web flow');
    console.log('Code present:', !!code);
    console.log('Access token present:', !!access_token);
    console.log('Refresh token present:', !!refresh_token);
    console.log('Next destination:', next);

    // Check if we have either code (PKCE flow) or tokens (implicit flow)
    if (!code && !access_token) {
      console.error('❌ No OAuth code or tokens in callback');
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

    let sessionData: any;
    let exchangeError: any;

    if (code) {
      // PKCE flow: Exchange the OAuth code for a session
      console.log('🔐 PKCE flow: Exchanging OAuth code for session...');
      const result = await supabase.auth.exchangeCodeForSession(code);
      sessionData = result.data;
      exchangeError = result.error;
    } else if (access_token && refresh_token) {
      // Implicit flow: Set session directly from tokens
      console.log('🔐 Implicit flow: Setting session from tokens...');
      const result = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      sessionData = result.data;
      exchangeError = result.error;
    }

    if (exchangeError) {
      console.error('❌ Session establishment failed:', exchangeError);
      return NextResponse.redirect(
        new URL(
          `/auth/extension?error=session_failed&error_description=${encodeURIComponent(exchangeError.message)}&redirect=/dashboard`,
          req.url
        )
      );
    }

    if (!sessionData.session || !sessionData.user) {
      console.error('❌ No session or user after authentication');
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

