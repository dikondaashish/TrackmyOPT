import Stripe from 'stripe';
import { sanitizeError, secureLog, logIdPrefix } from '@/lib/secure-logger';
import { applyStripeCheckoutSession } from '@/lib/premium/apply-stripe-checkout-session';
import { cancelOtherCustomerSubscriptions } from '@/lib/premium/stripe-subscription-sync';
import {
  sendPaymentFailedEmail,
  sendSubscriptionReceiptEmail,
} from '@/lib/notifications/transactional/billing';
import { sendTrialStartedEmail } from '@/lib/notifications/transactional/trials';
import { resolveUserById } from '@/lib/notifications/transactional/stripe-users';
import { recordBillingConsentEvent } from '@/lib/billing/record-billing-consent';
import {
  captureServerEvent,
  normalizeBillingInterval,
  normalizePlanTier,
} from '@/lib/posthog-server';
import {
  billingInsertId,
  buildPaymentSucceededCapture,
} from '@/lib/posthog/billing-analytics';
import { isResumeCreditCheckout } from '@/lib/resume-credits/fulfillment';
import {
  refreshPostHogLtv,
  resolveCheckoutAnalyticsUserId,
  supabase,
} from './shared';

export async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
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

export async function handleCheckoutCompleted(
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

export async function logPaymentFailure(session: Stripe.Checkout.Session) {
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
      plan_id: isResumeCreditCheckout(session) ? 'resume_credits' : session.metadata?.planId,
      metadata: isResumeCreditCheckout(session)
        ? { purchase_type: 'resume_credit_pack' }
        : session.metadata,
    });
  } catch (error) {
    secureLog.error('Error logging payment failure:', sanitizeError(error));
  }
}

export async function handleAsyncCheckoutPaymentFailed(session: Stripe.Checkout.Session, eventId: string) {
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

    const isCreditPurchase = isResumeCreditCheckout(session);
    const planId = session.metadata?.planId || 'pro';
    const planLabel = isCreditPurchase
      ? 'TrackMyOPT Resume Credits'
      : `TrackMyOPT Premium (${planId})`;
    const amountCents = session.amount_total || 0;
    const currency = session.currency || 'usd';

    await captureServerEvent(userId, 'payment_failed', {
      $insert_id: billingInsertId('payment_failed', eventId),
      plan_tier: normalizePlanTier(planId),
      amount_cents: amountCents,
      currency,
      failure_code: 'async_payment_failed',
      ...(isCreditPurchase ? { purchase_type: 'resume_credit_pack' } : {}),
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
