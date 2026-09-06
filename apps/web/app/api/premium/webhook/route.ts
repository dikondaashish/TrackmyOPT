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
import { headers } from 'next/headers';
import { sanitizeError, secureLog, logIdPrefix } from '@/lib/secure-logger';
import {
  applyResumeCreditRefund,
  fulfillResumeCreditCheckout,
  isResumeCreditCheckout,
} from '@/lib/resume-credits/fulfillment';
import {
  handleAsyncCheckoutPaymentFailed,
  handleCheckoutCompleted,
  handleCheckoutSessionExpired,
  logPaymentFailure,
} from './checkout';
import {
  handleChargeRefunded,
  handleInvoicePaid,
  handleInvoicePaymentActionRequired,
  handleInvoicePaymentFailed,
  handlePaymentIntentPaymentFailed,
} from './invoice';
import {
  handleSubscriptionDeleted,
  handleSubscriptionPendingUpdateApplied,
  handleSubscriptionPendingUpdateExpired,
  handleSubscriptionUpdated,
  handleTrialWillEnd,
} from './subscription';
import { getStripe, supabase, updateTransactionStatus } from './shared';

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
        if (isResumeCreditCheckout(session)) {
          if (session.payment_status === 'paid') {
            await fulfillResumeCreditCheckout(session, supabase);
          }
        } else {
          await handleCheckoutCompleted(stripe, session, event.id);
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (isResumeCreditCheckout(session)) {
          await fulfillResumeCreditCheckout(session, supabase);
        } else {
          await handleCheckoutCompleted(stripe, session, event.id);
        }
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
        const creditRefund = await applyResumeCreditRefund(charge, event.id, supabase);
        if (creditRefund.handled) {
          const paymentIntentId =
            typeof charge.payment_intent === 'string'
              ? charge.payment_intent
              : charge.payment_intent?.id;
          if (paymentIntentId) {
            const fullyRefunded = charge.amount_refunded >= charge.amount;
            const { error: transactionError } = await supabase
              .from('payment_transactions')
              .update({
                status: fullyRefunded ? 'refunded' : 'partially_refunded',
                updated_at: new Date().toISOString(),
              })
              .eq('stripe_payment_intent_id', paymentIntentId);
            if (transactionError) {
              throw new Error(`Resume-credit refund transaction update failed: ${transactionError.message}`);
            }
          }
        } else {
          await handleChargeRefunded(stripe, charge, event.id);
        }
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
