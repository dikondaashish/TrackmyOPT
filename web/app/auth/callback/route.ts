import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/dashboard';
  
  try {
    
    console.log('General auth callback:', { 
      hasCode: !!code,
      redirect: redirect
    });

    if (!code) {
      console.error('No code provided in callback');
      return NextResponse.redirect(new URL('/auth/extension?error=no_code', req.url));
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
              console.error('Cookie set error:', error);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              console.error('Cookie remove error:', error);
            }
          },
        },
      }
    );

    // Exchange code for session
    console.log('Exchanging code for session, code length:', code.length);
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Code exchange error:', {
        message: exchangeError.message,
        status: exchangeError.status,
        name: exchangeError.name,
      });
      return NextResponse.redirect(
        new URL(`/auth/extension?error=code_exchange_failed&redirect=${encodeURIComponent(redirect)}`, req.url)
      );
    }
    
    console.log('Code exchange successful, user:', sessionData?.user?.id);

    // Get the user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('General callback - User:', user ? user.id : 'none', 'Error:', userError?.message);
    console.log('General callback - User email:', user?.email);
    console.log('General callback - Redirect to:', redirect);
    
    if (!user) {
      console.error('No user found in callback, redirecting back to auth');
      return NextResponse.redirect(
        new URL(`/auth/extension?error=not_signed_in&redirect=${encodeURIComponent(redirect)}`, req.url)
      );
    }

    // Redirect to the intended destination
    console.log('Redirecting to:', redirect);
    return NextResponse.redirect(new URL(redirect, req.url));
    
  } catch (error) {
    console.error('General callback error:', error);
    return NextResponse.redirect(
      new URL(`/auth/extension?error=callback_error&redirect=${encodeURIComponent(redirect || '/dashboard')}`, req.url)
    );
  }
}
