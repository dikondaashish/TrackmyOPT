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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

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

      default:
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`❌ Error handling webhook event:`, error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;

  if (!userId) {
    console.error('❌ No user ID in session metadata:', session.id);
    return;
  }


  try {
    // Update user to premium
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        premium_status: true,
        premium_purchased_at: new Date().toISOString(),
        stripe_customer_id: session.customer as string,
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('❌ Error updating profile:', profileError);
      throw profileError;
    }


    // Record transaction
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_customer_id: session.customer as string,
        stripe_checkout_session_id: session.id,
        amount: session.amount_total || 299,
        currency: session.currency || 'usd',
        status: 'succeeded',
        payment_method_type: session.payment_method_types?.[0] || 'card',
        metadata: {
          session_id: session.id,
          customer_email: session.customer_details?.email,
        },
      });

    if (transactionError) {
      console.error('❌ Error recording transaction:', transactionError);
      throw transactionError;
    }


    // TODO: Send welcome email to premium user
    // await sendPremiumWelcomeEmail(userId);

  } catch (error) {
    console.error(`❌ Error in handleCheckoutCompleted:`, error);
    throw error;
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
        stripe_payment_intent_id: session.payment_intent as string || `failed_${Date.now()}`,
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

