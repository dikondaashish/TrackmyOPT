// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createOrganizationTextPost,
  exchangeLinkedInCode,
  LinkedInApiError,
  linkedInAuthorizeUrl,
  linkedInPostUrl,
  listAdministeredOrganizations,
  type LinkedInAppConfig,
} from './api';
import { decryptLinkedInToken, encryptLinkedInToken } from './token-crypto';

const APP: LinkedInAppConfig = { clientId: 'client', clientSecret: 'secret', apiVersion: '202609', organizationId: null };

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' }, ...init });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('LinkedIn OAuth', () => {
  it('requests the company page scopes', () => {
    const url = new URL(linkedInAuthorizeUrl(APP, 'https://www.trackmyopt.com/api/admin/linkedin/callback', 'state1'));
    expect(url.origin + url.pathname).toBe('https://www.linkedin.com/oauth/v2/authorization');
    expect(url.searchParams.get('scope')).toBe('r_organization_admin w_organization_social');
    expect(url.searchParams.get('state')).toBe('state1');
  });

  it('exchanges a code for tokens with expiry times', async () => {
    const fetchImpl = vi.fn(async () =>
      json({ access_token: 'at', expires_in: 5_184_000, refresh_token: 'rt', refresh_token_expires_in: 31_536_000, scope: 'w_organization_social' }),
    );
    const now = new Date('2026-10-18T00:00:00Z');
    const tokens = await exchangeLinkedInCode(APP, 'code', 'https://x/cb', { fetchImpl, now });
    expect(tokens.accessToken).toBe('at');
    expect(tokens.accessTokenExpiresAt.toISOString()).toBe('2026-12-17T00:00:00.000Z');
    expect(tokens.refreshToken).toBe('rt');
    const body = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body as URLSearchParams;
    expect(body.get('grant_type')).toBe('authorization_code');
  });

  it('reports a rejected exchange without token values', async () => {
    const fetchImpl = vi.fn(async () => json({ error: 'invalid_grant' }, { status: 400 }));
    await expect(exchangeLinkedInCode(APP, 'code', 'https://x/cb', { fetchImpl })).rejects.toMatchObject({
      code: 'token_exchange_failed',
      status: 400,
    });
  });
});

describe('LinkedIn REST', () => {
  it('lists administered organizations with names', async () => {
    const fetchImpl = vi.fn(async (url: string) =>
      url.includes('organizationAcls')
        ? json({ elements: [{ organizationTarget: 'urn:li:organization:42' }, { organization: 'urn:li:organization:42' }] })
        : json({ localizedName: 'TrackMyOPT' }),
    );
    await expect(listAdministeredOrganizations(APP, 'at', { fetchImpl: fetchImpl as unknown as typeof fetch })).resolves.toEqual([
      { urn: 'urn:li:organization:42', id: '42', name: 'TrackMyOPT' },
    ]);
  });

  it('posts as the organization and returns the post URN', async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 201, headers: { 'x-restli-id': 'urn:li:share:123' } }));
    const urn = await createOrganizationTextPost(APP, 'at', 'urn:li:organization:42', 'Hello', { fetchImpl });
    expect(urn).toBe('urn:li:share:123');
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.linkedin.com/rest/posts');
    expect((init.headers as Record<string, string>)['LinkedIn-Version']).toBe('202609');
    expect(JSON.parse(init.body as string)).toMatchObject({ author: 'urn:li:organization:42', commentary: 'Hello', visibility: 'PUBLIC' });
  });

  it('maps an expired token to post_unauthorized', async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 401 }));
    const error = await createOrganizationTextPost(APP, 'at', 'urn:li:organization:42', 'Hello', { fetchImpl }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(LinkedInApiError);
    expect((error as LinkedInApiError).code).toBe('post_unauthorized');
  });

  it('builds a feed link only for real post URNs', () => {
    expect(linkedInPostUrl('urn:li:share:123')).toBe('https://www.linkedin.com/feed/update/urn:li:share:123/');
    expect(linkedInPostUrl('javascript:alert(1)')).toBeNull();
  });
});

describe('token encryption', () => {
  it('round-trips and rejects tampering', () => {
    vi.stubEnv('LINKEDIN_TOKEN_ENCRYPTION_KEY', Buffer.alloc(32, 7).toString('base64'));
    const encrypted = encryptLinkedInToken('secret-token');
    expect(encrypted).not.toContain('secret-token');
    expect(decryptLinkedInToken(encrypted)).toBe('secret-token');
    const [version, iv, tag, data] = encrypted.split('.');
    const tampered = [version, iv, tag, `${data.slice(0, -2)}AA`].join('.');
    expect(() => decryptLinkedInToken(tampered)).toThrow();
  });

  it('requires a 32-byte key', () => {
    vi.stubEnv('LINKEDIN_TOKEN_ENCRYPTION_KEY', Buffer.alloc(16).toString('base64'));
    expect(() => encryptLinkedInToken('x')).toThrow(/32 bytes/);
  });
});
