import Stripe from 'stripe';
import { sanitizeError, secureLog, logIdPrefix } from '@/lib/secure-logger';
import {
  getPlanFromSubscription,
  reconcileCustomerBilling,
  subscriptionHasPendingUpdate,
} from '@/lib/premium/stripe-subscription-sync';
import {
  sendPaymentFailedEmail,
  sendRefundAcknowledgmentEmail,
  sendSubscriptionReceiptEmail,
} from '@/lib/notifications/transactional/billing';
import {
  resolveUserById,
  resolveUserForStripeCustomer,
} from '@/lib/notifications/transactional/stripe-users';
import {
  captureServerEvent,
  normalizeBillingInterval,
  normalizePlanTier,
} from '@/lib/posthog-server';
import {
  billingInsertId,
  buildPaymentSucceededCapture,
} from '@/lib/posthog/billing-analytics';
import {
  createBillingPortalUrl,
  refreshPostHogLtv,
  supabase,
} from './shared';

export async function handlePaymentIntentPaymentFailed(
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

export async function handleInvoicePaymentFailed(
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

/**
 * Mark transaction refunded and revoke premium. Subscription checkouts often store
 * synthetic stripe_payment_intent_id values, so we also match subscription id and checkout session id.
 */
export async function handleChargeRefunded(stripe: Stripe, charge: Stripe.Charge, eventId: string) {
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
export async function handleInvoicePaid(
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

export async function handleInvoicePaymentActionRequired(stripe: Stripe, invoice: Stripe.Invoice) {
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
