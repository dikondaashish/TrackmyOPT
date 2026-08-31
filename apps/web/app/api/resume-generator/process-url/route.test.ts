import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUserId: vi.fn(), checkRateLimitByIP: vi.fn(), checkRateLimitByUser: vi.fn(), safeFetchPublicHttps: vi.fn() }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.getUserId }));
vi.mock('@/lib/auth/api-rate-limit', () => ({
  checkRateLimitByIP: mocks.checkRateLimitByIP, checkRateLimitByUser: mocks.checkRateLimitByUser,
  rateLimitResponse: vi.fn(),
}));
vi.mock('@/lib/security/safe-url-fetch', () => ({
  safeFetchPublicHttps: mocks.safeFetchPublicHttps,
  ResponseTooLargeError: class ResponseTooLargeError extends Error {},
  SafeFetchTimeoutError: class SafeFetchTimeoutError extends Error {},
  UnsafeUrlError: class UnsafeUrlError extends Error {},
}));
vi.mock('@/lib/secure-logger', () => ({ secureLog: { warn: vi.fn() }, sanitizeError: vi.fn() }));

const { POST } = await import('./route');
const request = (body: unknown) => new NextRequest('https://www.trackmyopt.com/api/resume-generator/process-url', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

describe('POST /api/resume-generator/process-url', () => {
  beforeEach(() => {
    vi.clearAllMocks(); mocks.getUserId.mockResolvedValue('user-1');
    mocks.checkRateLimitByIP.mockResolvedValue({ success: true }); mocks.checkRateLimitByUser.mockResolvedValue({ success: true });
  });
  it('requires authentication before URL fetching', async () => {
    mocks.getUserId.mockResolvedValue(null);
    expect((await POST(request({ url: 'https://example.com' }))).status).toBe(401);
    expect(mocks.safeFetchPublicHttps).not.toHaveBeenCalled();
  });
  it('rejects LinkedIn imports without fetching them', async () => {
    const response = await POST(request({ url: 'https://www.linkedin.com/jobs/view/123' }));
    expect(response.status).toBe(400);
    expect(mocks.safeFetchPublicHttps).not.toHaveBeenCalled();
  });
});
