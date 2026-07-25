import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  limit: vi.fn(),
  fixedWindow: vi.fn(() => ({ algorithm: 'fixed-window' })),
  fromEnv: vi.fn(() => ({ redis: true })),
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class RatelimitMock {
    static fixedWindow = mocks.fixedWindow;
    limit = mocks.limit;
  },
}));
vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: mocks.fromEnv },
}));

import {
  AUTH_RATE_LIMIT,
  checkRateLimit,
  checkRateLimitByIP,
} from './api-rate-limit';

describe('durable authentication rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    mocks.limit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: 1_800_000_000_000,
    });
  });

  it('uses the shared Redis limiter for an IP identity', async () => {
    const request = new NextRequest('https://www.trackmyopt.com/api/login', {
      headers: { 'x-forwarded-for': '203.0.113.8, 10.0.0.1' },
    });

    const result = await checkRateLimitByIP(request, AUTH_RATE_LIMIT);

    expect(mocks.fromEnv).toHaveBeenCalled();
    expect(mocks.fixedWindow).toHaveBeenCalledWith(5, '900 s');
    expect(mocks.limit).toHaveBeenCalledWith('203.0.113.8');
    expect(result).toMatchObject({
      success: true,
      remaining: 4,
      reset: 1_800_000_000,
    });
  });

  it('fails closed in production when durable storage is unavailable', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.stubEnv('NODE_ENV', 'production');

    try {
      const result = await checkRateLimit('account:person@example.com', {
        limit: 5,
        windowSeconds: 900,
        name: 'auth-account',
      });

      expect(result.success).toBe(false);
      expect(result.unavailable).toBe(true);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
