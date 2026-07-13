import { NextRequest } from 'next/server';
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    vi.mocked(createServerClient).mockReset();
  });

  it('returns the PKCE verifier cookie written by Supabase', async () => {
    const resetPasswordForEmail = vi.fn().mockResolvedValue({ data: {}, error: null });

    vi.mocked(createServerClient).mockImplementation(((
      _url: string,
      _key: string,
      options: { cookies: CookieMethodsServer },
    ) => {
      options.cookies.setAll?.([
        {
          name: 'sb-test-auth-token-code-verifier',
          value: 'pkce-verifier',
          options: { httpOnly: false, sameSite: 'lax', path: '/' },
        },
      ]);

      return {
        auth: { resetPasswordForEmail },
      };
    }) as unknown as typeof createServerClient);

    const request = new NextRequest('https://www.trackmyopt.com/api/auth/reset-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.cookies.get('sb-test-auth-token-code-verifier')?.value).toBe(
      'pkce-verifier',
    );
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
      redirectTo: expect.stringMatching(/\/auth\/reset-password$/),
    });
  });
});
