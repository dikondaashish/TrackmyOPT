import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { safeEqual } from '@/lib/api/secure-compare';
import { getLinkedInAdmin, linkedInAppConfig, linkedInRedirectUri } from '@/lib/linkedin/config';
import {
  exchangeLinkedInCode,
  LinkedInApiError,
  listAdministeredOrganizations,
  type LinkedInOrganization,
} from '@/lib/linkedin/api';
import { savePageConnection } from '@/lib/linkedin/daily-post-service';
import { LINKEDIN_STATE_COOKIE, settingsRedirect } from '@/lib/linkedin/oauth-state';

export const dynamic = 'force-dynamic';

/**
 * Picks the company page to post as: LINKEDIN_ORGANIZATION_ID when set,
 * otherwise the only page, otherwise the page named TrackMyOPT.
 */
function chooseOrganization(
  organizations: LinkedInOrganization[],
  configuredId: string | null,
): LinkedInOrganization | null {
  if (configuredId) return organizations.find((organization) => organization.id === configuredId) ?? null;
  if (organizations.length === 1) return organizations[0];
  const named = organizations.filter((organization) =>
    organization.name?.toLowerCase().replace(/\s+/g, '').includes('trackmyopt'),
  );
  return named.length === 1 ? named[0] : null;
}

function reportFailure(code: string, error: unknown) {
  Sentry.withScope((scope) => {
    scope.setFingerprint(['linkedin-daily-post', 'connect', code]);
    scope.setTag('linkedin_post', code);
    scope.setContext('linkedin_connect', {
      code,
      status: error instanceof LinkedInApiError ? error.status : null,
    });
    Sentry.captureMessage(`LinkedIn page connect failed: ${code}`, 'error');
  });
}

/** GET /api/admin/linkedin/callback — LinkedIn redirects here after sign-in. */
async function handleGET(req: NextRequest) {
  const admin = await getLinkedInAdmin();
  if (admin.status === 'signed_out') return NextResponse.redirect(new URL('/login', req.url));
  if (admin.status !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const params = new URL(req.url).searchParams;
  const expectedState = req.cookies.get(LINKEDIN_STATE_COOKIE)?.value ?? '';
  const state = params.get('state') ?? '';
  if (!expectedState || !state || !safeEqual(state, expectedState)) return settingsRedirect(req, 'state_mismatch');
  // The admin pressed Cancel on LinkedIn's consent screen.
  if (params.get('error')) return settingsRedirect(req, 'cancelled');
  const code = params.get('code');
  if (!code) return settingsRedirect(req, 'cancelled');

  const app = linkedInAppConfig();
  if (!app) return settingsRedirect(req, 'not_configured');

  try {
    const redirectUri = linkedInRedirectUri(new URL(req.url).origin);
    const tokens = await exchangeLinkedInCode(app, code, redirectUri);
    const organizations = await listAdministeredOrganizations(app, tokens.accessToken);
    if (organizations.length === 0) return settingsRedirect(req, 'no_admin_page');
    const organization = chooseOrganization(organizations, app.organizationId);
    if (!organization) return settingsRedirect(req, 'choose_page');

    await savePageConnection({
      organizationUrn: organization.urn,
      organizationName: organization.name,
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      scopes: tokens.scopes,
      connectedByEmail: admin.email,
    });
    return settingsRedirect(req, 'connected');
  } catch (error) {
    const failureCode = error instanceof LinkedInApiError ? error.code : 'connect_failed';
    reportFailure(failureCode, error);
    return settingsRedirect(req, 'connect_failed');
  }
}

export const GET = withSentryApiErrors(handleGET, '/api/admin/linkedin/callback', 'GET');
