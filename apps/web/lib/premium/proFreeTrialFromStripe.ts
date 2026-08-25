import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

export function getProStripePriceIdSet(): Set<string> {
  return new Set(
    [process.env.STRIPE_PRICE_PRO_MONTHLY, process.env.STRIPE_PRICE_PRO_YEARLY].filter(
      (id): id is string => Boolean(id && id.length > 0),
    ),
  );
}

/**
 * True if this subscription is (or was) a Pro plan — by Stripe price IDs or checkout metadata.
 */
export function stripeSubscriptionUsesProPrice(
  subscription: Stripe.Subscription,
  proPriceIds: Set<string>,
): boolean {
  const metaPlan = String(subscription.metadata?.planId || "").toLowerCase();
  if (metaPlan === "pro") return true;
  if (!proPriceIds.size) return false;
  for (const item of subscription.items?.data ?? []) {
    const raw = item.price;
    const priceId = typeof raw === "string" ? raw : raw?.id;
    if (priceId && proPriceIds.has(priceId)) return true;
  }
  return false;
}

/**
 * If Stripe shows any Pro subscription history for this customer, persist pro_free_trial_consumed.
 * @returns true if the flag is now consumed (was already set or was set by this call).
 */
export async function syncProFreeTrialConsumedFromStripe(args: {
  stripe: Stripe;
  supabase: SupabaseClient;
  userId: string;
  customerId: string;
}): Promise<boolean> {
  const { stripe, supabase, userId, customerId } = args;
  const proPriceIds = getProStripePriceIdSet();
  let startingAfter: string | undefined;

  for (;;) {
    const page = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const sub of page.data) {
      if (stripeSubscriptionUsesProPrice(sub, proPriceIds)) {
        await supabase.from("profiles").update({ pro_free_trial_consumed: true }).eq("user_id", userId);
        return true;
      }
    }

    if (!page.has_more || page.data.length === 0) break;
    startingAfter = page.data[page.data.length - 1]!.id;
  }

  return false;
}
