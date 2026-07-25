/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for payment processing
 * Critical events:
 * - checkout.session.completed: Upgrade user to premium
 * - payment_intent.succeeded: Log successful payment
 * - payment_intent.payment_failed: Log failed payment
 * - invoice.payment_failed: Notify user (email_queue)
 * - customer.subscription.updated/deleted: Sync access + transactional email
 * - charge.refunded: Revoke premium + refund acknowledgment email
 *
 * Mandatory billing/entitlement failures must throw so Stripe retries the
 * event. Analytics and email failures remain best-effort.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { sanitizeError, secureLog, logIdPrefix } from '@/lib/secure-logger';
import { applyStripeCheckoutSession } from '@/lib/premium/applyStripeCheckoutSession';
import { requireLiveStripeKeyInProduction } from '@/lib/stripe/requireLiveKeyInProduction';
import {
  cancelOtherCustomerSubscriptions,
  getPlanFromSubscription,
  reconcileCustomerBilling,
  subscriptionHasPendingUpdate,
  syncProfileFromSubscription,
} from '@/lib/premium/stripeSubscriptionSync';
import {
  resolveUserById,
  resolveUserForStripeCustomer,
  sendPaymentFailedEmail,
  sendRefundAcknowledgmentEmail,
  sendSubscriptionEndedEmail,
  sendUnusedCancelWinbackEmail,
  sendTrialEndingEmail,
  sendTrialStartedEmail,
  sendCancellationConfirmedEmail,
  sendSubscriptionReceiptEmail,
} from '@/lib/notifications/transactional-emails';
import { recordBillingConsentEvent } from '@/lib/billing/recordBillingConsent';
import {
  captureServerEvent,
  normalizeBillingInterval,
  normalizePlanTier,
} from '@/lib/posthog-server';
import {
  billingInsertId,
  buildPaymentSucceededCapture,
} from '@/lib/posthog/billing-analytics';
import { syncUserLtvToPostHog } from '@/lib/posthog/ltv-sync';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createBillingPortalUrl(
  stripe: Stripe,
  customerId: string
): Promise<string | null> {
  try {
    const allowedOrigin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://www.trackmyopt.com';
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${allowedOrigin}/dashboard/settings?tab=subscription`,
    });
    return session.url ?? null;
  } catch (e) {
    secureLog.warn('createBillingPortalUrl failed:', sanitizeError(e));
    return null;
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  try {
    if (!session.id) return;
    const { error } = await supabase
      .from('payment_transactions')
      .update({
        status: 'expired',
        failure_reason: 'checkout_session_expired',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_checkout_session_id', session.id)
      .eq('status', 'pending');
    if (error) {
      throw new Error(`checkout.session.expired update failed: ${error.message}`);
    }
  } catch (e) {
    secureLog.error('handleCheckoutSessionExpired:', sanitizeError(e));
    throw e;
  }
}

function getStripe(): Stripe {
  requireLiveStripeKeyInProduction();
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-09-30.clover',
  });
}

async function refreshPostHogLtv(userId: string): Promise<void> {
  try {
    await syncUserLtvToPostHog(supabase, userId);
  } catch (error) {
    secureLog.warn('posthog ltv sync failed', sanitizeError(error));
  }
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    secureLog.error('⚠️ Webhook Error: No Stripe signature header');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    secureLog.error('⚠️ Webhook signature verification failed:', msg);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(stripe, session, event.id);
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(stripe, session, event.id);
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await logPaymentFailure(session);
        await handleAsyncCheckoutPaymentFailed(session, event.id);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionExpired(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await updateTransactionStatus(paymentIntent.id, 'succeeded');
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await updateTransactionStatus(
          paymentIntent.id,
          'failed',
          paymentIntent.last_payment_error?.message
        );
        await handlePaymentIntentPaymentFailed(stripe, paymentIntent, event.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(stripe, invoice, event.id);
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(stripe, invoice, event.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(stripe, charge, event.id);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(stripe, subscription, event.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(stripe, subscription, event.id);
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleTrialWillEnd(subscription, event.id);
        break;
      }

      case 'customer.subscription.pending_update_applied': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionPendingUpdateApplied(stripe, subscription);
        break;
      }

      case 'customer.subscription.pending_update_expired': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionPendingUpdateExpired(stripe, subscription);
        break;
      }

      case 'invoice.payment_action_required': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentActionRequired(stripe, invoice);
        break;
      }

      default:
        // Unknown event type — log for observability so we can add handlers as needed.
        secureLog.info(`ℹ️ Unhandled Stripe event type: ${event.type}`);
    }
  } catch (error: unknown) {
    // Return 5xx so Stripe retries the event instead of silently dropping it.
    secureLog.error(
      `Fatal webhook handler error: eventType=${event.type} eventId=${logIdPrefix(event.id)}`,
      sanitizeError(error),
    );
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

/** Prefer checkout metadata; fall back to profiles.stripe_customer_id for analytics. */
async function resolveCheckoutAnalyticsUserId(
  session: Stripe.Checkout.Session
): Promise<string | null> {
  const meta = session.metadata?.supabase_user_id;
  if (typeof meta === "string" && meta.trim()) return meta.trim();

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (!customerId) return null;

  // Analytics only needs user_id — do not require email (resolveUserForStripeCustomer does).
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return typeof profile?.user_id === "string" && profile.user_id.trim()
    ? profile.user_id.trim()
    : null;
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  stripeEventId: string
) {
  const result = await applyStripeCheckoutSession({ stripe, supabase, session });
  if (!result.ok) {
    secureLog.error('handleCheckoutCompleted failed:', result.reason, {
      sessionId: logIdPrefix(session.id),
      customer: typeof session.customer === 'string' ? logIdPrefix(session.customer) : '(linked)',
      hasMetadataUser: Boolean(session.metadata?.supabase_user_id),
    });
    throw new Error(`Checkout entitlement sync failed: ${result.reason}`);
  }

  try {
    if (result.alreadyRecorded) {
      secureLog.info('checkout session already synced:', logIdPrefix(session.id));
    }

    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const subId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription && typeof session.subscription === 'object'
          ? session.subscription.id
          : null;

    if (customerId && subId) {
      await cancelOtherCustomerSubscriptions({
        stripe,
        customerId,
        keepSubscriptionId: subId,
        reason: 'new_checkout_subscription',
      });
    }

    if (result.alreadyRecorded) {
      return;
    }

    const userId = await resolveCheckoutAnalyticsUserId(session);
    if (!userId) {
      secureLog.warn('checkout analytics skipped: no user for session', {
        sessionId: logIdPrefix(session.id),
      });
      return;
    }

    const planId = session.metadata?.planId || 'pro';
    const billingIntervalLabel =
      session.metadata?.interval === 'month' ? 'monthly' : 'yearly';
    const interval = normalizeBillingInterval(
      session.metadata?.interval === 'month' ? 'month' : 'year'
    );
    const planTier = normalizePlanTier(planId);
    const hadTrialFromCheckout = session.metadata?.include_pro_trial === 'true';

    if (subId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subId);
        if (sub.status === 'trialing') {
          await captureServerEvent(userId, 'trial_started', {
            $insert_id: billingInsertId('trial_started', stripeEventId),
            plan_tier: planTier,
            interval,
            had_trial: true,
            currency: session.currency || 'usd',
          });
          await captureServerEvent(userId, 'subscription_started', {
            $insert_id: billingInsertId('subscription_started', stripeEventId),
            plan_tier: planTier,
            interval,
            had_trial: true,
            is_upgrade: false,
          });
        } else {
          await captureServerEvent(
            userId,
            'payment_succeeded',
            buildPaymentSucceededCapture({
              stripeEventId,
              planTier,
              interval,
              amountCents: session.amount_total ?? 0,
              currency: session.currency || 'usd',
            })
          );
          await captureServerEvent(userId, 'subscription_started', {
            $insert_id: billingInsertId('subscription_started', `${stripeEventId}:sub`),
            plan_tier: planTier,
            interval,
            had_trial: hadTrialFromCheckout,
            is_upgrade: false,
          });
        }
        await refreshPostHogLtv(userId);
      } catch (e) {
        secureLog.warn('post-checkout billing analytics failed', sanitizeError(e));
      }
    } else if ((session.amount_total ?? 0) > 0) {
      await captureServerEvent(
        userId,
        'payment_succeeded',
        buildPaymentSucceededCapture({
          stripeEventId,
          planTier,
          interval,
          amountCents: session.amount_total ?? 0,
          currency: session.currency || 'usd',
        })
      );
      await refreshPostHogLtv(userId);
    }

    if (subId) {
      await recordBillingConsentEvent({
        userId,
        eventType: 'checkout_recurring_consent',
        stripeCheckoutSessionId: session.id,
        stripeSubscriptionId: subId,
        metadata: { source: 'stripe_webhook_checkout_completed', session_metadata: session.metadata },
      });
    }

    let email = session.customer_details?.email?.trim() || '';
    let firstName: string | null = session.customer_details?.name?.split(/\s+/)[0] || null;
    if (!email) {
      const resolved = await resolveUserById(supabase, userId);
      if (resolved) {
        email = resolved.email;
        firstName = firstName || resolved.firstName;
      }
    }
    if (!email) return;

    if (subId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subId);
        const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
        const periodEndLabel = periodEnd
          ? new Date(periodEnd * 1000).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'your billing period end';

        if (sub.status === 'trialing' && sub.trial_end) {
          const trialEnd = new Date(sub.trial_end * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          await sendTrialStartedEmail({
            supabase,
            userId,
            toEmail: email,
            firstName,
            trialEndDate: trialEnd,
            stripeEventId: stripeEventId,
          });
        } else {
          const amountCents = session.amount_total ?? 0;
          const amountFormatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: (session.currency || 'usd').toUpperCase(),
          }).format(amountCents / 100);
          await sendSubscriptionReceiptEmail({
            supabase,
            userId,
            toEmail: email,
            firstName,
            planLabel: `TrackMyOPT ${String(planId)} (${billingIntervalLabel})`,
            amountFormatted,
            billingInterval: billingIntervalLabel,
            periodEndDate: periodEndLabel,
            stripeEventId: stripeEventId,
          });
        }
      } catch (e) {
        secureLog.warn('post-checkout billing emails failed', sanitizeError(e));
      }
    }
  } catch (error: unknown) {
    secureLog.warn(
      'handleCheckoutCompleted optional follow-up failed:',
      sanitizeError(error),
    );
  }
}

async function logPaymentFailure(session: Stripe.Checkout.Session) {
  const userId = await resolveCheckoutAnalyticsUserId(session);

  if (!userId) return;

  try {
    await supabase.from('payment_transactions').insert({
      user_id: userId,
      stripe_payment_intent_id:
        (session.payment_intent as string) || `failed_cs_${session.id}`,
      stripe_customer_id: session.customer as string,
      stripe_checkout_session_id: session.id,
      amount: session.amount_total || 299,
      currency: session.currency || 'usd',
      status: 'failed',
      failure_reason: 'Async payment failed',
    });
  } catch (error) {
    secureLog.error('Error logging payment failure:', sanitizeError(error));
  }
}

async function handleAsyncCheckoutPaymentFailed(session: Stripe.Checkout.Session, eventId: string) {
  try {
    const userId = await resolveCheckoutAnalyticsUserId(session);
    if (!userId) return;

    let email = session.customer_details?.email?.trim() || '';
    let firstName: string | null =
      session.customer_details?.name?.split(/\s+/)[0] || null;

    if (!email) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('email, first_name')
        .eq('user_id', userId)
        .maybeSingle();
      email = prof?.email?.trim() || '';
      firstName = firstName || prof?.first_name || null;
    }
    if (!email) {
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      email = authUser?.user?.email?.trim() || '';
    }
    if (!email) {
      secureLog.warn('async_payment_failed: no email for user', logIdPrefix(userId));
      return;
    }

    const planId = session.metadata?.planId || 'pro';
    const planLabel = `TrackMyOPT Premium (${planId})`;
    const amountCents = session.amount_total || 0;
    const currency = session.currency || 'usd';

    await captureServerEvent(userId, 'payment_failed', {
      $insert_id: billingInsertId('payment_failed', eventId),
      plan_tier: normalizePlanTier(planId),
      amount_cents: amountCents,
      currency,
      failure_code: 'async_payment_failed',
    });

    const r = await sendPaymentFailedEmail({
      supabase,
      userId,
      toEmail: email,
      firstName,
      planLabel,
      amountCents,
      currency,
      stripeEventId: eventId,
      stripeInvoiceId: null,
    });
    if (!r.ok && 'error' in r && r.error) {
      secureLog.error('async_payment_failed email:', r.error);
    }
  } catch (error: unknown) {
    secureLog.error('handleAsyncCheckoutPaymentFailed:', sanitizeError(error));
  }
}

async function handlePaymentIntentPaymentFailed(
  stripe: Stripe,
  paymentIntent: Stripe.PaymentIntent,
  eventId: string
) {
  try {
    const full = (await stripe.paymentIntents.retrieve(paymentIntent.id, {
      expand: ['invoice'],
    })) as Stripe.PaymentIntent & {
      invoice?: string | Stripe.Invoice | null;
    };

    const invRef = full.invoice;
    const invoiceObj =
      typeof invRef === 'object' && invRef && 'id' in invRef
        ? (invRef as Stripe.Invoice & {
            subscription?: string | Stripe.Subscription | null;
          })
        : null;
    const invoiceId = typeof invRef === 'string' ? invRef : invoiceObj?.id ?? null;

    const meta = full.metadata || {};
    const hasContext = Boolean(
      invoiceId ||
      meta.subscription_id ||
      meta.checkout_session_id ||
      meta.supabase_user_id
    );
    if (!hasContext) {
      return;
    }

    // Phase 5: invoice.payment_failed is the canonical analytics+email emitter for
    // subscription dunning. Skip duplicate payment_failed when an invoice exists.
    if (invoiceId) {
      return;
    }

    const customerId =
      typeof full.customer === 'string' ? full.customer : full.customer?.id ?? null;

    let resolved: { userId: string; email: string; firstName: string | null } | null = null;

    if (customerId) {
      const r = await resolveUserForStripeCustomer(supabase, customerId);
      if (r) resolved = { userId: r.userId, email: r.email, firstName: r.firstName };
    }
    if (!resolved && typeof meta.supabase_user_id === 'string') {
      const r = await resolveUserById(supabase, meta.supabase_user_id);
      if (r) resolved = r;
    }

    if (!resolved) {
      secureLog.warn('payment_intent.payment_failed: could not resolve user', logIdPrefix(paymentIntent.id));
      return;
    }

    let planLabel = 'TrackMyOPT Premium';
    let planTier: ReturnType<typeof normalizePlanTier> = 'pro';
    const subRef = invoiceObj?.subscription;
    const subId =
      typeof subRef === 'string'
        ? subRef
        : subRef && typeof subRef === 'object' && 'id' in subRef
          ? (subRef as Stripe.Subscription).id
          : null;
    if (subId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subId);
        const pid = sub.metadata?.planId;
        planTier = normalizePlanTier(typeof pid === 'string' ? pid : undefined);
        planLabel = pid ? `TrackMyOPT Premium (${String(pid)})` : planLabel;
      } catch (e) {
        secureLog.warn('PI failed: subscription retrieve failed', sanitizeError(e));
      }
    } else if (typeof meta.planId === 'string') {
      planTier = normalizePlanTier(meta.planId);
      planLabel = `TrackMyOPT Premium (${meta.planId})`;
    }

    const amountCents = full.amount;
    const currency = full.currency || 'usd';
    const failureCode =
      full.last_payment_error?.decline_code ||
      full.last_payment_error?.code ||
      undefined;

    await captureServerEvent(resolved.userId, 'payment_failed', {
      $insert_id: billingInsertId('payment_failed', eventId),
      plan_tier: planTier,
      amount_cents: amountCents,
      currency,
      failure_source: 'payment_intent',
      ...(failureCode ? { failure_code: failureCode } : {}),
    });

    const portalUrl = customerId
      ? await createBillingPortalUrl(stripe, customerId)
      : null;

    const r = await sendPaymentFailedEmail({
      supabase,
      userId: resolved.userId,
      toEmail: resolved.email,
      firstName: resolved.firstName,
      planLabel,
      amountCents,
      currency,
      stripeEventId: eventId,
      stripeInvoiceId: invoiceId,
      updatePaymentUrl: portalUrl ?? undefined,
    });
    if (!r.ok && 'error' in r && r.error) {
      secureLog.error('payment_intent.payment_failed email:', r.error);
    }
  } catch (error: unknown) {
    secureLog.error('handlePaymentIntentPaymentFailed:', sanitizeError(error));
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription, eventId: string) {
  try {
    const customerId = subscription.customer as string;
    const user = await resolveUserForStripeCustomer(supabase, customerId);
    if (!user) return;

    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'soon';

    const r = await sendTrialEndingEmail({
      supabase,
      userId: user.userId,
      toEmail: user.email,
      firstName: user.firstName,
      trialEndDate: trialEnd,
      stripeEventId: eventId,
    });
    if (!r.ok && 'error' in r && r.error) {
      secureLog.error('trial_will_end email:', r.error);
    }
  } catch (error: unknown) {
    secureLog.error('handleTrialWillEnd:', sanitizeError(error));
  }
}

async function updateTransactionStatus(
  paymentIntentId: string,
  status: string,
  failureReason?: string
) {
  try {
    const { error } = await supabase
      .from('payment_transactions')
      .update({
        status,
        failure_reason: failureReason,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntentId);

    if (error) {
      secureLog.error('Error updating transaction status:', sanitizeError(error));
      throw new Error(`Transaction status update failed: ${error.message}`);
    }
  } catch (error) {
    secureLog.error('Error in updateTransactionStatus:', sanitizeError(error));
    throw error;
  }
}

async function handleInvoicePaymentFailed(
  stripe: Stripe,
  invoice: Stripe.Invoice,
  eventId: string
) {
  try {
    const inv = invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    };
    const cust = inv.customer;
    const customerId = typeof cust === 'string' ? cust : cust?.id;
    if (!customerId) return;

    const user = await resolveUserForStripeCustomer(supabase, customerId);
    if (!user) {
      secureLog.warn('invoice.payment_failed: no profile for customer', logIdPrefix(customerId));
      return;
    }

    let planLabel = 'TrackMyOPT Premium';
    let planTier: ReturnType<typeof normalizePlanTier> = 'pro';
    const subRef = inv.subscription;
    const subId = typeof subRef === 'string' ? subRef : subRef && typeof subRef === 'object' && 'id' in subRef ? subRef.id : null;
    if (subId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subId);
        const pid = sub.metadata?.planId;
        planTier = normalizePlanTier(typeof pid === 'string' ? pid : undefined);
        planLabel = pid ? `TrackMyOPT Premium (${String(pid)})` : planLabel;
      } catch (e) {
        secureLog.warn('invoice.payment_failed: subscription retrieve failed', sanitizeError(e));
      }
    }

    const amountCents = inv.amount_due || inv.total || 0;
    const currency = inv.currency || 'usd';
    let failureCode: string | undefined =
      typeof inv.last_finalization_error?.code === 'string'
        ? inv.last_finalization_error.code
        : undefined;

    // Prefer charge decline code when present (more useful than empty finalization error).
    if (!failureCode) {
      try {
        const chargeRef = (inv as Stripe.Invoice & { charge?: string | Stripe.Charge | null }).charge;
        const chargeId = typeof chargeRef === 'string' ? chargeRef : chargeRef?.id;
        if (chargeId) {
          const charge = await stripe.charges.retrieve(chargeId);
          const fromCharge =
            charge.failure_code ||
            charge.outcome?.reason ||
            null;
          if (typeof fromCharge === 'string' && fromCharge.length > 0) {
            failureCode = fromCharge;
          }
        }
      } catch {
        /* non-blocking */
      }
    }

    await captureServerEvent(user.userId, 'payment_failed', {
      $insert_id: billingInsertId('payment_failed', eventId),
      plan_tier: planTier,
      amount_cents: amountCents,
      currency,
      failure_source: 'invoice',
      ...(failureCode ? { failure_code: failureCode } : {}),
    });

    const portalUrl = await createBillingPortalUrl(stripe, customerId);

    const r = await sendPaymentFailedEmail({
      supabase,
      userId: user.userId,
      toEmail: user.email,
      firstName: user.firstName,
      planLabel,
      amountCents,
      currency,
      stripeEventId: eventId,
      stripeInvoiceId: inv.id,
      updatePaymentUrl: portalUrl ?? undefined,
    });
    if (!r.ok && r.error) {
      secureLog.error('invoice.payment_failed email:', r.error);
    }
  } catch (error: unknown) {
    secureLog.error('handleInvoicePaymentFailed:', sanitizeError(error));
  }
}

async function safeSendPaymentFailedForSubscription(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  eventId: string
) {
  try {
    const customerId = subscription.customer as string;
    const user = await resolveUserForStripeCustomer(supabase, customerId);
    if (!user) return;

    let amountCents = 0;
    let currency = 'usd';
    let invoiceId: string | null = null;
    const li = subscription.latest_invoice;
    if (li) {
      const invId = typeof li === 'string' ? li : li.id;
      invoiceId = invId;
      const inv = await stripe.invoices.retrieve(invId);
      amountCents = inv.amount_due || inv.total || 0;
      currency = inv.currency || 'usd';
    } else {
      const item = subscription.items.data[0];
      const p = item?.price;
      amountCents = (p?.unit_amount || 0) * (item?.quantity || 1);
      currency = p?.currency || 'usd';
    }

    const metaPlan = subscription.metadata?.planId;
    const planLabel = metaPlan ? `TrackMyOPT Premium (${String(metaPlan)})` : 'TrackMyOPT Premium';

    const r = await sendPaymentFailedEmail({
      supabase,
      userId: user.userId,
      toEmail: user.email,
      firstName: user.firstName,
      planLabel,
      amountCents,
      currency,
      stripeEventId: eventId,
      stripeInvoiceId: invoiceId,
      updatePaymentUrl: (await createBillingPortalUrl(stripe, customerId)) ?? undefined,
    });
    if (!r.ok && r.error) {
      secureLog.error('subscription payment_failed email:', r.error);
    }
  } catch (error: unknown) {
    secureLog.error('safeSendPaymentFailedForSubscription:', sanitizeError(error));
  }
}

/**
 * Mark transaction refunded and revoke premium. Subscription checkouts often store
 * synthetic stripe_payment_intent_id values, so we also match subscription id and checkout session id.
 */
async function handleChargeRefunded(stripe: Stripe, charge: Stripe.Charge, eventId: string) {
  const nowIso = new Date().toISOString();
  const piId =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id ?? null;

  /** Stripe Charge includes invoice/subscription; SDK types may lag API */
  const ch = charge as Stripe.Charge & {
    invoice?: string | Stripe.Invoice | null;
    subscription?: string | Stripe.Subscription | null;
  };

  type Row = { user_id: string };
  let rows: Row[] = [];

  if (piId) {
    const { data, error } = await supabase
      .from('payment_transactions')
      .update({ status: 'refunded', updated_at: nowIso })
      .eq('stripe_payment_intent_id', piId)
      .select('user_id');
    if (error) {
      throw new Error(`Refund transaction update failed: ${error.message}`);
    }
    if (data?.length) rows = data as Row[];
  }

  if (!rows.length) {
    let subscriptionId: string | null = null;
    if (typeof ch.subscription === 'string') {
      subscriptionId = ch.subscription;
    } else if (ch.subscription && typeof ch.subscription === 'object' && 'id' in ch.subscription) {
      subscriptionId = (ch.subscription as Stripe.Subscription).id;
    } else if (ch.invoice) {
      const invId = typeof ch.invoice === 'string' ? ch.invoice : ch.invoice.id;
      const invRaw = await stripe.invoices.retrieve(invId, { expand: ['subscription'] });
      const inv = invRaw as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null;
      };
      const sub = inv.subscription ?? null;
      subscriptionId =
        typeof sub === 'string' ? sub : sub && typeof sub === 'object' && 'id' in sub ? sub.id : null;
    }

    if (subscriptionId) {
      const { data, error } = await supabase
        .from('payment_transactions')
        .update({ status: 'refunded', updated_at: nowIso })
        .eq('stripe_subscription_id', subscriptionId)
        .select('user_id');
      if (error) {
        throw new Error(`Refund subscription update failed: ${error.message}`);
      }
      if (data?.length) rows = data as Row[];
    }
  }

  if (!rows.length && piId) {
    const pi = await stripe.paymentIntents.retrieve(piId);
    const csFromMeta =
      typeof pi.metadata?.checkout_session_id === 'string' ? pi.metadata.checkout_session_id : null;
    if (csFromMeta) {
      const { data, error } = await supabase
        .from('payment_transactions')
        .update({ status: 'refunded', updated_at: nowIso })
        .eq('stripe_checkout_session_id', csFromMeta)
        .select('user_id');
      if (error) {
        throw new Error(`Refund checkout update failed: ${error.message}`);
      }
      if (data?.length) rows = data as Row[];
    }
  }

  if (!rows.length && ch.invoice) {
    const invId = typeof ch.invoice === 'string' ? ch.invoice : ch.invoice.id;
    const inv = await stripe.invoices.retrieve(invId);
    const csFromInv =
      typeof inv.metadata?.checkout_session_id === 'string' ? inv.metadata.checkout_session_id : null;
    if (csFromInv) {
      const { data, error } = await supabase
        .from('payment_transactions')
        .update({ status: 'refunded', updated_at: nowIso })
        .eq('stripe_checkout_session_id', csFromInv)
        .select('user_id');
      if (error) {
        throw new Error(`Refund invoice update failed: ${error.message}`);
      }
      if (data?.length) rows = data as Row[];
    }
  }

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const amountCents = charge.amount_refunded ?? charge.amount ?? 0;
  const currency = charge.currency || 'usd';

  // Only revoke premium for a full refund. Partial refunds (e.g. a credit adjustment)
  // should not strip access — the subscription is still active in that case.
  const isFullRefund =
    typeof charge.amount_refunded === 'number' &&
    typeof charge.amount === 'number' &&
    charge.amount_refunded >= charge.amount;

  for (const userId of userIds) {
    if (!isFullRefund) {
      secureLog.info(`charge.refunded: partial refund for user ${logIdPrefix(userId)} — not revoking premium`);
      // Still send refund acknowledgment email for partial refunds (fall through).
    } else {
    const { error } = await supabase
      .from('profiles')
      .update({
        premium_status: false,
        plan_tier: null,
      })
      .eq('user_id', userId);
    if (error) {
      secureLog.error('Refund: failed to revoke premium for user', logIdPrefix(userId), sanitizeError(error));
      throw new Error(`Refund entitlement revocation failed: ${error.message}`);
    } else {
      secureLog.info('Refund: revoked premium for user', logIdPrefix(userId));
    }
    } // end isFullRefund

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, first_name')
        .eq('user_id', userId)
        .maybeSingle();

      let email = profile?.email?.trim() || '';
      if (!email) {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        email = authUser?.user?.email?.trim() || '';
      }
      if (email) {
        const r = await sendRefundAcknowledgmentEmail({
          supabase,
          userId,
          toEmail: email,
          firstName: profile?.first_name ?? null,
          amountCents,
          currency,
          stripeEventId: eventId,
        });
        if (!r.ok && 'error' in r && r.error) {
          secureLog.error('refund acknowledgment email:', r.error);
        }
      }
    } catch (e: unknown) {
      secureLog.error('charge.refunded email:', sanitizeError(e));
    }
  }

  if (!rows.length) {
    secureLog.warn('charge.refunded: no payment_transactions row matched for charge', logIdPrefix(charge.id));
  }
}

/**
 * Handles successful invoice payments (subscription renewals).
 * Refreshes subscription_expires_at from the associated subscription so the DB
 * stays in sync even if customer.subscription.updated is delayed or misconfigured.
 */
async function handleInvoicePaid(
  stripe: Stripe,
  invoice: Stripe.Invoice,
  stripeEventId: string
) {
  try {
    const inv = invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    };
    const customerId = typeof inv.customer === 'string' ? inv.customer : (inv.customer as { id?: string })?.id;
    if (!customerId) return;

    const subRef = inv.subscription;
    const subId = typeof subRef === 'string' ? subRef : (subRef as { id?: string })?.id ?? null;
    if (!subId) return;

    const subscription = await stripe.subscriptions.retrieve(subId);
    if (subscriptionHasPendingUpdate(subscription)) {
      secureLog.info('handleInvoicePaid: skip sync — subscription has pending_update', logIdPrefix(subId));
      return;
    }

    const user = await resolveUserForStripeCustomer(supabase, customerId);
    if (!user) return;

    const plan = getPlanFromSubscription(subscription);
    const planTier = normalizePlanTier(plan ?? undefined);
    const interval = normalizeBillingInterval(subscription.metadata?.interval);
    const amountCents = inv.amount_paid ?? inv.total ?? 0;
    const result = await reconcileCustomerBilling({
      stripe,
      supabase,
      customerId,
      userId: user.userId,
      cancelDuplicates: plan === 'dedicated',
    });

    if (result.action === 'synced') {
      secureLog.info(
        `handleInvoicePaid: synced ${result.planTier} for customer ${logIdPrefix(customerId)}`,
      );
    }

    try {
      if (amountCents <= 0) return;
      await captureServerEvent(
        user.userId,
        'payment_succeeded',
        buildPaymentSucceededCapture({
          stripeEventId,
          planTier,
          interval,
          amountCents,
          currency: inv.currency || 'usd',
        })
      );
      await refreshPostHogLtv(user.userId);

      // Renewals + trial→paid: send receipt (checkout path already emails immediate paid).
      const billingReason = (inv as Stripe.Invoice & { billing_reason?: string | null })
        .billing_reason;
      if (
        billingReason === 'subscription_cycle' ||
        billingReason === 'subscription_update'
      ) {
        const periodEnd = (subscription as unknown as { current_period_end?: number })
          .current_period_end;
        const periodEndLabel = periodEnd
          ? new Date(periodEnd * 1000).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'your next renewal';
        const amountFormatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: (inv.currency || 'usd').toUpperCase(),
        }).format(amountCents / 100);
        const intervalLabel = interval === 'month' ? 'monthly' : 'yearly';

        const trialEnd = subscription.trial_end;
        const nowSec = Math.floor(Date.now() / 1000);
        const isTrialConversion =
          typeof trialEnd === 'number' &&
          nowSec - trialEnd >= -3600 &&
          nowSec - trialEnd <= 3 * 24 * 3600;

        if (isTrialConversion) {
          await captureServerEvent(user.userId, 'trial_converted', {
            $insert_id: billingInsertId('trial_converted', stripeEventId),
            plan_tier: planTier,
            interval,
            amount_cents: amountCents,
            billing_reason: billingReason,
          });
        }

        const receipt = await sendSubscriptionReceiptEmail({
          supabase,
          userId: user.userId,
          toEmail: user.email,
          firstName: user.firstName,
          planLabel: `TrackMyOPT ${planTier} (${intervalLabel})`,
          amountFormatted,
          billingInterval: intervalLabel,
          periodEndDate: periodEndLabel,
          stripeEventId,
        });
        if (!receipt.ok && 'error' in receipt && receipt.error) {
          secureLog.error('handleInvoicePaid receipt email:', receipt.error);
        }
      }
    } catch (optionalError) {
      secureLog.warn(
        'handleInvoicePaid optional analytics/email failed:',
        sanitizeError(optionalError),
      );
    }
  } catch (error: unknown) {
    secureLog.error('handleInvoicePaid:', sanitizeError(error));
    throw error;
  }
}

async function handleSubscriptionUpdated(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  eventId: string
) {
  try {
    const customerId = subscription.customer as string;

    // Notify user of payment failure during dunning — but do NOT revoke access yet.
    if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
      await safeSendPaymentFailedForSubscription(stripe, subscription, eventId);
    }

    // Only revoke on genuinely terminal states where Stripe has given up entirely.
    // Keep access during past_due (dunning retries) and unpaid (brief limbo before
    // cancellation), which is standard SaaS practice and prevents cutting off users
    // during temporary payment failures.
    const isTerminal = ['canceled', 'incomplete_expired'].includes(subscription.status);

    if (
      subscription.cancel_at_period_end &&
      ['active', 'trialing'].includes(subscription.status)
    ) {
      try {
        const user = await resolveUserForStripeCustomer(supabase, customerId);
        if (user) {
          const periodEnd = (
            subscription as unknown as { current_period_end?: number }
          ).current_period_end;
          const accessThroughDate = periodEnd
            ? new Date(periodEnd * 1000).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'the end of your current billing period';
          const nextCharge =
            subscription.status === 'trialing' && subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toLocaleDateString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  },
                )
              : null;

          await recordBillingConsentEvent({
            userId: user.userId,
            eventType: 'subscription_cancel_initiated',
            stripeSubscriptionId: subscription.id,
            metadata: {
              cancel_at_period_end: true,
              initiated_by: 'stripe_portal_or_api',
            },
          });

          const r = await sendCancellationConfirmedEmail({
            supabase,
            userId: user.userId,
            toEmail: user.email,
            firstName: user.firstName,
            accessThroughDate,
            nextChargeDate: nextCharge,
            stripeEventId: `sub_cancel_confirm_${subscription.id}`,
          });
          if (!r.ok && 'error' in r && r.error) {
            secureLog.error('cancellation_confirmed email:', r.error);
          }
        }
      } catch (optionalError) {
        secureLog.warn(
          'subscription cancellation notification failed:',
          sanitizeError(optionalError),
        );
      }
    }

    if (subscriptionHasPendingUpdate(subscription)) {
      secureLog.info(
        'handleSubscriptionUpdated: pending_update — not syncing plan yet',
        logIdPrefix(subscription.id),
      );
      return;
    }

    const user = await resolveUserForStripeCustomer(supabase, customerId);
    if (!user) return;

    if (isTerminal) {
      const result = await reconcileCustomerBilling({
        stripe,
        supabase,
        customerId,
        userId: user.userId,
        excludeSubscriptionId: subscription.id,
      });
      if (result.action === 'revoked') {
        secureLog.info(
          'handleSubscriptionUpdated: revoked after terminal sub',
          logIdPrefix(customerId),
        );
      }
      return;
    }

    if (['active', 'trialing', 'past_due', 'unpaid'].includes(subscription.status)) {
      await reconcileCustomerBilling({
        stripe,
        supabase,
        customerId,
        userId: user.userId,
      });
    }
  } catch (error: unknown) {
    secureLog.error('handleSubscriptionUpdated:', sanitizeError(error));
    throw error;
  }
}

async function handleSubscriptionDeleted(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  eventId: string
) {
  const customerId = subscription.customer as string;
  const user = await resolveUserForStripeCustomer(supabase, customerId);
  if (!user) return;

  const result = await reconcileCustomerBilling({
    stripe,
    supabase,
    customerId,
    userId: user.userId,
    excludeSubscriptionId: subscription.id,
  });

  if (result.action === 'synced') {
    secureLog.info(
      `handleSubscriptionDeleted: kept access on ${result.planTier} (${logIdPrefix(result.subscriptionId)})`,
    );
    return;
  }

  if (result.action !== 'revoked') return;

  try {
    const cancelDetails = (
      subscription as Stripe.Subscription & {
        cancellation_details?: { feedback?: string | null; comment?: string | null } | null;
      }
    ).cancellation_details;
    const cancelFeedback =
      typeof cancelDetails?.feedback === 'string' ? cancelDetails.feedback : null;
    const cancelComment =
      typeof cancelDetails?.comment === 'string' ? cancelDetails.comment : null;

    await captureServerEvent(user.userId, 'subscription_canceled', {
      $insert_id: billingInsertId('subscription_canceled', eventId),
      plan_tier: normalizePlanTier(getPlanFromSubscription(subscription) ?? undefined),
      ...(cancelFeedback ? { cancel_feedback: cancelFeedback } : {}),
      ...(cancelComment ? { cancel_comment: cancelComment.slice(0, 200) } : {}),
    });

    const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
    const accessEndedDate = periodEnd
      ? new Date(periodEnd * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

    // Phase 6: unused cancels get the auto-check win-back; everyone else gets ended email.
    if (cancelFeedback === 'unused') {
      const r = await sendUnusedCancelWinbackEmail({
        supabase,
        userId: user.userId,
        toEmail: user.email,
        firstName: user.firstName,
        stripeEventId: eventId,
      });
      if (!r.ok && r.error) {
        secureLog.error('unused_cancel_winback email:', r.error);
      }
    } else {
      const r = await sendSubscriptionEndedEmail({
        supabase,
        userId: user.userId,
        toEmail: user.email,
        firstName: user.firstName,
        accessEndedDate,
        stripeEventId: eventId,
      });
      if (!r.ok && r.error) {
        secureLog.error('subscription_ended email:', r.error);
      }
    }
  } catch (error: unknown) {
    secureLog.warn(
      'handleSubscriptionDeleted optional analytics/email failed:',
      sanitizeError(error),
    );
  }
}

async function handleSubscriptionPendingUpdateApplied(
  stripe: Stripe,
  subscription: Stripe.Subscription
) {
  try {
    const customerId = subscription.customer as string;
    const user = await resolveUserForStripeCustomer(supabase, customerId);
    if (!user) return;

    const plan = getPlanFromSubscription(subscription);
    const syncResult = await syncProfileFromSubscription({
      supabase,
      userId: user.userId,
      customerId,
      subscription,
    });
    if (!syncResult.ok) {
      throw new Error('Pending subscription update profile sync failed');
    }

    if (plan === 'dedicated') {
      try {
        await captureServerEvent(user.userId, 'subscription_upgraded', {
          $insert_id: billingInsertId('subscription_upgraded', subscription.id),
          from_plan: 'pro',
          to_plan: 'dedicated',
          plan_tier: 'dedicated',
          interval: normalizeBillingInterval(subscription.metadata?.interval),
          is_upgrade: true,
        });
      } catch (optionalError) {
        secureLog.warn(
          'pending update analytics failed:',
          sanitizeError(optionalError),
        );
      }
      await cancelOtherCustomerSubscriptions({
        stripe,
        customerId,
        keepSubscriptionId: subscription.id,
        reason: 'dedicated_upgrade_applied',
      });
    }
  } catch (error: unknown) {
    secureLog.error('handleSubscriptionPendingUpdateApplied:', sanitizeError(error));
    throw error;
  }
}

async function handleSubscriptionPendingUpdateExpired(
  stripe: Stripe,
  subscription: Stripe.Subscription
) {
  try {
    const customerId = subscription.customer as string;
    const user = await resolveUserForStripeCustomer(supabase, customerId);
    if (!user) return;

    await reconcileCustomerBilling({
      stripe,
      supabase,
      customerId,
      userId: user.userId,
    });
    secureLog.info(
      'handleSubscriptionPendingUpdateExpired: reconciled without granting pending upgrade',
      logIdPrefix(subscription.id),
    );
  } catch (error: unknown) {
    secureLog.error('handleSubscriptionPendingUpdateExpired:', sanitizeError(error));
    throw error;
  }
}

async function handleInvoicePaymentActionRequired(stripe: Stripe, invoice: Stripe.Invoice) {
  try {
    const inv = invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    };
    const subRef = inv.subscription;
    const subId = typeof subRef === 'string' ? subRef : (subRef as { id?: string })?.id ?? null;
    if (!subId) return;

    const subscription = await stripe.subscriptions.retrieve(subId);
    if (!subscriptionHasPendingUpdate(subscription)) return;

    secureLog.info(
      'handleInvoicePaymentActionRequired: pending upgrade — not granting new plan',
      logIdPrefix(subId),
    );
  } catch (error: unknown) {
    secureLog.error('handleInvoicePaymentActionRequired:', sanitizeError(error));
  }
}
