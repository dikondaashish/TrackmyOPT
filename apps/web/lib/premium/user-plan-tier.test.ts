import { describe, expect, it } from 'vitest';

import { resolveActivePlanTier } from './user-plan-tier';

const now = new Date('2026-07-25T12:00:00.000Z');

describe('active user plan tier', () => {
  it('treats inactive or expired profiles as Free', () => {
    expect(
      resolveActivePlanTier(
        {
          premium_status: false,
          plan_tier: 'pro',
          subscription_expires_at: '2026-08-25T12:00:00.000Z',
        },
        now,
      ),
    ).toBe('free');
    expect(
      resolveActivePlanTier(
        {
          premium_status: true,
          plan_tier: 'pro',
          subscription_expires_at: '2026-07-24T12:00:00.000Z',
        },
        now,
      ),
    ).toBe('free');
  });

  it('preserves active Pro and legacy Dedicated access', () => {
    expect(
      resolveActivePlanTier(
        {
          premium_status: true,
          plan_tier: 'pro',
          subscription_expires_at: '2026-08-25T12:00:00.000Z',
        },
        now,
      ),
    ).toBe('pro');
    expect(
      resolveActivePlanTier(
        {
          premium_status: true,
          plan_tier: 'dedicated',
          subscription_expires_at: null,
        },
        now,
      ),
    ).toBe('dedicated');
  });
});
