import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { mintToken } from '@/lib/auth/jwt';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { secureLog } from '@/lib/secure-logger';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const corsHeaders = (req: NextRequest) => corsHeadersWebAndExtension(req);

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders(req) });
}

/**
 * GET /api/extension/token
 * Returns a short-lived JWT for the Chrome extension when the user has a valid
 * web session (Supabase cookies). Used when users sign in via the website so
 * background/content flows that require Bearer auth still work without the
 * extension-only OAuth redirect.
 */
export async function GET(req: NextRequest) {
  try {
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
              // ignore
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // ignore
            }
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: corsHeaders(req) }
      );
    }

    // Short-lived (5 min) service JWT bridging the web session cookie to the
    // extension. The extension already caches for <=5 min and refreshes on
    // focus, so a 5-min expiry matches its refresh window and minimizes the
    // window a leaked token is usable.
    const token = await mintToken({ userId: user.id, email: user.email ?? '' });

    return NextResponse.json(
      { token },
      { headers: { ...corsHeaders(req), 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    secureLog.error('extension token error', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
