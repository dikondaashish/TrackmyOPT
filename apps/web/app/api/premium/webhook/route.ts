/**
 * Stripe Webhook Handler
 * 
 * Handles Stripe webhook events for payment processing
 * Critical events:
 * - checkout.session.completed: Upgrade user to premium
 * - payment_intent.succeeded: Log successful payment
 * - payment_intent.payment_failed: Log failed payment
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { sanitizeError } from '@/lib/secure-logger';
import { applyStripeCheckoutSession } from '@/lib/premium/applyStripeCheckoutSession';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    console.error('⚠️ Webhook Error: No Stripe signature header');
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }


  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
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

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await updateTransactionStatus(
            charge.payment_intent as string,
            'refunded'
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`❌ Error handling webhook event:`, sanitizeError(error));
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const result = await applyStripeCheckoutSession({ stripe, supabase, session });
  if (!result.ok) {
    console.error('❌ handleCheckoutCompleted:', result.reason);
    throw new Error(result.reason);
  }
  if (result.alreadyRecorded) {
    console.log('✅ checkout session already synced:', session.id);
  }
}

/**
 * Log payment failure
 */
async function logPaymentFailure(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;

  if (!userId) return;

  try {
    await supabase
      .from('payment_transactions')
      .insert({
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

/**
 * Update transaction status
 */
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
    } else {
    }
  } catch (error) {
    console.error('❌ Error in updateTransactionStatus:', error);
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // If subscription is not active or trialing, revoke access
  // Note: We don't revoke for 'past_due' immediately to give a grace period, 
  // but strict implementation would revoke.
  const isActive = ['active', 'trialing'].includes(subscription.status);

  if (!isActive) {
    await revokePremiumAccess(customerId);
  } else {
    // Ensure access is granted (in case it was previously revoked or data is out of sync)
    // Create a new client instance for this operation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabaseAdmin.from('profiles')
      .update({
        premium_status: true,
        plan_tier: subscription.metadata?.planId || 'pro',
        subscription_expires_at: new Date((subscription as any).current_period_end * 1000).toISOString(),
      })
      .eq('stripe_customer_id', customerId);
  }
}

/**
 * Handle subscription cancellation/deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  await revokePremiumAccess(customerId);
}

/**
 * Revoke premium access for a customer
 */
async function revokePremiumAccess(stripeCustomerId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        premium_status: false,
        plan_tier: null,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', stripeCustomerId);

    if (error) {
      console.error(`❌ Error revoking premium access for customer ${stripeCustomerId}:`, error);
    } else {
      console.log(`✅ Revoked premium access for customer ${stripeCustomerId}`);
    }
  } catch (error) {
    console.error(`❌ Error in revokePremiumAccess:`, error);
  }
}


