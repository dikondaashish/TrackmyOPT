import type { PostHogEventProperties } from "@/lib/posthog-server";

/** Idempotent PostHog billing event key — one event per Stripe event id. */
export function billingInsertId(event: string, id: string): string {
  return `${event}:${id}`;
}

export type PaymentSucceededCapture = PostHogEventProperties & {
  $insert_id: string;
  plan_tier: string;
  interval?: string;
  amount_cents: number;
  currency: string;
  is_upgrade: boolean;
};

export function buildPaymentSucceededCapture(input: {
  stripeEventId: string;
  planTier: string;
  interval?: string;
  amountCents: number;
  currency: string;
  isUpgrade?: boolean;
}): PaymentSucceededCapture {
  return {
    $insert_id: billingInsertId("payment_succeeded", input.stripeEventId),
    plan_tier: input.planTier,
    ...(input.interval ? { interval: input.interval } : {}),
    amount_cents: input.amountCents,
    currency: input.currency,
    is_upgrade: input.isUpgrade ?? false,
  };
}
