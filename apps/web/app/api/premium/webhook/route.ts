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
 * Handlers must not throw — Stripe expects 200; errors are logged only.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { sanitizeError } from '@/lib/secure-logger';
import { applyStripeCheckoutSession } from '@/lib/premium/applyStripeCheckoutSession';
import { requireLiveStripeKeyInProduction } from '@/lib/stripe/requireLiveKeyInProduction';
import {
  resolveUserForStripeCustomer,
  sendPaymentFailedEmail,
  sendRefundAcknowledgmentEmail,
  sendSubscriptionEndedEmail,
} from '@/lib/notifications/transactional-emails';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getStripe(): Stripe {
  requireLiveStripeKeyInProduction();
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-09-30.clover',
  });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    console.error('⚠️ Webhook Error: No Stripe signature header');
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
    console.error('⚠️ Webhook signature verification failed:', msg);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(stripe, session);
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(stripe, session);
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await logPaymentFailure(session);
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
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(stripe, invoice, event.id);
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
        await handleSubscriptionDeleted(subscription, event.id);
        break;
      }

      default:
    }
  } catch (error: unknown) {
    console.error(`❌ Error handling webhook event ${event.type}:`, sanitizeError(error));
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  try {
    const result = await applyStripeCheckoutSession({ stripe, supabase, session });
    if (!result.ok) {
      console.error('❌ handleCheckoutCompleted:', result.reason, {
        sessionId: session.id,
        customer: session.customer,
        hasMetadataUser: Boolean(session.metadata?.supabase_user_id),
      });
      return;
    }
    if (result.alreadyRecorded) {
      console.log('✅ checkout session already synced:', session.id);
    }
  } catch (error: unknown) {
    console.error('❌ handleCheckoutCompleted exception:', sanitizeError(error));
  }
}

async function logPaymentFailure(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;

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
    console.error('❌ Error logging payment failure:', error);
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
      console.error('❌ Error updating transaction status:', error);
    }
  } catch (error) {
    console.error('❌ Error in updateTransactionStatus:', error);
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
      console.warn('invoice.payment_failed: no profile for customer', customerId);
      return;
    }

    let planLabel = 'TrackMyOPT Premium';
    const subRef = inv.subscription;
    const subId = typeof subRef === 'string' ? subRef : subRef && typeof subRef === 'object' && 'id' in subRef ? subRef.id : null;
    if (subId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subId);
        const pid = sub.metadata?.planId;
        planLabel = pid ? `TrackMyOPT Premium (${String(pid)})` : planLabel;
      } catch (e) {
        console.warn('invoice.payment_failed: subscription retrieve failed', e);
      }
    }

    const amountCents = inv.amount_due || inv.total || 0;
    const currency = inv.currency || 'usd';

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
    });
    if (!r.ok && r.error) {
      console.error('invoice.payment_failed email:', r.error);
    }
  } catch (error: unknown) {
    console.error('handleInvoicePaymentFailed:', sanitizeError(error));
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
    });
    if (!r.ok && r.error) {
      console.error('subscription payment_failed email:', r.error);
    }
  } catch (error: unknown) {
    console.error('safeSendPaymentFailedForSubscription:', sanitizeError(error));
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
    const { data } = await supabase
      .from('payment_transactions')
      .update({ status: 'refunded', updated_at: nowIso })
      .eq('stripe_payment_intent_id', piId)
      .select('user_id');
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
      const { data } = await supabase
        .from('payment_transactions')
        .update({ status: 'refunded', updated_at: nowIso })
        .eq('stripe_subscription_id', subscriptionId)
        .select('user_id');
      if (data?.length) rows = data as Row[];
    }
  }

  if (!rows.length && piId) {
    const pi = await stripe.paymentIntents.retrieve(piId);
    const csFromMeta =
      typeof pi.metadata?.checkout_session_id === 'string' ? pi.metadata.checkout_session_id : null;
    if (csFromMeta) {
      const { data } = await supabase
        .from('payment_transactions')
        .update({ status: 'refunded', updated_at: nowIso })
        .eq('stripe_checkout_session_id', csFromMeta)
        .select('user_id');
      if (data?.length) rows = data as Row[];
    }
  }

  if (!rows.length && ch.invoice) {
    const invId = typeof ch.invoice === 'string' ? ch.invoice : ch.invoice.id;
    const inv = await stripe.invoices.retrieve(invId);
    const csFromInv =
      typeof inv.metadata?.checkout_session_id === 'string' ? inv.metadata.checkout_session_id : null;
    if (csFromInv) {
      const { data } = await supabase
        .from('payment_transactions')
        .update({ status: 'refunded', updated_at: nowIso })
        .eq('stripe_checkout_session_id', csFromInv)
        .select('user_id');
      if (data?.length) rows = data as Row[];
    }
  }

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const amountCents = charge.amount_refunded ?? charge.amount ?? 0;
  const currency = charge.currency || 'usd';

  for (const userId of userIds) {
    const { error } = await supabase
      .from('profiles')
      .update({
        premium_status: false,
        plan_tier: null,
        updated_at: nowIso,
      })
      .eq('user_id', userId);
    if (error) {
      console.error('❌ Refund: failed to revoke premium for user', userId, error);
    } else {
      console.log('✅ Refund: revoked premium for user', userId);
    }

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
          console.error('refund acknowledgment email:', r.error);
        }
      }
    } catch (e: unknown) {
      console.error('charge.refunded email:', sanitizeError(e));
    }
  }

  if (!rows.length) {
    console.warn('⚠️ charge.refunded: no payment_transactions row matched for charge', charge.id);
  }
}

async function handleSubscriptionUpdated(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  eventId: string
) {
  try {
    const customerId = subscription.customer as string;

    if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
      await safeSendPaymentFailedForSubscription(stripe, subscription, eventId);
    }

    const isActive = ['active', 'trialing'].includes(subscription.status);

    if (!isActive) {
      await revokePremiumAccess(customerId);
    } else {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      await supabaseAdmin
        .from('profiles')
        .update({
          premium_status: true,
          plan_tier: subscription.metadata?.planId || 'pro',
          subscription_expires_at: new Date(
            (subscription as unknown as { current_period_end: number }).current_period_end * 1000
          ).toISOString(),
        })
        .eq('stripe_customer_id', customerId);
    }
  } catch (error: unknown) {
    console.error('handleSubscriptionUpdated:', sanitizeError(error));
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, eventId: string) {
  try {
    const customerId = subscription.customer as string;
    const revoked = await revokePremiumAccess(customerId);
    if (!revoked) return;

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

    const r = await sendSubscriptionEndedEmail({
      supabase,
      userId: revoked.userId,
      toEmail: revoked.email,
      firstName: revoked.firstName,
      accessEndedDate,
      stripeEventId: eventId,
    });
    if (!r.ok && r.error) {
      console.error('subscription_ended email:', r.error);
    }
  } catch (error: unknown) {
    console.error('handleSubscriptionDeleted:', sanitizeError(error));
  }
}

async function revokePremiumAccess(stripeCustomerId: string): Promise<{
  userId: string;
  email: string;
  firstName: string | null;
} | null> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data: prof, error: fetchErr } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email, first_name')
      .eq('stripe_customer_id', stripeCustomerId)
      .maybeSingle();

    if (fetchErr) {
      console.error('revokePremiumAccess fetch:', fetchErr);
      return null;
    }
    if (!prof?.user_id) {
      console.warn(`revokePremiumAccess: no profile for customer ${stripeCustomerId}`);
      return null;
    }

    let email = prof.email?.trim() || '';
    if (!email) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(prof.user_id);
      email = authUser?.user?.email?.trim() || '';
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        premium_status: false,
        plan_tier: null,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', stripeCustomerId);

    if (error) {
      console.error(`❌ Error revoking premium access for customer ${stripeCustomerId}:`, error);
      return null;
    }
    console.log(`✅ Revoked premium access for customer ${stripeCustomerId}`);

    if (!email) {
      console.warn('revokePremiumAccess: no email for subscription email', prof.user_id);
      return null;
    }

    return { userId: prof.user_id, email, firstName: prof.first_name };
  } catch (error) {
    console.error(`❌ Error in revokePremiumAccess:`, error);
    return null;
  }
}
