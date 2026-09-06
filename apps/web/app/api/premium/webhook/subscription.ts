import Stripe from 'stripe';
import { sanitizeError, secureLog, logIdPrefix } from '@/lib/secure-logger';
import {
  cancelOtherCustomerSubscriptions,
  getPlanFromSubscription,
  reconcileCustomerBilling,
  subscriptionHasPendingUpdate,
  syncProfileFromSubscription,
} from '@/lib/premium/stripe-subscription-sync';
import {
  sendPaymentFailedEmail,
  sendSubscriptionEndedEmail,
  sendUnusedCancelWinbackEmail,
  sendCancellationConfirmedEmail,
} from '@/lib/notifications/transactional/billing';
import { sendTrialEndingEmail } from '@/lib/notifications/transactional/trials';
import { resolveUserForStripeCustomer } from '@/lib/notifications/transactional/stripe-users';
import { recordBillingConsentEvent } from '@/lib/billing/record-billing-consent';
import {
  captureServerEvent,
  normalizeBillingInterval,
  normalizePlanTier,
} from '@/lib/posthog-server';
import { billingInsertId } from '@/lib/posthog/billing-analytics';
import { createBillingPortalUrl, supabase } from './shared';

export async function handleTrialWillEnd(subscription: Stripe.Subscription, eventId: string) {
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

export async function handleSubscriptionUpdated(
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

export async function handleSubscriptionDeleted(
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

export async function handleSubscriptionPendingUpdateApplied(
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

export async function handleSubscriptionPendingUpdateExpired(
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
