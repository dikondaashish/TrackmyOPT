import { RESUME_CREDIT_PACK } from '@/lib/pricing/plan-config';

export const RESUME_CREDIT_PRICE_CENTS = Math.round(
  RESUME_CREDIT_PACK.priceUsd * 100
);
/** Stable Stripe lookup key; avoids environment-specific Price-ID drift. */
export const RESUME_CREDIT_PRICE_LOOKUP_KEY = 'trackmyopt_resume_credit_usd_1';
export const RESUME_CREDIT_MIN_DOLLARS = RESUME_CREDIT_PACK.minDollarAmount;
export const RESUME_CREDIT_MAX_DOLLARS = RESUME_CREDIT_PACK.maxDollarAmount;

export function isAllowedResumeCreditPackQuantity(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= RESUME_CREDIT_MIN_DOLLARS &&
    value <= RESUME_CREDIT_MAX_DOLLARS
  );
}

export function creditsForPackQuantity(quantity: number): number {
  return quantity * RESUME_CREDIT_PACK.creditsPerPack;
}
