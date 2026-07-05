export const ONBOARDING_RECEIPT_VARIANT_FLAG = "onboarding-receipt-variant";

export type OnboardingReceiptVariant = "control" | "deferred" | "required";

export function normalizeOnboardingReceiptVariant(
  raw: string | boolean | undefined | null
): OnboardingReceiptVariant {
  if (raw === "deferred" || raw === "required") return raw;
  return "control";
}

export function isReceiptStepSkippable(variant: OnboardingReceiptVariant): boolean {
  return variant !== "required";
}

export function shouldDeferReceiptStep(variant: OnboardingReceiptVariant): boolean {
  return variant === "deferred";
}
