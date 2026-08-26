import { describe, expect, it } from 'vitest';

import { buildPromoCheckoutBody } from './checkout-promo-payload';

describe('buildPromoCheckoutBody', () => {
  it('keeps a code entered before Apply so checkout receives the full code', () => {
    expect(
      buildPromoCheckoutBody('custom-entry', ' TRACKMYOPT-DEDICATED-OFFER ')
    ).toEqual({ promoCode: 'TRACKMYOPT-DEDICATED-OFFER' });
  });

  it('omits promoCode for the automatic limited-time offer', () => {
    expect(buildPromoCheckoutBody('default', '')).toEqual({});
  });
});
