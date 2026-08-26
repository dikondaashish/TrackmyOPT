import type { PromoCheckoutMode } from '@/lib/premium/promoCheckoutTypes';

/**
 * Maps UI promo state to POST /api/premium/create-checkout body:
 * - default: omit `promoCode` → server auto-applies the validated limited-time offer
 * - none: `promoCode: null` → server returns to the limited-time offer
 * - custom-entry/custom: `promoCode: string` (trimmed) or null if empty
 */
export function buildPromoCheckoutBody(
  mode: PromoCheckoutMode,
  customPromoInput: string
): { promoCode?: string | null } {
  if (mode === 'none') return { promoCode: null };
  if (mode === 'custom-entry' || mode === 'custom') {
    const t = customPromoInput.trim();
    return t ? { promoCode: t } : { promoCode: null };
  }
  return {};
}
