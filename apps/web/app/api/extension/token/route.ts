import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { signToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/extension/token
 * Returns a short-lived JWT for the Chrome extension when the user has a valid
 * web session (Supabase cookies). Used when users sign in via the website so
 * background/content flows that require Bearer auth still work without the
 * extension-only OAuth redirect.
 */
export async function GET() {
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
        { status: 401, headers: corsHeaders }
      );
    }

    const token = await signToken(
      { userId: user.id, email: user.email ?? '' },
      '10m'
    );

    return NextResponse.json(
      { token },
      { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.error('extension token error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
