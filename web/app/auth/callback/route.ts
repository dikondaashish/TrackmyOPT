import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth callback handler for email confirmations and OAuth flows
 * This route is called by Supabase after email verification
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/extension?error=${encodeURIComponent(
        errorDescription || error
      )}`
    );
  }

  if (code) {
    // In a real implementation, you'd exchange the code for a session
    // For now, redirect to the auth page which will handle the session
    return NextResponse.redirect(`${requestUrl.origin}/auth/extension`);
  }

  // No code provided, redirect to home
  return NextResponse.redirect(requestUrl.origin);
}

