import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

/**
 * Server-side OAuth callback route for web flows
 * 
 * This route handles tokens from the implicit OAuth flow.
 * It creates a Supabase session and redirects to the dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const access_token = url.searchParams.get('access_token');
    const refresh_token = url.searchParams.get('refresh_token');
    const expires_at = url.searchParams.get('expires_at');
    const token_type = url.searchParams.get('token_type');
    const next = url.searchParams.get('next') || '/dashboard';

    console.log('🔄 Server OAuth callback for web flow');
    console.log('Access token present:', !!access_token);
    console.log('Refresh token present:', !!refresh_token);
    console.log('Next destination:', next);

    if (!access_token || !refresh_token) {
      console.error('❌ Missing required tokens');
      return NextResponse.redirect(
        new URL('/auth/extension?error=missing_tokens&redirect=/dashboard', req.url)
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

    // Create session from tokens
    console.log('🔐 Creating session from tokens...');
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError) {
      console.error('❌ Session creation failed:', sessionError);
      return NextResponse.redirect(
        new URL(
          `/auth/extension?error=session_failed&error_description=${encodeURIComponent(sessionError.message)}&redirect=/dashboard`,
          req.url
        )
      );
    }

    if (!sessionData.session || !sessionData.user) {
      console.error('❌ No session or user after token exchange');
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
    console.error('❌ Server OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/auth/extension?error=callback_failed&error_description=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}&redirect=/dashboard`,
        req.url
      )
    );
  }
}
