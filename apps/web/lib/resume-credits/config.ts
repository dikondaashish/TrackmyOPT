import { RESUME_CREDIT_PACK } from "@/lib/pricing/plan-config";

export const RESUME_CREDIT_PRICE_CENTS = Math.round(
  RESUME_CREDIT_PACK.priceUsd * 100
);

export function isAllowedResumeCreditPackQuantity(
  value: number
): value is (typeof RESUME_CREDIT_PACK.allowedPackQuantities)[number] {
  return RESUME_CREDIT_PACK.allowedPackQuantities.some(
    (quantity) => quantity === value
  );
}

export function creditsForPackQuantity(quantity: number): number {
  return quantity * RESUME_CREDIT_PACK.creditsPerPack;
}
