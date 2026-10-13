// @vitest-environment node
import { GoTrueClient } from '@supabase/supabase-js';
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const session = {
  access_token: 'synthetic-access-token',
  refresh_token: 'synthetic-refresh-token',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: { id: 'synthetic-user', email: 'synthetic@example.test' },
};

it.each([
  '{"access_token":"synthetic-private-value"',
  JSON.stringify(JSON.stringify(session)),
  '42',
  'true',
])(
  'cleans invalid persisted sessions before user hydration without leaking their contents: %s',
  async (stored) => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const values = new Map([
      ['synthetic-session', stored],
      ['synthetic-session-code-verifier', 'synthetic-pkce-verifier'],
      ['unrelated-cookie', 'synthetic-unrelated-value'],
    ]);
    const fetch = vi.fn();
    const client = new GoTrueClient({
      url: 'https://example.test/auth/v1',
      storageKey: 'synthetic-session',
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
      fetch,
      storage: {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => {
          values.set(key, value);
        },
        removeItem: (key) => {
          values.delete(key);
        },
      },
    });
    await client.initialize();
    expect(values.has('synthetic-session')).toBe(false);
    expect(log.mock.calls).toEqual([
      ['Auth session storage was invalid; sign in again'],
    ]);
    const result = await client.getSession();
    expect(result.error).toBeNull();
    expect(result.data.session).toBeNull();
    expect(values.has('synthetic-session')).toBe(false);
    expect(values.get('synthetic-session-code-verifier')).toBe(
      'synthetic-pkce-verifier'
    );
    expect(values.get('unrelated-cookie')).toBe('synthetic-unrelated-value');
    expect(fetch).not.toHaveBeenCalled();
    expect(log.mock.calls).toEqual([
      ['Auth session storage was invalid; sign in again'],
    ]);
  }
);

it('retains a valid persisted session without network requests or diagnostics', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  const removeItem = vi.fn();
  const fetch = vi.fn();
  const client = new GoTrueClient({
    url: 'https://example.test/auth/v1',
    storageKey: 'valid-synthetic-session',
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: true,
    fetch,
    storage: {
      getItem: (key) =>
        key === 'valid-synthetic-session' ? JSON.stringify(session) : null,
      setItem: vi.fn(),
      removeItem,
    },
  });
  await client.initialize();
  expect((await client.getSession()).data.session).toEqual(session);
  expect(removeItem).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
  expect(log).not.toHaveBeenCalled();
});

it('clears every malformed SSR cookie chunk while preserving PKCE and unrelated cookies', async () => {
  const { createServerClient, createChunks } =
    await vi.importActual<typeof import('@supabase/ssr')>('@supabase/ssr');
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  const key = 'sb-synthetic-auth-token';
  const broken =
    '{"access_token":"synthetic-access","padding":"' + 'x'.repeat(8000);
  const chunks = createChunks(
    key,
    'base64-' + Buffer.from(broken).toString('base64url')
  );
  const jar = new Map(chunks.map(({ name, value }) => [name, value]));
  jar.set(key + '-code-verifier', 'synthetic-pkce-verifier');
  jar.set('unrelated-cookie', 'synthetic-unrelated-value');
  const fetch = vi.fn();
  const client = createServerClient(
    'https://example.test',
    'synthetic-public-key',
    {
      cookieOptions: { name: key },
      global: { fetch },
      cookies: {
        getAll: () => Array.from(jar, ([name, value]) => ({ name, value })),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) => {
            if (options.maxAge === 0) jar.delete(name);
            else jar.set(name, value);
          }),
      },
    }
  );
  expect(chunks.length).toBeGreaterThan(2);
  await client.auth.initialize();
  expect((await client.auth.getSession()).data.session).toBeNull();
  for (const chunk of chunks) expect(jar.has(chunk.name)).toBe(false);
  expect(jar.get(key + '-code-verifier')).toBe('synthetic-pkce-verifier');
  expect(jar.get('unrelated-cookie')).toBe('synthetic-unrelated-value');
  expect(fetch).not.toHaveBeenCalled();
  expect(log.mock.calls).toEqual([
    ['Auth session storage was invalid; sign in again'],
  ]);
});

it('retains the session during retryable refresh outages and recovers when the provider returns', async () => {
  vi.useFakeTimers();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const key = 'synthetic-outage-session';
  const values = new Map([[key, JSON.stringify(session)]]);
  const fetch = vi
    .fn()
    .mockRejectedValue(new TypeError('Synthetic network outage'));
  const removeItem = vi.fn((name: string) => {
    values.delete(name);
  });
  const client = new GoTrueClient({
    url: 'https://example.test/auth/v1',
    storageKey: key,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: true,
    fetch,
    storage: {
      getItem: (name) => values.get(name) ?? null,
      setItem: (name, value) => {
        values.set(name, value);
      },
      removeItem,
    },
  });
  await client.initialize();
  const refreshing = client.refreshSession();
  await vi.advanceTimersByTimeAsync(40_000);
  const failed = await refreshing;
  expect(failed.error?.name).toBe('AuthRetryableFetchError');
  expect(fetch.mock.calls.length).toBeGreaterThan(1);
  expect(JSON.parse(values.get(key)!)).toEqual(session);
  expect(removeItem).not.toHaveBeenCalled();
  fetch.mockResolvedValue(
    new Response(
      JSON.stringify({
        ...session,
        access_token: 'synthetic-new-access',
        token_type: 'bearer',
        expires_in: 3600,
      }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )
  );
  const recovered = await client.refreshSession();
  expect(recovered.error).toBeNull();
  expect(recovered.data.session?.user.id).toBe(session.user.id);
  expect(JSON.parse(values.get(key)!).access_token).toBe(
    'synthetic-new-access'
  );
  expect(removeItem).not.toHaveBeenCalled();
});
