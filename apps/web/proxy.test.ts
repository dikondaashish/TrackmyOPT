import { describe, it, expect, vi, beforeEach } from 'vitest';
import { proxy } from '@/proxy';
import { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Mock Supabase
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((url, key, options) => {
    return {
      auth: {
        getUser: vi.fn().mockImplementation(async () => {
          // If the auth cookie is missing, simulate no user
          const cookieHeader = options.cookies.getAll
            ? options.cookies
                .getAll()
                .find(
                  (cookie: { name: string }) =>
                    cookie.name === 'sb-mock-auth-token'
                )?.value
            : options.cookies.get('sb-mock-auth-token');
          if (!cookieHeader) return { data: { user: null }, error: null };
          return { data: { user: { id: 'user_123' } }, error: null };
        }),
      },
    };
  }),
}));

describe('Supabase Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users away from /dashboard to /login', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard');
    const response = await proxy(request);

    expect(response?.status).toBe(307);
    expect(response?.headers.get('location')).toBe(
      'http://localhost:3000/login?returnTo=%2Fdashboard'
    );
  });

  it('allows unauthenticated users to access public static routes', async () => {
    const request = new NextRequest('http://localhost:3000/pricing');
    const response = await proxy(request);

    // Should return a standard response without redirect location
    expect(response?.status).toBe(200);
    expect(response?.headers.get('location')).toBeNull();
  });
  it('keeps admin login and one-time setup reachable before authentication', async () => {
    for (const path of ['/admin/login', '/admin/setup?token_hash=test']) {
      const response = await proxy(
        new NextRequest(`http://localhost:3000${path}`)
      );
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    }
  });
  it('directs signed-out analytics visitors to the admin password login', async () => {
    const response = await proxy(
      new NextRequest('http://localhost:3000/admin/email-campaigns')
    );
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/admin/login'
    );
  });

  it('redirects authenticated users away from /login to /dashboard', async () => {
    const request = new NextRequest('http://localhost:3000/login');
    // Simulate valid auth cookie
    request.cookies.set('sb-mock-auth-token', 'valid-token');

    const response = await proxy(request);

    expect(response?.status).toBe(307);
    expect(response?.headers.get('location')).toBe(
      'http://localhost:3000/dashboard'
    );
  });

  it('allows authenticated users to access protected /dashboard routes', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard');
    request.cookies.set('sb-mock-auth-token', 'valid-token');

    const response = await proxy(request);

    // Should process without redirect
    expect(response?.status).toBe(200);
    expect(response?.headers.get('location')).toBeNull();
  });
});

// Exercise cookie batching through the actual NextResponse cookie transport.
type CookieUpdate = { name: string; value: string; options: CookieOptions };
it.each([
  ['/pricing', false, 200],
  ['/dashboard', false, 307],
  ['/login', true, 307],
] as const)(
  'retains every cookie update across batches and redirects on %s',
  async (path, authenticated, status) => {
    const batches: CookieUpdate[][] = [
      [
        {
          name: 'sb-synthetic-auth-token.0',
          value: '',
          options: { maxAge: 0, path: '/' },
        },
        {
          name: 'sb-synthetic-auth-token.1',
          value: '',
          options: { maxAge: 0, path: '/' },
        },
      ],
      [
        {
          name: 'sb-synthetic-auth-token',
          value: 'synthetic-refreshed-session',
          options: { maxAge: 3600, path: '/', sameSite: 'lax' },
        },
      ],
    ];
    vi.mocked(createServerClient).mockImplementationOnce(
      (_url, _key, options) =>
        ({
          auth: {
            getUser: async () => {
              const cookies = options.cookies as {
                setAll?: (updates: CookieUpdate[]) => void;
                set?: (
                  name: string,
                  value: string,
                  options: CookieOptions
                ) => void;
              };
              for (const batch of batches) {
                if (cookies.setAll) cookies.setAll(batch);
                else
                  for (const cookie of batch)
                    cookies.set?.(cookie.name, cookie.value, cookie.options);
              }
              return {
                data: { user: authenticated ? { id: 'synthetic-user' } : null },
                error: null,
              };
            },
          },
        }) as unknown as ReturnType<typeof createServerClient>
    );
    const request = new NextRequest(`http://localhost:3000${path}`);
    request.cookies.set('unrelated-cookie', 'synthetic-value');
    // Unchanged privacy region, so only auth cookies are written here.
    request.cookies.set('tmo_privacy_region', 'UNKNOWN');
    const response = await proxy(request);
    expect(response.status).toBe(status);
    expect(response.cookies.getAll().map(({ name }) => name)).toEqual([
      'sb-synthetic-auth-token.0',
      'sb-synthetic-auth-token.1',
      'sb-synthetic-auth-token',
    ]);
    expect(response.cookies.get('sb-synthetic-auth-token.0')?.maxAge).toBe(0);
    expect(response.cookies.get('sb-synthetic-auth-token.1')?.maxAge).toBe(0);
    expect(response.cookies.get('sb-synthetic-auth-token')?.value).toBe(
      'synthetic-refreshed-session'
    );
    expect(response.cookies.has('unrelated-cookie')).toBe(false);
    expect(request.cookies.get('unrelated-cookie')?.value).toBe(
      'synthetic-value'
    );
  }
);
