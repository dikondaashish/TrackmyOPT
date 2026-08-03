import type { PromoCheckoutMode } from "@/lib/premium/promo-checkout-types";

/**
 * Maps UI promo state to POST /api/premium/create-checkout body:
 * - default: omit `promoCode` → server auto-applies plan EARLYBIRD
 * - none: `promoCode: null` → no discount
 * - custom: `promoCode: string` (trimmed) or null if empty
 */
export function buildPromoCheckoutBody(
  mode: PromoCheckoutMode,
  customPromoInput: string
): { promoCode?: string | null } {
  if (mode === "none") return { promoCode: null };
  if (mode === "custom") {
    const t = customPromoInput.trim();
    return t ? { promoCode: t } : { promoCode: null };
  }
  return {};
}
