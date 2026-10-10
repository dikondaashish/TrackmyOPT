import { createHash } from 'node:crypto';
import type Stripe from 'stripe';
import { captureServerEvent } from '@/lib/posthog-server';
import { billingInsertId } from './billing-analytics';
import { normalizeProCheckoutSource } from './pro-conversion';

/** PostHog deduplicates UUID + event + distinct ID + timestamp, not insert_id alone. */
export function stableBillingCaptureIdentity(key: string, occurredAt: number) {
  const bytes = createHash('sha1')
    .update(`trackmyopt-billing:${key}`)
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return {
    uuid: `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`,
    timestamp: new Date(occurredAt * 1000),
  };
}

/** Works with both legacy Stripe invoices and the current parent schema. */
export function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const legacy = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };
  const ref =
    invoice.parent?.subscription_details?.subscription ?? legacy.subscription;
  return typeof ref === 'string' ? ref : (ref?.id ?? null);
}

/** Call only after Stripe verification and successful entitlement application.
 * Session identity deduplicates webhook retries and the authenticated confirm path.
 * Deliberately independent of a pending/succeeded payment_transactions row.
 */
export async function captureVerifiedProIntro(
  userId: string,
  session: Stripe.Checkout.Session,
  stripe: Stripe
) {
  if (
    session.mode !== 'subscription' ||
    session.status !== 'complete' ||
    session.payment_status !== 'paid' ||
    session.metadata?.planId !== 'pro' ||
    session.metadata?.include_pro_intro !== 'true' ||
    session.amount_total !== 99 ||
    session.currency !== 'usd' ||
    !session.livemode
  )
    return;
  // Invoice paid_at is identical in both the webhook and confirmation paths.
  let invoice: Stripe.Invoice;
  try {
    if (!session.invoice) return;
    invoice =
      typeof session.invoice === 'string'
        ? await stripe.invoices.retrieve(session.invoice)
        : session.invoice;
  } catch {
    // Reporting must not interfere with an already verified entitlement.
    return;
  }
  const paidAt = invoice.status_transitions?.paid_at;
  if (
    invoice.status !== 'paid' ||
    invoice.amount_paid !== 99 ||
    invoice.currency !== 'usd' ||
    !paidAt
  )
    return;
  await captureServerEvent(
    userId,
    'pro_paid_intro_started',
    {
      $insert_id: billingInsertId('pro_paid_intro_started', session.id),
      amount_cents: 99,
      currency: 'usd',
      plan_tier: 'pro',
      had_paid_intro: true,
      interval: session.metadata?.interval,
      source: normalizeProCheckoutSource(session.metadata?.checkout_source),
      verified_by: 'stripe',
    },
    stableBillingCaptureIdentity(`pro_paid_intro_started:${session.id}`, paidAt)
  );
}

/** First post-intro period, not webhook arrival time: safe for delayed retries. */
export function isFirstProIntroRenewal(
  invoice: Stripe.Invoice,
  subscription: Stripe.Subscription
): boolean {
  return (
    subscription.metadata?.include_pro_intro === 'true' &&
    invoice.billing_reason === 'subscription_cycle' &&
    typeof subscription.trial_end === 'number' &&
    invoice.lines.data.some(
      (line) => line.period.start === subscription.trial_end
    )
  );
}

export async function captureVerifiedProRenewal(
  userId: string,
  invoice: Stripe.Invoice,
  subscription: Stripe.Subscription
) {
  if (
    !invoice.livemode ||
    invoice.status !== 'paid' ||
    invoice.amount_paid <= 0 ||
    invoice.billing_reason !== 'subscription_cycle' ||
    subscription.metadata?.planId !== 'pro' ||
    !invoice.status_transitions?.paid_at
  )
    return;
  const properties = {
    amount_cents: invoice.amount_paid,
    currency: invoice.currency,
    plan_tier: 'pro',
    interval: subscription.metadata?.interval,
    source: normalizeProCheckoutSource(subscription.metadata?.checkout_source),
    had_paid_intro: subscription.metadata?.include_pro_intro === 'true',
    verified_by: 'stripe',
  };
  await captureServerEvent(
    userId,
    'pro_subscription_renewed',
    {
      ...properties,
      $insert_id: billingInsertId('pro_subscription_renewed', invoice.id),
    },
    stableBillingCaptureIdentity(
      `pro_subscription_renewed:${invoice.id}`,
      invoice.status_transitions.paid_at
    )
  );
  if (isFirstProIntroRenewal(invoice, subscription)) {
    await captureServerEvent(
      userId,
      'pro_paid_intro_renewed',
      {
        ...properties,
        $insert_id: billingInsertId('pro_paid_intro_renewed', subscription.id),
      },
      stableBillingCaptureIdentity(
        `pro_paid_intro_renewed:${subscription.id}`,
        invoice.status_transitions.paid_at
      )
    );
  }
}

/** Count a cancellation request when renewal is disabled, without waiting for access to end. */
export async function captureProIntroCancellation(
  userId: string,
  subscription: Stripe.Subscription
) {
  if (
    !subscription.livemode ||
    !subscription.cancel_at_period_end ||
    !subscription.canceled_at ||
    subscription.metadata?.planId !== 'pro' ||
    subscription.metadata?.include_pro_intro !== 'true'
  )
    return;
  const key = `pro_intro_cancellation_requested:${subscription.id}:${subscription.canceled_at}`;
  await captureServerEvent(
    userId,
    'pro_intro_cancellation_requested',
    {
      $insert_id: key,
      plan_tier: 'pro',
      had_paid_intro: true,
      during_intro: subscription.status === 'trialing',
      source: normalizeProCheckoutSource(
        subscription.metadata?.checkout_source
      ),
      verified_by: 'stripe',
    },
    stableBillingCaptureIdentity(key, subscription.canceled_at)
  );
}
