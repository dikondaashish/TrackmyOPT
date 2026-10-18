
// Thin LinkedIn REST client: OAuth, the member's administered pages, and
// text posts as the organization. Errors carry a code, never token values.

/**
 * Community Management API scopes: read the member's page roles and post as
 * the page. LinkedIn rejects the whole sign-in if any scope is not enabled
 * on the app, so LINKEDIN_SCOPES (space-separated) can override them.
 */
export const DEFAULT_LINKEDIN_SCOPES = ['rw_organization_admin', 'w_organization_social'] as const;

export type LinkedInAppConfig = {
  clientId: string;
  clientSecret: string;
  apiVersion: string;
  organizationId: string | null;
  scopes: readonly string[];
};

const OAUTH_BASE = 'https://www.linkedin.com/oauth/v2';
const REST_BASE = 'https://api.linkedin.com/rest';
const REQUEST_TIMEOUT_MS = 20_000;

export class LinkedInApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number | null,
  ) {
    super(`LinkedIn request failed: ${code}${status ? ` (HTTP ${status})` : ''}`);
    this.name = 'LinkedInApiError';
  }
}

export type LinkedInTokenSet = {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string | null;
  refreshTokenExpiresAt: Date | null;
  scopes: string | null;
};

export type LinkedInOrganization = { urn: string; id: string; name: string | null };

type FetchImpl = typeof fetch;

async function send(fetchImpl: FetchImpl, url: string, init: RequestInit, code: string): Promise<Response> {
  try {
    return await fetchImpl(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), cache: 'no-store' });
  } catch {
    throw new LinkedInApiError(`${code}_network`, null);
  }
}

export function linkedInAuthorizeUrl(app: LinkedInAppConfig, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: app.clientId,
    redirect_uri: redirectUri,
    state,
    scope: app.scopes.join(' '),
  });
  return `${OAUTH_BASE}/authorization?${params.toString()}`;
}

function tokenSet(payload: Record<string, unknown>, now: Date): LinkedInTokenSet {
  const accessToken = typeof payload.access_token === 'string' ? payload.access_token : '';
  const expiresIn = Number(payload.expires_in);
  if (!accessToken || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new LinkedInApiError('token_response_invalid', null);
  }
  const refreshToken = typeof payload.refresh_token === 'string' && payload.refresh_token ? payload.refresh_token : null;
  const refreshExpiresIn = Number(payload.refresh_token_expires_in);
  return {
    accessToken,
    accessTokenExpiresAt: new Date(now.getTime() + expiresIn * 1000),
    refreshToken,
    refreshTokenExpiresAt:
      refreshToken && Number.isFinite(refreshExpiresIn) && refreshExpiresIn > 0
        ? new Date(now.getTime() + refreshExpiresIn * 1000)
        : null,
    scopes: typeof payload.scope === 'string' ? payload.scope.slice(0, 500) : null,
  };
}

async function requestToken(
  fetchImpl: FetchImpl,
  body: URLSearchParams,
  code: string,
  now: Date,
): Promise<LinkedInTokenSet> {
  const response = await send(
    fetchImpl,
    `${OAUTH_BASE}/accessToken`,
    { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body },
    code,
  );
  if (!response.ok) throw new LinkedInApiError(code, response.status);
  return tokenSet((await response.json()) as Record<string, unknown>, now);
}

export function exchangeLinkedInCode(
  app: LinkedInAppConfig,
  authorizationCode: string,
  redirectUri: string,
  options: { fetchImpl?: FetchImpl; now?: Date } = {},
): Promise<LinkedInTokenSet> {
  return requestToken(
    options.fetchImpl ?? fetch,
    new URLSearchParams({
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: redirectUri,
      client_id: app.clientId,
      client_secret: app.clientSecret,
    }),
    'token_exchange_failed',
    options.now ?? new Date(),
  );
}

export function refreshLinkedInToken(
  app: LinkedInAppConfig,
  refreshToken: string,
  options: { fetchImpl?: FetchImpl; now?: Date } = {},
): Promise<LinkedInTokenSet> {
  return requestToken(
    options.fetchImpl ?? fetch,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: app.clientId,
      client_secret: app.clientSecret,
    }),
    'token_refresh_failed',
    options.now ?? new Date(),
  );
}

function restHeaders(app: LinkedInAppConfig, accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    'LinkedIn-Version': app.apiVersion,
    'X-Restli-Protocol-Version': '2.0.0',
  };
}

/** Company pages the signed-in member administers (approved ADMINISTRATOR role). */
export async function listAdministeredOrganizations(
  app: LinkedInAppConfig,
  accessToken: string,
  options: { fetchImpl?: FetchImpl } = {},
): Promise<LinkedInOrganization[]> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await send(
    fetchImpl,
    `${REST_BASE}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&count=50`,
    { headers: restHeaders(app, accessToken) },
    'organization_lookup_failed',
  );
  if (!response.ok) throw new LinkedInApiError('organization_lookup_failed', response.status);
  const payload = (await response.json()) as { elements?: Array<Record<string, unknown>> };
  const urns = [
    ...new Set(
      (payload.elements ?? [])
        .map((element) => element.organization ?? element.organizationTarget)
        .filter((urn): urn is string => typeof urn === 'string' && /^urn:li:organization:\d+$/.test(urn)),
    ),
  ];
  return Promise.all(
    urns.map(async (urn) => {
      const id = urn.slice('urn:li:organization:'.length);
      let name: string | null = null;
      // The name is a convenience; posting works without it.
      const detail = await send(
        fetchImpl,
        `${REST_BASE}/organizations/${id}`,
        { headers: restHeaders(app, accessToken) },
        'organization_name_failed',
      ).catch(() => null);
      if (detail?.ok) {
        const body = (await detail.json().catch(() => ({}))) as { localizedName?: unknown };
        if (typeof body.localizedName === 'string') name = body.localizedName.slice(0, 200);
      }
      return { urn, id, name };
    }),
  );
}

/** Publishes a text post as the organization and returns the post URN. */
export async function createOrganizationTextPost(
  app: LinkedInAppConfig,
  accessToken: string,
  organizationUrn: string,
  commentary: string,
  options: { fetchImpl?: FetchImpl } = {},
): Promise<string> {
  const response = await send(
    options.fetchImpl ?? fetch,
    `${REST_BASE}/posts`,
    {
      method: 'POST',
      headers: { ...restHeaders(app, accessToken), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: organizationUrn,
        commentary,
        visibility: 'PUBLIC',
        distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      }),
    },
    'post_create_failed',
  );
  if (response.status !== 201 && !response.ok) {
    throw new LinkedInApiError(response.status === 401 ? 'post_unauthorized' : 'post_create_failed', response.status);
  }
  return response.headers.get('x-restli-id') ?? '';
}

export function linkedInPostUrl(postUrn: string): string | null {
  return /^urn:li:(?:share|ugcPost):\d+$/.test(postUrn) ? `https://www.linkedin.com/feed/update/${postUrn}/` : null;
}
