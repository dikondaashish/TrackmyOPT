import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ capture: vi.fn(), fetch: vi.fn() }));
vi.mock('@sentry/nextjs', () => ({ captureException: m.capture }));

import {
  checkOracleFilingsHealth,
  hasSupabaseFilingsFallback,
  isOracleFilingsStoreSelected,
  listOracleFilings,
  reportOracleFilingsFailure,
} from './filings-store';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.test/');
  vi.stubEnv('API_SECRET_KEY', 'synthetic-key');
  vi.stubGlobal('fetch', m.fetch);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('filings store selection', () => {
  it('selects Oracle only on an explicit opt-in', () => {
    vi.stubEnv('H1B_FILINGS_STORE', '');
    expect(isOracleFilingsStoreSelected()).toBe(false);
    vi.stubEnv('H1B_FILINGS_STORE', 'oracle');
    expect(isOracleFilingsStoreSelected()).toBe(true);
  });

  it('offers the Supabase fallback only when fully configured', () => {
    vi.stubEnv('SUPABASE_FILINGS_URL', 'https://filings.example.test');
    vi.stubEnv('SUPABASE_FILINGS_SERVICE_ROLE_KEY', '');
    expect(hasSupabaseFilingsFallback()).toBe(false);
    vi.stubEnv('SUPABASE_FILINGS_SERVICE_ROLE_KEY', 'synthetic');
    expect(hasSupabaseFilingsFallback()).toBe(true);
  });
});

describe('listOracleFilings', () => {
  it('calls the API with the key, sponsor id, and employer name', async () => {
    m.fetch.mockResolvedValue(Response.json({ filings: [{ id: 'a' }] }));

    await expect(listOracleFilings('sp 1', 'Example & Co')).resolves.toEqual([
      { id: 'a' },
    ]);

    const [url, init] = m.fetch.mock.calls[0];
    expect(url).toBe(
      'https://api.example.test/sponsor-data/filings?sponsorId=sp+1&employerName=Example+%26+Co'
    );
    expect(init.headers).toEqual({ 'x-api-key': 'synthetic-key' });
    expect(init.cache).toBe('no-store');
  });

  it('omits a missing employer name', async () => {
    m.fetch.mockResolvedValue(Response.json({ filings: [] }));
    await listOracleFilings('sp-1', null);
    expect(m.fetch.mock.calls[0][0]).toBe(
      'https://api.example.test/sponsor-data/filings?sponsorId=sp-1'
    );
  });

  it('rejects error responses and invalid payloads', async () => {
    m.fetch.mockResolvedValueOnce(new Response(null, { status: 503 }));
    await expect(listOracleFilings('sp-1', null)).rejects.toThrow('503');
    m.fetch.mockResolvedValueOnce(Response.json({ filings: 'nope' }));
    await expect(listOracleFilings('sp-1', null)).rejects.toThrow(
      'invalid payload'
    );
  });

  it('fails clearly when the API is not configured', async () => {
    vi.stubEnv('API_SECRET_KEY', '');
    await expect(listOracleFilings('sp-1', null)).rejects.toThrow(
      'not configured'
    );
    expect(m.fetch).not.toHaveBeenCalled();
  });
});

describe('health and reporting', () => {
  it('reads the API health endpoint', async () => {
    m.fetch.mockResolvedValue(Response.json({ ok: true, rowsChecked: 1 }));
    await expect(checkOracleFilingsHealth()).resolves.toMatchObject({
      ok: true,
    });
    expect(m.fetch.mock.calls[0][0]).toBe(
      'https://api.example.test/sponsor-data/filings/health'
    );
  });

  it('reports failures with a fixed, data-free message', () => {
    reportOracleFilingsFailure('profile', true);
    const error = m.capture.mock.calls[0][0] as Error;
    expect(error.message).toBe(
      'H-1B filings Oracle profile read failed; served from Supabase fallback'
    );
  });
});
