/**
 * Cancels all non-terminal Stripe subscriptions for a customer.
 * Used when a user deletes their account so they are not charged after leaving the platform.
 */

import type Stripe from "stripe";

/** Subscription statuses that should be canceled immediately on account deletion */
const CANCELLABLE_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "paused",
  "incomplete",
]);

export async function cancelStripeSubscriptionsForCustomer(
  stripe: Stripe,
  customerId: string
): Promise<{ cancelledIds: string[] }> {
  const cancelledIds: string[] = [];

  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });

  for (const sub of subs.data) {
    if (!CANCELLABLE_STATUSES.has(sub.status)) continue;
    const cancelled = await stripe.subscriptions.cancel(sub.id);
    cancelledIds.push(cancelled.id);
  }

  return { cancelledIds };
}
