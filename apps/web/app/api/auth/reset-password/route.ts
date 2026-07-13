import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {
  checkRateLimitByIP,
  rateLimitResponse,
  EMAIL_RATE_LIMIT,
} from '@/lib/auth/api-rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const rateLimitResult = checkRateLimitByIP(request, EMAIL_RATE_LIMIT);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult, 'Too many reset attempts. Please try again later.');
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      message: 'If an account exists for this email, a reset link has been sent.',
    });

    // Password recovery uses PKCE. The code verifier written by Supabase must be
    // returned to the browser that requested the email so the emailed `?code=`
    // can be exchanged for a recovery session on /auth/reset-password.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    // Keep the public response identical for existing and non-existing accounts.
    if (error) {
      console.error('Password reset request was rejected by the auth provider');
    }

    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
