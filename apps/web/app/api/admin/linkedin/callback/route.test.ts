import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  capture: vi.fn(),
  exchange: vi.fn(),
  listOrgs: vi.fn(),
  save: vi.fn(),
}));
vi.mock('@sentry/nextjs', () => ({
  captureMessage: m.capture,
  withScope: (fn: (scope: unknown) => void) => fn({ setFingerprint: vi.fn(), setTag: vi.fn(), setContext: vi.fn() }),
}));
vi.mock('@/lib/linkedin/config', () => ({
  getLinkedInAdmin: async () => ({ status: 'admin', email: 'owner@example.com' }),
  linkedInAppConfig: () => ({ clientId: 'id', clientSecret: 's', apiVersion: '202609', organizationId: null, scopes: [] }),
  linkedInRedirectUri: (origin: string) => `${origin}/api/admin/linkedin/callback`,
}));
vi.mock('@/lib/linkedin/api', () => ({
  exchangeLinkedInCode: m.exchange,
  listAdministeredOrganizations: m.listOrgs,
  LinkedInApiError: class extends Error {},
}));
vi.mock('@/lib/linkedin/daily-post-service', () => ({ savePageConnection: m.save }));

import { GET } from './route';

function callback(query: string, state?: string) {
  const req = new NextRequest(`https://www.trackmyopt.com/api/admin/linkedin/callback?${query}`);
  if (state) req.cookies.set('tmo_linkedin_oauth_state', state);
  return GET(req);
}
const outcome = (res: Response) => new URL(res.headers.get('location') ?? '').searchParams.get('linkedin');

beforeEach(() => {
  vi.clearAllMocks();
  m.exchange.mockResolvedValue({
    accessToken: 'at',
    accessTokenExpiresAt: new Date('2026-12-01'),
    refreshToken: null,
    refreshTokenExpiresAt: null,
    scopes: null,
  });
  m.listOrgs.mockResolvedValue([{ urn: 'urn:li:organization:42', id: '42', name: 'TrackMyOPT' }]);
});

it('connects the only administered page', async () => {
  const res = await callback('code=abc&state=s1', 's1');
  expect(outcome(res)).toBe('connected');
  expect(m.save).toHaveBeenCalledWith(expect.objectContaining({ organizationUrn: 'urn:li:organization:42', connectedByEmail: 'owner@example.com' }));
});

it('rejects a code without the matching state', async () => {
  expect(outcome(await callback('code=abc&state=forged', 's1'))).toBe('state_mismatch');
  expect(m.exchange).not.toHaveBeenCalled();
});

it('explains a missing app permission even when LinkedIn omits the state', async () => {
  expect(outcome(await callback('error=unauthorized_scope_error'))).toBe('scope_not_authorized');
  expect(m.capture).toHaveBeenCalledWith('LinkedIn page connect failed: unauthorized_scope', 'error');
});

it('treats Cancel as cancelled without reporting', async () => {
  expect(outcome(await callback('error=user_cancelled_authorize&state=s1', 's1'))).toBe('cancelled');
  expect(m.capture).not.toHaveBeenCalled();
});

it('asks for LINKEDIN_ORGANIZATION_ID when several pages match', async () => {
  m.listOrgs.mockResolvedValue([
    { urn: 'urn:li:organization:1', id: '1', name: 'Other' },
    { urn: 'urn:li:organization:2', id: '2', name: 'Another' },
  ]);
  expect(outcome(await callback('code=abc&state=s1', 's1'))).toBe('choose_page');
  expect(m.save).not.toHaveBeenCalled();
});
