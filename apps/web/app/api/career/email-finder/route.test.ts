import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  checkRateLimitByUser: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser } }),
}));
vi.mock('@/lib/auth/api-rate-limit', () => ({
  checkRateLimitByUser: mocks.checkRateLimitByUser,
}));

const { POST } = await import('./route');

function request(linkedinUrl: string) {
  return new NextRequest('https://www.trackmyopt.com/api/career/email-finder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linkedinUrl }),
  });
}

describe('POST /api/career/email-finder', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.checkRateLimitByUser.mockResolvedValue({ success: true });
    vi.stubGlobal('fetch', vi.fn());
  });

  it('requires a signed-in user before calling ApplyBolt', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(
      request('https://www.linkedin.com/in/example-person')
    );
    expect(response.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects other hosts and profile types before calling ApplyBolt', async () => {
    for (const url of [
      'https://linkedin.com.evil.test/in/example-person',
      'https://www.linkedin.com/jobs/view/123',
      'https://www.linkedin.com@evil.test/in/example-person',
    ]) {
      const response = await POST(request(url));
      expect(response.status).toBe(400);
    }
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.checkRateLimitByUser).not.toHaveBeenCalled();
  });

  it('normalizes the profile URL after authentication and rate limiting', async () => {
    const response = await POST(
      request('linkedin.com/in/alex-example/?trk=public_profile')
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(await response.json()).toEqual({
      ok: true,
      data: { linkedinUrl: 'https://www.linkedin.com/in/alex-example' },
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.checkRateLimitByUser).toHaveBeenCalledOnce();
  });

  it('stops at the per-user limit', async () => {
    mocks.checkRateLimitByUser.mockResolvedValue({
      success: false,
      retryAfter: 120,
    });
    const response = await POST(
      request('https://www.linkedin.com/in/example-person')
    );
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('120');
    expect(fetch).not.toHaveBeenCalled();
  });
});
