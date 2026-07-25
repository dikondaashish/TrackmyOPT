import { describe, it, expect, vi, beforeEach } from 'vitest';
import { middleware } from '@/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Mock Supabase
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((url, key, options) => {
    return {
      auth: {
        getUser: vi.fn().mockImplementation(async () => {
          // If the auth cookie is missing, simulate no user
          const cookieHeader = options.cookies.get('sb-mock-auth-token');
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
    const response = await middleware(request);

    expect(response?.status).toBe(307);
    expect(response?.headers.get('location')).toBe('http://localhost:3000/login?returnTo=%2Fdashboard');
  });

  it('allows unauthenticated users to access public static routes', async () => {
    const request = new NextRequest('http://localhost:3000/pricing');
    const response = await middleware(request);

    // Should return a standard response without redirect location
    expect(response?.status).toBe(200);
    expect(response?.headers.get('location')).toBeNull();
  });

  it('redirects authenticated users away from /login to /dashboard/case-status', async () => {
    const request = new NextRequest('http://localhost:3000/login');
    // Simulate valid auth cookie
    request.cookies.set('sb-mock-auth-token', 'valid-token');

    const response = await middleware(request);

    expect(response?.status).toBe(307);
    expect(response?.headers.get('location')).toBe('http://localhost:3000/dashboard/case-status');
  });

  it('allows authenticated users to access protected /dashboard routes', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard');
    request.cookies.set('sb-mock-auth-token', 'valid-token');

    const response = await middleware(request);

    // Should process without redirect
    expect(response?.status).toBe(200);
    expect(response?.headers.get('location')).toBeNull();
  });
});
