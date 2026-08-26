import { describe, expect, it } from 'vitest';

import {
  LIMITED_TIME_OFFER,
  PLAN_LIST_PRICES,
  PLAN_PRICES,
  annualSavingsPercent,
  calculateDiscountedPriceCents,
} from './plan-config';

describe('commercial pricing contract', () => {
  it('keeps the undiscounted Stripe catalog prices separate from the offer', () => {
    expect(PLAN_LIST_PRICES).toEqual({
      free: { month: 0, year: 0 },
      pro: { month: 7.99, year: 79.99 },
      dedicated: { month: 19.99, year: 199.99 },
    });
  });

  it('publishes the exact limited-time prices customers pay', () => {
    expect(PLAN_PRICES).toEqual({
      free: { month: 0, year: 0 },
      pro: { month: 4.99, year: 49.99 },
      dedicated: { month: 14.99, year: 149.99 },
    });
  });

  it.each([
    ['pro monthly', 799, LIMITED_TIME_OFFER.pro.percentOff, 499],
    ['pro yearly', 7999, LIMITED_TIME_OFFER.pro.percentOff, 4999],
    ['dedicated monthly', 1999, LIMITED_TIME_OFFER.dedicated.percentOff, 1499],
    ['dedicated yearly', 19999, LIMITED_TIME_OFFER.dedicated.percentOff, 14999],
  ])(
    'calculates the exact %s checkout amount',
    (_label, listCents, percentOff, expected) => {
      expect(calculateDiscountedPriceCents(listCents, percentOff)).toBe(
        expected
      );
    }
  );

  it('shows a real annual discount instead of a negative saving', () => {
    expect(annualSavingsPercent('pro')).toBe(17);
  });
});
