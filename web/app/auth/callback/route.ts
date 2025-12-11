import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { subdomainConfig, getPostLoginRedirectUrl, getLoginUrl } from '@/lib/subdomain-config';

export const dynamic = 'force-dynamic';

/**
 * OAuth Callback Route for Web-Only Flows
 * 
 * This route handles Google OAuth callbacks for web users (not extension).
 * It exchanges the OAuth code for a session and redirects to the dashboard subdomain.
 * 
 * Subdomain Architecture:
 * - This callback runs on login.trackmyopt.com
 * - After successful auth, redirects to dashboard.trackmyopt.com
 * - Cookies are set on .trackmyopt.com for cross-subdomain sharing
 * 
 * CRITICAL: Make sure Supabase and Google Console redirect URIs point to:
 * - https://login.trackmyopt.com/auth/callback (production)
 * - http://localhost:3000/auth/callback (development)
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const cookieDomain = subdomainConfig.cookieDomain;
    
    const code = url.searchParams.get('code');
    const next = url.searchParams.get('next') || '/dashboard';
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (!code) {
      console.error('❌ No OAuth code in callback');
      return NextResponse.redirect(getLoginUrl() + '?error=no_code');
    }

    // Create Supabase client with root domain cookie handling
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
              // Set cookie on root domain for cross-subdomain sharing
              const cookieOptions = {
                name,
                value,
                ...options,
                ...(cookieDomain && { domain: cookieDomain }),
              };
              cookieStore.set(cookieOptions);
            } catch (err) {
              console.error('Cookie set error:', err);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              const cookieOptions = {
                name,
                value: '',
                ...options,
                ...(cookieDomain && { domain: cookieDomain }),
              };
              cookieStore.set(cookieOptions);
            } catch (err) {
              console.error('Cookie remove error:', err);
            }
          },
        },
      }
    );

    // Exchange the OAuth code for a session
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('❌ Code exchange failed:', exchangeError);
      return NextResponse.redirect(getLoginUrl() + '?error=exchange_failed');
    }

    if (!sessionData.session || !sessionData.user) {
      console.error('❌ No session or user after code exchange');
      return NextResponse.redirect(getLoginUrl() + '?error=no_session');
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
        
        console.error('❌ Blocked email attempted OAuth login:', userEmail);
        return NextResponse.redirect(
          getLoginUrl() + '?error=This+email+has+been+permanently+blocked.+Previously+deleted+accounts+cannot+be+recreated.'
        );
      }
    }

    // Determine redirect URL
    // If next is a relative path like /dashboard, redirect to dashboard subdomain
    // Otherwise, use the provided URL
    let redirectUrl: string;
    if (next.startsWith('/dashboard') || next === '/dashboard') {
      // Redirect to dashboard subdomain
      redirectUrl = getPostLoginRedirectUrl();
    } else if (next.startsWith('/')) {
      // Other relative paths go to dashboard subdomain with that path
      redirectUrl = subdomainConfig.dashboard + next;
    } else {
      // Absolute URL - use as is
      redirectUrl = next;
    }

    // Redirect to the dashboard subdomain
    const response = NextResponse.redirect(redirectUrl);
    
    // Ensure cookies are set properly and prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    return NextResponse.redirect(getLoginUrl() + '?error=callback_failed');
  }
}
