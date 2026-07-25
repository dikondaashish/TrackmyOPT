import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const checkRateLimit = vi.hoisted(() => vi.fn());

vi.mock('./api-rate-limit', () => ({ checkRateLimit }));

import rateLimit from './rate-limit';

describe('legacy rate-limit adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: 1_800_000_000,
    });
  });

  it('delegates to the durable shared limiter instead of process memory', async () => {
    const limiter = rateLimit({ interval: 60_000, name: 'contact' });
    const request = new NextRequest('https://www.trackmyopt.com/api/contact');

    await expect(limiter.check(request, 5, 'contact:203.0.113.8')).resolves.toEqual({
      isRateLimited: false,
      currentUsage: 1,
      limit: 5,
      remaining: 4,
      reset: 1_800_000_000,
      unavailable: false,
    });
    expect(checkRateLimit).toHaveBeenCalledWith('contact:203.0.113.8', {
      limit: 5,
      windowSeconds: 60,
      name: 'contact',
    });
  });

  it('marks a durable store outage as unavailable and rate limited', async () => {
    checkRateLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: 1_800_000_000,
      unavailable: true,
    });
    const limiter = rateLimit({ interval: 60_000, name: 'contact' });

    await expect(
      limiter.check(
        new NextRequest('https://www.trackmyopt.com/api/contact'),
        5,
        'contact:203.0.113.8',
      ),
    ).resolves.toMatchObject({
      isRateLimited: true,
      unavailable: true,
    });
  });
});
