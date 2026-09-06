import Stripe from 'stripe';
import { sanitizeError, secureLog } from '@/lib/secure-logger';
import {
  LIMITED_TIME_OFFER,
  PLAN_LIST_PRICES,
  PLAN_PRICES,
  calculateDiscountedPriceCents,
} from '@/lib/pricing/plan-config';

export type PlanId = 'pro' | 'dedicated';

export function isUsableCoupon(
  coupon: Stripe.Coupon | Stripe.DeletedCoupon | null
): coupon is Stripe.Coupon {
  return coupon != null && coupon.deleted !== true;
}

export async function validateConfiguredPrice(
  stripe: Stripe,
  priceId: string,
  planId: PlanId,
  interval: 'month' | 'year'
): Promise<Stripe.Price> {
  const price = await stripe.prices.retrieve(priceId);
  const expectedAmount = Math.round(PLAN_LIST_PRICES[planId][interval] * 100);
  if (
    !price.active ||
    price.currency.toLowerCase() !== 'usd' ||
    price.unit_amount !== expectedAmount ||
    price.recurring?.interval !== interval
  ) {
    throw new Error(
      `Stripe Price ${priceId} does not match ${planId}/${interval}: expected USD ${expectedAmount} cents recurring ${interval}.`
    );
  }
  return price;
}

export async function validateConfiguredOneTimePrice(
  stripe: Stripe,
  priceId: string,
  expectedAmountCents: number
): Promise<void> {
  const price = await stripe.prices.retrieve(priceId);
  if (
    !price.active ||
    price.currency.toLowerCase() !== 'usd' ||
    price.unit_amount !== expectedAmountCents ||
    price.recurring != null
  ) {
    throw new Error(
      `Stripe Price ${priceId} must be an active one-time USD ${expectedAmountCents}-cent Price.`
    );
  }
}

export async function createBillingPortalUrl(
  stripe: Stripe,
  customerId: string,
  origin: string
): Promise<string | null> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/settings?tab=subscription`,
    });
    return session.url;
  } catch {
    return null;
  }
}

/**
 * Resolves discounts + stable key for session reuse.
 * promoCode: undefined/null/blank = configured limited-time offer.
 * A non-blank string replaces it with an active customer-facing promotion code.
 */
export async function resolveCheckoutPromotion(
  stripe: Stripe,
  planId: PlanId,
  interval: 'month' | 'year',
  recurringPrice: Stripe.Price,
  promoCode: unknown
): Promise<
  | {
      ok: true;
      discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
      checkoutPromoKey: string;
    }
  | { ok: false; error: string; status: 400 | 503 }
> {
  if (typeof promoCode === 'string') {
    const trimmed = promoCode.trim();
    if (trimmed)
      try {
        const codes = await stripe.promotionCodes.list({
          code: trimmed,
          active: true,
          limit: 1,
        });
        if (!codes.data.length) {
          return { ok: false, error: 'Invalid promo code', status: 400 };
        }
        const promoId = codes.data[0].id;
        return {
          ok: true,
          discounts: [{ promotion_code: promoId }],
          checkoutPromoKey: `custom:${promoId}`,
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Invalid promo code';
        return { ok: false, error: msg, status: 400 };
      }
  }

  try {
    const stableCodes = await stripe.promotionCodes.list({
      code: LIMITED_TIME_OFFER[planId].promotionCode,
      active: true,
      limit: 1,
    });
    const stablePromotion = stableCodes.data[0];
    if (!stablePromotion) {
      throw new Error(
        `No active ${LIMITED_TIME_OFFER[planId].promotionCode} promotion code.`
      );
    }
    // `applies_to` is omitted by Stripe unless explicitly expanded. We need it
    // below to guarantee that the configured offer is restricted to this plan.
    const coupon = await stripe.coupons.retrieve(
      LIMITED_TIME_OFFER[planId].couponId,
      { expand: ['applies_to'] }
    );
    const productId =
      typeof recurringPrice.product === 'string'
        ? recurringPrice.product
        : recurringPrice.product.id;
    const expectedPercentOff = LIMITED_TIME_OFFER[planId].percentOff;
    const expectedOfferCents = Math.round(PLAN_PRICES[planId][interval] * 100);
    const promotionCouponId =
      typeof stablePromotion.promotion.coupon === 'string'
        ? stablePromotion.promotion.coupon
        : stablePromotion.promotion.coupon?.id;
    const actualOfferCents =
      isUsableCoupon(coupon) &&
      coupon.percent_off != null &&
      recurringPrice.unit_amount != null
        ? calculateDiscountedPriceCents(
            recurringPrice.unit_amount,
            coupon.percent_off
          )
        : null;

    if (
      !stablePromotion.active ||
      !isUsableCoupon(coupon) ||
      !coupon.valid ||
      coupon.duration !== 'forever' ||
      coupon.percent_off !== expectedPercentOff ||
      promotionCouponId !== LIMITED_TIME_OFFER[planId].couponId ||
      actualOfferCents !== expectedOfferCents ||
      !coupon.applies_to?.products.includes(productId) ||
      stablePromotion.restrictions.first_time_transaction
    ) {
      throw new Error(
        `Stable ${planId} promotion does not match the configured limited-time offer.`
      );
    }
    return {
      ok: true,
      discounts: [{ promotion_code: stablePromotion.id }],
      checkoutPromoKey: `default:${planId}:${stablePromotion.id}`,
    };
  } catch (error) {
    secureLog.error(
      'Stripe limited-time promotion validation failed:',
      sanitizeError(error)
    );
  }

  return {
    ok: false,
    error:
      'The limited-time offer is temporarily unavailable. Please contact support.',
    status: 503,
  };
}
