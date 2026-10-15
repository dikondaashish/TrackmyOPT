import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: null }, error: null })) },
  })),
}));

function request(path: string, country?: string, cookies: Record<string, string> = {}) {
  const req = new NextRequest(`https://www.trackmyopt.com${path}`, {
    headers: country ? { 'x-vercel-ip-country': country } : {},
  });
  for (const [name, value] of Object.entries(cookies)) req.cookies.set(name, value);
  return req;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('privacy region detection in proxy.ts', () => {
  it.each([
    ['DE', 'EU_EEA'],
    ['GB', 'UK'],
    ['US', 'US'],
    ['BR', 'OTHER'],
    [undefined, 'UNKNOWN'],
  ])('country %s → %s cookie', async (country, region) => {
    const response = await proxy(request('/pricing', country));
    const cookie = response.cookies.get('tmo_privacy_region');
    expect(cookie?.value).toBe(region);
    expect(cookie?.httpOnly).toBe(false);
    expect(cookie?.secure).toBe(true);
    expect(cookie?.sameSite).toBe('lax');
  });

  it('exposes only the jurisdiction group, never the country', async () => {
    const response = await proxy(request('/', 'FR'));
    const values = response.cookies.getAll().map(({ value }) => value);
    expect(values).not.toContain('FR');
    expect(response.headers.get('x-vercel-ip-country')).toBeNull();
  });

  it('does not rewrite an unchanged region cookie', async () => {
    const response = await proxy(request('/', 'US', { tmo_privacy_region: 'US' }));
    expect(response.cookies.get('tmo_privacy_region')).toBeUndefined();
  });

  it('updates the region when the visitor moves', async () => {
    const response = await proxy(request('/', 'IE', { tmo_privacy_region: 'US' }));
    expect(response.cookies.get('tmo_privacy_region')?.value).toBe('EU_EEA');
  });

  it('skips API routes', async () => {
    const response = await proxy(request('/api/me', 'DE'));
    expect(response.cookies.get('tmo_privacy_region')).toBeUndefined();
  });

  it('allows a development override that is remembered', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const response = await proxy(request('/?privacy_region=UK', 'US'));
    expect(response.cookies.get('tmo_privacy_region')?.value).toBe('UK');
    expect(response.cookies.get('tmo_privacy_region_override')?.value).toBe('UK');

    const next = await proxy(request('/', 'US', { tmo_privacy_region_override: 'UK' }));
    expect(next.cookies.get('tmo_privacy_region')?.value).toBe('UK');
  });

  it('ignores override parameters, cookies, and env in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('PRIVACY_REGION_OVERRIDE', 'US');
    const response = await proxy(
      request('/?privacy_region=US', 'DE', { tmo_privacy_region_override: 'US' })
    );
    expect(response.cookies.get('tmo_privacy_region')?.value).toBe('EU_EEA');
    expect(response.cookies.get('tmo_privacy_region_override')).toBeUndefined();
  });
});
