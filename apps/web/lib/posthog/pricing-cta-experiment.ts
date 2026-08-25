export const PRICING_CTA_EXPERIMENT_FLAG = "pricing-cta-experiment";

export type PricingCtaVariant = "control" | "urgency";

const PRICING_CTA_COPY: Record<PricingCtaVariant, string> = {
  control: "Get Pro",
  urgency: "Start tracking before your deadline",
};

export function normalizePricingCtaVariant(
  raw: string | boolean | undefined | null
): PricingCtaVariant {
  if (raw === "urgency") return "urgency";
  return "control";
}

export function getPricingCtaCopy(variant: PricingCtaVariant): string {
  return PRICING_CTA_COPY[variant];
}
