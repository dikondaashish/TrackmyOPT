import { NextRequest, NextResponse } from 'next/server';

export const LINKEDIN_STATE_COOKIE = 'tmo_linkedin_oauth_state';

/** Back to Settings → Profile, where the LinkedIn card shows the outcome. */
export function settingsRedirect(req: NextRequest, outcome: string): NextResponse {
  const url = new URL('/dashboard/settings', req.url);
  url.searchParams.set('tab', 'profile');
  url.searchParams.set('linkedin', outcome);
  url.hash = 'linkedin';
  const response = NextResponse.redirect(url);
  response.cookies.set(LINKEDIN_STATE_COOKIE, '', { path: '/api/admin/linkedin', maxAge: 0 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
