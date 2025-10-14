import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { signToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { searchParams } = url;
    const redirect_uri = searchParams.get("redirect_uri");
    const state = searchParams.get("state");
    const code = searchParams.get("code"); // OAuth code from Supabase (PKCE flow)
    
    // For implicit flow, tokens come in the hash (which we can't read server-side)
    // So we need to handle this client-side, or use access_token from query if available
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");

    console.log('Callback params:', { 
      redirect_uri, 
      state, 
      hasCode: !!code,
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token
    });

    if (!redirect_uri || !state) {
      return new NextResponse("Missing redirect_uri or state", { status: 400 });
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
              // Ignore cookie errors in this context
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Ignore cookie errors in this context
            }
          },
        },
      }
    );

    let user = null;
    
    // Handle PKCE flow (code in query params)
    if (code) {
      console.log('PKCE flow: Exchanging code for session, code length:', code.length);
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.error('Code exchange error:', {
          message: exchangeError.message,
          status: exchangeError.status,
          name: exchangeError.name,
        });
        return NextResponse.redirect(
          new URL(
            `/auth/extension?error=code_exchange_failed&error_description=${encodeURIComponent(exchangeError.message)}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${encodeURIComponent(state)}`, 
            req.url
          )
        );
      }
      console.log('Code exchange successful, user:', sessionData?.user?.id);
      user = sessionData?.user || null;
    }
    
    // Handle implicit flow (tokens in query params - moved from hash by client)
    else if (access_token && refresh_token) {
      console.log('Implicit flow: Setting session from access token');
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (sessionError) {
        console.error('Session error:', sessionError);
        return NextResponse.redirect(
          new URL(
            `/auth/extension?error=session_failed&error_description=${encodeURIComponent(sessionError.message)}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${encodeURIComponent(state)}`,
            req.url
          )
        );
      }
      console.log('Session set successfully, user:', sessionData?.user?.id);
      user = sessionData?.user || null;
    }
    
    // If no code or tokens, try to get user from existing session
    else {
      const { data: { user: existingUser }, error: userError } = await supabase.auth.getUser();
      console.log('No code/tokens, checking existing session. User:', existingUser ? existingUser.id : 'none');
      user = existingUser;
    }
    
    if (!user) {
      console.error('No user found in callback, redirecting back to auth');
      return NextResponse.redirect(
        new URL(
          `/auth/extension?error=not_signed_in&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${encodeURIComponent(state)}`, 
          req.url
        )
      );
    }
    
    console.log('Callback - User authenticated:', user.id);

    // Create JWT token using the signToken helper (includes issuer and audience)
    const jwt = await signToken(
      { userId: user.id, email: user.email || '' },
      '10m'
    );

        console.log('Generated JWT for user:', user.id);

        // Redirect to intermediate completing page with dashboard redirect
        const completingUrl = new URL('/auth/completing', req.url);
        completingUrl.searchParams.set('token', jwt);
        completingUrl.searchParams.set('state', state);
        completingUrl.searchParams.set('redirect_uri', redirect_uri);
        completingUrl.searchParams.set('redirect', '/dashboard'); // Add dashboard redirect
        
        return NextResponse.redirect(completingUrl);
    
  } catch (error) {
    console.error('Callback error:', error);
    return new NextResponse(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      { status: 500 }
    );
  }
}
