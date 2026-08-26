/**
 * Canonical Stripe subscription listing, ranking, profile sync, and duplicate cleanup.
 * Used by create-checkout upgrades, webhooks, and admin scripts.
 *
 * TODO: Add profiles.stripe_subscription_id (+ billing_status, trial_ends_at) via migration
 * for faster lookups; today we list Stripe subscriptions per reconcile.
 */

import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { secureLog, logIdPrefix } from '@/lib/secure-logger';

export type PlanId = 'pro' | 'dedicated';
export type BillingInterval = 'month' | 'year';

/** Statuses that may grant product access (matches webhook dunning behavior). */
const ACCESS_GRANTING_STATUSES = new Set(['active', 'trialing', 'past_due']);

const CANCELLABLE_STATUSES = new Set([
  'active',
  'trialing',
  'past_due',
  'unpaid',
  'paused',
  'incomplete',
]);

const STATUS_RANK: Record<string, number> = {
  active: 0,
  trialing: 1,
  past_due: 2,
};

function getStripePriceIdMap(): Record<
  PlanId,
  { month?: string; year?: string }
> {
  return {
    pro: {
      month: process.env.STRIPE_PRICE_PRO_MONTHLY,
      year: process.env.STRIPE_PRICE_PRO_YEARLY,
    },
    dedicated: {
      month: process.env.STRIPE_PRICE_DEDICATED_MONTHLY,
      year: process.env.STRIPE_PRICE_DEDICATED_YEARLY,
    },
  };
}

export function getPlanFromStripePriceId(
  priceId: string | null | undefined
): PlanId | null {
  if (!priceId) return null;
  const map = getStripePriceIdMap();
  for (const plan of ['pro', 'dedicated'] as const) {
    if (map[plan].month === priceId || map[plan].year === priceId) return plan;
  }
  return null;
}

export function getTierRank(planTier: string | null | undefined): number {
  const t = String(planTier || '').toLowerCase();
  if (t === 'dedicated') return 2;
  if (t === 'pro') return 1;
  return 0;
}

export function getPlanFromSubscription(
  subscription: Stripe.Subscription
): PlanId {
  const item = subscription.items?.data?.[0];
  const raw = item?.price;
  const priceId = typeof raw === 'string' ? raw : raw?.id;
  const fromPrice = getPlanFromStripePriceId(priceId);
  if (fromPrice) return fromPrice;

  const meta = String(subscription.metadata?.planId || '').toLowerCase();
  if (meta === 'dedicated' || meta === 'pro') return meta;
  return 'pro';
}

export function subscriptionHasPendingUpdate(
  subscription: Stripe.Subscription
): boolean {
  const pending = (
    subscription as Stripe.Subscription & { pending_update?: unknown }
  ).pending_update;
  return pending != null && typeof pending === 'object';
}

export function isValidAccessSubscription(
  subscription: Stripe.Subscription
): boolean {
  return ACCESS_GRANTING_STATUSES.has(subscription.status);
}

export function subscriptionCanGrantTargetPlan(
  subscription: Stripe.Subscription,
  targetPlan?: PlanId
): boolean {
  if (!isValidAccessSubscription(subscription)) return false;
  if (subscriptionHasPendingUpdate(subscription)) return false;

  const plan = getPlanFromSubscription(subscription);
  if (plan === 'dedicated' && subscription.status !== 'active') {
    return false;
  }

  if (!targetPlan) return true;
  return getTierRank(plan) >= getTierRank(targetPlan);
}

export function compareSubscriptions(
  a: Stripe.Subscription,
  b: Stripe.Subscription
): number {
  const planA = getPlanFromSubscription(a);
  const planB = getPlanFromSubscription(b);
  const tierDiff = getTierRank(planB) - getTierRank(planA);
  if (tierDiff !== 0) return tierDiff;

  const statusDiff =
    (STATUS_RANK[a.status] ?? 99) - (STATUS_RANK[b.status] ?? 99);
  if (statusDiff !== 0) return statusDiff;

  const endA =
    (a as Stripe.Subscription & { current_period_end?: number })
      .current_period_end ?? 0;
  const endB =
    (b as Stripe.Subscription & { current_period_end?: number })
      .current_period_end ?? 0;
  return endB - endA;
}

export function pickBestSubscription(
  subscriptions: Stripe.Subscription[]
): Stripe.Subscription | null {
  const grantable = subscriptions.filter((s) =>
    subscriptionCanGrantTargetPlan(s)
  );
  if (!grantable.length) return null;
  return [...grantable].sort(compareSubscriptions)[0] ?? null;
}

export async function listValidCustomerSubscriptions(
  stripe: Stripe,
  customerId: string,
  options?: { excludeSubscriptionId?: string }
): Promise<Stripe.Subscription[]> {
  const exclude = options?.excludeSubscriptionId;
  const out: Stripe.Subscription[] = [];
  let startingAfter: string | undefined;

  for (;;) {
    const page = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const sub of page.data) {
      if (exclude && sub.id === exclude) continue;
      if (isValidAccessSubscription(sub)) out.push(sub);
    }

    if (!page.has_more || !page.data.length) break;
    startingAfter = page.data[page.data.length - 1]!.id;
  }

  return out;
}

function getSubscriptionPeriodEndIso(
  subscription: Stripe.Subscription
): string {
  const end = (
    subscription as Stripe.Subscription & { current_period_end?: number }
  ).current_period_end;
  if (typeof end === 'number') {
    return new Date(end * 1000).toISOString();
  }
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 32);
  return fallback.toISOString();
}

export async function syncProfileFromSubscription(args: {
  supabase: SupabaseClient;
  userId: string;
  customerId: string;
  subscription: Stripe.Subscription;
}): Promise<{ ok: boolean; planTier: PlanId }> {
  const { supabase, userId, customerId, subscription } = args;
  if (!subscriptionCanGrantTargetPlan(subscription)) {
    return { ok: false, planTier: getPlanFromSubscription(subscription) };
  }

  const planTier = getPlanFromSubscription(subscription);
  const expiresAt = getSubscriptionPeriodEndIso(subscription);

  const { error } = await supabase
    .from('profiles')
    .update({
      premium_status: true,
      premium_purchased_at: new Date().toISOString(),
      stripe_customer_id: customerId,
      plan_tier: planTier,
      subscription_expires_at: expiresAt,
      ...(planTier === 'pro' ? { pro_free_trial_consumed: true } : {}),
    })
    .eq('user_id', userId);

  if (error) {
    secureLog.error(
      'syncProfileFromSubscription failed:',
      error.message,
      logIdPrefix(userId)
    );
    return { ok: false, planTier };
  }

  return { ok: true, planTier };
}

export async function cancelOtherCustomerSubscriptions(args: {
  stripe: Stripe;
  customerId: string;
  keepSubscriptionId: string;
  reason?: string;
}): Promise<string[]> {
  const { stripe, customerId, keepSubscriptionId, reason } = args;
  const cancelled: string[] = [];

  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 100,
  });

  for (const sub of subs.data) {
    if (sub.id === keepSubscriptionId) continue;
    if (!CANCELLABLE_STATUSES.has(sub.status)) continue;
    try {
      await stripe.subscriptions.cancel(sub.id, {
        cancellation_details: reason
          ? { comment: reason.slice(0, 500) }
          : undefined,
      });
      cancelled.push(sub.id);
      secureLog.info(
        `cancelOtherCustomerSubscriptions: canceled ${logIdPrefix(sub.id)} (kept ${logIdPrefix(keepSubscriptionId)})`
      );
    } catch (e) {
      secureLog.warn(
        `cancelOtherCustomerSubscriptions: failed to cancel ${sub.id}`,
        e
      );
    }
  }

  return cancelled;
}

type ReconcileResult =
  | { action: 'synced'; planTier: PlanId; subscriptionId: string }
  | { action: 'revoked' }
  | { action: 'unchanged' };

/**
 * Pick best remaining subscription for a customer and sync profile, or revoke if none.
 */
export async function reconcileCustomerBilling(args: {
  stripe: Stripe;
  supabase: SupabaseClient;
  customerId: string;
  userId: string;
  excludeSubscriptionId?: string;
  cancelDuplicates?: boolean;
}): Promise<ReconcileResult> {
  const {
    stripe,
    supabase,
    customerId,
    userId,
    excludeSubscriptionId,
    cancelDuplicates,
  } = args;

  const subs = await listValidCustomerSubscriptions(stripe, customerId, {
    excludeSubscriptionId,
  });
  const best = pickBestSubscription(subs);
  const hasPendingOnly =
    !best &&
    subs.some(
      (s) => isValidAccessSubscription(s) && subscriptionHasPendingUpdate(s)
    );

  if (hasPendingOnly) {
    return { action: 'unchanged' };
  }

  if (!best) {
    const { error } = await supabase
      .from('profiles')
      .update({
        premium_status: false,
        plan_tier: null,
      })
      .eq('stripe_customer_id', customerId);

    if (error) {
      secureLog.error('reconcileCustomerBilling revoke failed:', error.message);
      throw new Error(`Billing revocation failed: ${error.message}`);
    }
    return { action: 'revoked' };
  }

  const sync = await syncProfileFromSubscription({
    supabase,
    userId,
    customerId,
    subscription: best,
  });

  if (cancelDuplicates) {
    await cancelOtherCustomerSubscriptions({
      stripe,
      customerId,
      keepSubscriptionId: best.id,
      reason: 'duplicate_subscription_cleanup',
    });
  }

  if (!sync.ok) {
    throw new Error('Billing profile synchronization failed');
  }

  return { action: 'synced', planTier: sync.planTier, subscriptionId: best.id };
}

type InvoiceWithPaymentIntent = Stripe.Invoice & {
  payment_intent?: string | Stripe.PaymentIntent | null;
};

function extractPaymentIntentClientSecret(
  subscription: Stripe.Subscription
): string | null {
  const inv = subscription.latest_invoice;
  if (!inv || typeof inv !== 'object') return null;
  const pi = (inv as InvoiceWithPaymentIntent).payment_intent;
  if (!pi || typeof pi !== 'object') return null;
  const secret = (pi as Stripe.PaymentIntent).client_secret;
  return typeof secret === 'string' ? secret : null;
}

function extractHostedInvoiceUrl(
  subscription: Stripe.Subscription
): string | null {
  const inv = subscription.latest_invoice;
  if (!inv || typeof inv !== 'object') return null;
  const url = (inv as Stripe.Invoice).hosted_invoice_url;
  return typeof url === 'string' ? url : null;
}

type UpgradeDedicatedResult =
  | { outcome: 'active'; subscriptionId: string; planTier: 'dedicated' }
  | {
      outcome: 'payment_action_required';
      message: string;
      clientSecret: string | null;
      hostedInvoiceUrl: string | null;
    }
  | {
      outcome: 'payment_required';
      message: string;
      hostedInvoiceUrl: string | null;
    };

/**
 * Upgrade an existing Pro subscription to Dedicated (same subscription id).
 */
export async function upgradeProSubscriptionToDedicated(args: {
  stripe: Stripe;
  supabase: SupabaseClient;
  userId: string;
  customerId: string;
  existingSubscriptionId: string;
  dedicatedPriceId: string;
  promotionCodeId: string;
  interval: BillingInterval;
}): Promise<UpgradeDedicatedResult> {
  const {
    stripe,
    supabase,
    userId,
    customerId,
    existingSubscriptionId,
    dedicatedPriceId,
    promotionCodeId,
    interval,
  } = args;

  const subscription = await stripe.subscriptions.retrieve(
    existingSubscriptionId,
    {
      expand: ['items.data.price', 'latest_invoice.payment_intent'],
    }
  );

  const existingPlan = getPlanFromSubscription(subscription);
  if (existingPlan !== 'pro') {
    return {
      outcome: 'payment_required',
      message: 'Only an active Pro subscription can be upgraded this way.',
      hostedInvoiceUrl: null,
    };
  }

  if (!isValidAccessSubscription(subscription)) {
    return {
      outcome: 'payment_required',
      message: 'Your Pro subscription is not active. Please contact support.',
      hostedInvoiceUrl: null,
    };
  }

  const subscriptionItem = subscription.items.data[0];
  if (!subscriptionItem?.id) {
    return {
      outcome: 'payment_required',
      message: 'Could not read subscription items. Please contact support.',
      hostedInvoiceUrl: null,
    };
  }

  const updated = await stripe.subscriptions.update(existingSubscriptionId, {
    items: [{ id: subscriptionItem.id, price: dedicatedPriceId }],
    discounts: [{ promotion_code: promotionCodeId }],
    trial_end: subscription.status === 'trialing' ? 'now' : undefined,
    payment_behavior: 'pending_if_incomplete',
    proration_behavior: 'always_invoice',
    metadata: {
      ...subscription.metadata,
      planId: 'dedicated',
      interval,
      upgraded_from: 'pro',
      upgraded_to: 'dedicated',
      supabase_user_id: userId,
    },
    expand: ['latest_invoice.payment_intent'],
  });

  if (subscriptionHasPendingUpdate(updated)) {
    return {
      outcome: 'payment_required',
      message:
        'Payment is required to complete your Dedicated upgrade. Your plan will update once payment succeeds.',
      hostedInvoiceUrl: extractHostedInvoiceUrl(updated),
    };
  }

  const pi = updated.latest_invoice;
  let piStatus: string | undefined;
  if (pi && typeof pi === 'object') {
    const paymentIntent = (pi as InvoiceWithPaymentIntent).payment_intent;
    if (paymentIntent && typeof paymentIntent === 'object') {
      piStatus = (paymentIntent as Stripe.PaymentIntent).status;
    }
  }

  if (piStatus === 'requires_action') {
    return {
      outcome: 'payment_action_required',
      message:
        'Additional authentication is required to complete your Dedicated upgrade. Please complete payment to continue.',
      clientSecret: extractPaymentIntentClientSecret(updated),
      hostedInvoiceUrl: extractHostedInvoiceUrl(updated),
    };
  }

  if (
    updated.status !== 'active' ||
    !subscriptionCanGrantTargetPlan(updated, 'dedicated')
  ) {
    return {
      outcome: 'payment_required',
      message:
        'We could not confirm your Dedicated payment yet. Please update your payment method or try again.',
      hostedInvoiceUrl: extractHostedInvoiceUrl(updated),
    };
  }

  await syncProfileFromSubscription({
    supabase,
    userId,
    customerId,
    subscription: updated,
  });

  await cancelOtherCustomerSubscriptions({
    stripe,
    customerId,
    keepSubscriptionId: updated.id,
    reason: 'pro_to_dedicated_upgrade_success',
  });

  return {
    outcome: 'active',
    subscriptionId: updated.id,
    planTier: 'dedicated',
  };
}

type DowngradeProResult =
  | { outcome: 'active'; subscriptionId: string; planTier: 'pro' }
  | {
      outcome: 'payment_required';
      message: string;
      hostedInvoiceUrl: string | null;
    };

/**
 * Phase 6: move Dedicated subscribers onto Pro (same Stripe subscription id).
 * Credit/proration handled by Stripe; no new checkout session.
 */
export async function downgradeDedicatedSubscriptionToPro(args: {
  stripe: Stripe;
  supabase: SupabaseClient;
  userId: string;
  customerId: string;
  existingSubscriptionId: string;
  proPriceId: string;
  promotionCodeId: string;
  interval: BillingInterval;
}): Promise<DowngradeProResult> {
  const {
    stripe,
    supabase,
    userId,
    customerId,
    existingSubscriptionId,
    proPriceId,
    promotionCodeId,
    interval,
  } = args;

  const subscription = await stripe.subscriptions.retrieve(
    existingSubscriptionId,
    {
      expand: ['items.data.price'],
    }
  );

  const existingPlan = getPlanFromSubscription(subscription);
  if (existingPlan !== 'dedicated') {
    return {
      outcome: 'payment_required',
      message:
        'Only an active Dedicated subscription can switch to Pro this way.',
      hostedInvoiceUrl: null,
    };
  }

  if (!isValidAccessSubscription(subscription)) {
    return {
      outcome: 'payment_required',
      message:
        'Your Dedicated subscription is not active. Please contact support.',
      hostedInvoiceUrl: null,
    };
  }

  const subscriptionItem = subscription.items.data[0];
  if (!subscriptionItem?.id) {
    return {
      outcome: 'payment_required',
      message: 'Could not read subscription items. Please contact support.',
      hostedInvoiceUrl: null,
    };
  }

  const updated = await stripe.subscriptions.update(existingSubscriptionId, {
    items: [{ id: subscriptionItem.id, price: proPriceId }],
    discounts: [{ promotion_code: promotionCodeId }],
    // Credit unused Dedicated time toward Pro; avoid charging immediately on downgrade.
    proration_behavior: 'create_prorations',
    payment_behavior: 'pending_if_incomplete',
    metadata: {
      ...subscription.metadata,
      planId: 'pro',
      interval,
      downgraded_from: 'dedicated',
      downgraded_to: 'pro',
      supabase_user_id: userId,
    },
  });

  if (subscriptionHasPendingUpdate(updated)) {
    return {
      outcome: 'payment_required',
      message:
        'We could not finish switching you to Pro yet. Update your payment method or contact support.',
      hostedInvoiceUrl: extractHostedInvoiceUrl(updated),
    };
  }

  if (!subscriptionCanGrantTargetPlan(updated, 'pro')) {
    return {
      outcome: 'payment_required',
      message:
        'Pro access is not confirmed yet. Please try again or contact support.',
      hostedInvoiceUrl: extractHostedInvoiceUrl(updated),
    };
  }

  await syncProfileFromSubscription({
    supabase,
    userId,
    customerId,
    subscription: updated,
  });

  return {
    outcome: 'active',
    subscriptionId: updated.id,
    planTier: 'pro',
  };
}
