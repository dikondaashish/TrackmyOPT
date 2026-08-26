import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { mintToken } from '@/lib/auth/jwt';
import {
  buildExtensionTokenRedirectUrl,
  isAllowedExtensionRedirectUri,
  isValidExtensionAuthState,
} from '@/lib/auth/trusted-extension';
import { sanitizeError, secureLog } from '@/lib/secure-logger';

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

function extensionAuthRetryUrl(
  req: NextRequest,
  redirectUri: string,
  state: string,
  error: string
): URL {
  const url = new URL('/auth/extension', req.url);
  url.searchParams.set('error', error);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  return url;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const redirectUri = searchParams.get('redirect_uri');
    const state = searchParams.get('state');
    const code = searchParams.get('code'); // OAuth code from Supabase

    if (!redirectUri || !state) {
      return new NextResponse('Missing redirect_uri or state', { status: 400 });
    }
    if (
      !isAllowedExtensionRedirectUri(redirectUri) ||
      !isValidExtensionAuthState(state)
    ) {
      secureLog.warn('Extension callback rejected invalid callback parameters');
      return new NextResponse('Invalid extension callback parameters', {
        status: 400,
      });
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
              // Ignore cookie errors in this context
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (_error) {
              // Ignore cookie errors in this context
            }
          },
        },
      }
    );

    // If we have a code, exchange it for a session
    if (code) {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        secureLog.error('Extension OAuth code exchange error:', {
          message: sanitizeError(exchangeError),
          status: exchangeError.status,
          name: exchangeError.name,
        });
        return NextResponse.redirect(
          extensionAuthRetryUrl(req, redirectUri, state, 'code_exchange_failed')
        );
      }
    }

    // Get the user from the session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      secureLog.warn('Extension callback: no user after exchange, redirecting to auth');
      return NextResponse.redirect(
        extensionAuthRetryUrl(req, redirectUri, state, 'not_signed_in')
      );
    }

    // Use the same issuer/audience-bearing token contract as the extension API.
    const token = await mintToken(
      { userId: user.id, email: user.email ?? '' },
      600
    );
    const response = NextResponse.redirect(
      buildExtensionTokenRedirectUrl(redirectUri, state, token)
    );
    response.headers.set('Cache-Control', 'no-store, private');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  } catch (error) {
    secureLog.error('Extension callback error:', sanitizeError(error));
    return new NextResponse(
      'Unable to complete extension sign-in.',
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
