import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { getLinkedInAdmin, linkedInAppConfig, linkedInRedirectUri } from '@/lib/linkedin/config';
import { linkedInAuthorizeUrl } from '@/lib/linkedin/api';
import { isLinkedInTokenEncryptionConfigured } from '@/lib/linkedin/token-crypto';
import { LINKEDIN_STATE_COOKIE, settingsRedirect } from '@/lib/linkedin/oauth-state';

export const dynamic = 'force-dynamic';

/** GET /api/admin/linkedin/connect — starts LinkedIn sign-in for the company page. */
async function handleGET(req: NextRequest) {
  const admin = await getLinkedInAdmin();
  if (admin.status === 'signed_out') return NextResponse.redirect(new URL('/login', req.url));
  if (admin.status !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const app = linkedInAppConfig();
  if (!app || !isLinkedInTokenEncryptionConfigured()) return settingsRedirect(req, 'not_configured');

  const state = randomBytes(32).toString('base64url');
  const response = NextResponse.redirect(
    linkedInAuthorizeUrl(app, linkedInRedirectUri(new URL(req.url).origin), state),
  );
  response.cookies.set(LINKEDIN_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/admin/linkedin',
    maxAge: 600,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export const GET = withSentryApiErrors(handleGET, '/api/admin/linkedin/connect', 'GET');
