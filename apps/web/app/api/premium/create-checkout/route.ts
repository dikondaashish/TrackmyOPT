/**
 * Stripe Checkout Session Creation
 *
 * This endpoint creates a Stripe checkout session for premium upgrade
 * Supports both extension (JWT) and web (session) authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/get-user-id';
import { sanitizeError, secureLog } from '@/lib/secure-logger';
import { requireLiveStripeKeyInProduction } from '@/lib/stripe/require-live-key-in-production';
import {
  downgradeDedicatedSubscriptionToPro,
  getPlanFromSubscription,
  getTierRank,
  listValidCustomerSubscriptions,
  pickBestSubscription,
  upgradeProSubscriptionToDedicated,
} from '@/lib/premium/stripe-subscription-sync';
import type { CreateCheckoutResponse } from '@/lib/premium/checkout-response-types';
import { syncProFreeTrialConsumedFromStripe } from '@/lib/premium/pro-free-trial-from-stripe';
import { recordBillingConsentEvent } from '@/lib/billing/record-billing-consent';
import { getRequestAuditFromHeaders } from '@/lib/billing/request-audit';
import {
  LEGAL_POLICY_VERSIONS,
  PRO_PAID_INTRO_PRICE,
  PRO_TRIAL_DAYS,
} from '@/lib/billing/legal-config';
import type { BillingInterval, PaidPlanId } from '@/lib/billing/legal-config';
import { isDedicatedOpenForNewPurchases } from '@/lib/pricing/dedicated-availability';
import {
  captureServerEvent,
  normalizeBillingInterval,
  normalizePlanTier,
} from '@/lib/posthog-server';
import { billingInsertId } from '@/lib/posthog/billing-analytics';
import {
  LIMITED_TIME_OFFER,
  PLAN_LIST_PRICES,
  PLAN_PRICES,
  calculateDiscountedPriceCents,
} from '@/lib/pricing/plan-config';

// Initialize Stripe
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  requireLiveStripeKeyInProduction();
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-09-30.clover',
  });
};

// Initialize Supabase
const getSupabase = () => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error('Supabase environment variables are not configured');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

const getPrices = () => ({
  pro: {
    month: process.env.STRIPE_PRICE_PRO_MONTHLY,
    year: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
  dedicated: {
    month: process.env.STRIPE_PRICE_DEDICATED_MONTHLY,
    year: process.env.STRIPE_PRICE_DEDICATED_YEARLY,
  },
});

const getProIntroPriceId = () => process.env.STRIPE_PRICE_PRO_INTRO?.trim();

type PlanId = 'pro' | 'dedicated';

function isUsableCoupon(
  coupon: Stripe.Coupon | Stripe.DeletedCoupon | null
): coupon is Stripe.Coupon {
  return coupon != null && coupon.deleted !== true;
}

async function validateConfiguredPrice(
  stripe: Stripe,
  priceId: string,
  planId: PlanId,
  interval: 'month' | 'year'
): Promise<Stripe.Price> {
  const price = await stripe.prices.retrieve(priceId);
  const expectedAmount = Math.round(PLAN_LIST_PRICES[planId][interval] * 100);
  if (
    !price.active ||
    price.currency.toLowerCase() !== 'usd' ||
    price.unit_amount !== expectedAmount ||
    price.recurring?.interval !== interval
  ) {
    throw new Error(
      `Stripe Price ${priceId} does not match ${planId}/${interval}: expected USD ${expectedAmount} cents recurring ${interval}.`
    );
  }
  return price;
}

async function validateConfiguredOneTimePrice(
  stripe: Stripe,
  priceId: string,
  expectedAmountCents: number
): Promise<void> {
  const price = await stripe.prices.retrieve(priceId);
  if (
    !price.active ||
    price.currency.toLowerCase() !== 'usd' ||
    price.unit_amount !== expectedAmountCents ||
    price.recurring != null
  ) {
    throw new Error(
      `Stripe Price ${priceId} must be an active one-time USD ${expectedAmountCents}-cent Price.`
    );
  }
}

async function createBillingPortalUrl(
  stripe: Stripe,
  customerId: string,
  origin: string
): Promise<string | null> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/settings?tab=subscription`,
    });
    return session.url;
  } catch {
    return null;
  }
}

/**
 * Resolves discounts + stable key for session reuse.
 * promoCode: undefined/null/blank = configured limited-time offer.
 * A non-blank string replaces it with an active customer-facing promotion code.
 */
async function resolveCheckoutPromotion(
  stripe: Stripe,
  planId: PlanId,
  interval: 'month' | 'year',
  recurringPrice: Stripe.Price,
  promoCode: unknown
): Promise<
  | {
      ok: true;
      discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
      checkoutPromoKey: string;
    }
  | { ok: false; error: string; status: 400 | 503 }
> {
  if (typeof promoCode === 'string') {
    const trimmed = promoCode.trim();
    if (trimmed)
      try {
        const codes = await stripe.promotionCodes.list({
          code: trimmed,
          active: true,
          limit: 1,
        });
        if (!codes.data.length) {
          return { ok: false, error: 'Invalid promo code', status: 400 };
        }
        const promoId = codes.data[0].id;
        return {
          ok: true,
          discounts: [{ promotion_code: promoId }],
          checkoutPromoKey: `custom:${promoId}`,
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Invalid promo code';
        return { ok: false, error: msg, status: 400 };
      }
  }

  try {
    const stableCodes = await stripe.promotionCodes.list({
      code: LIMITED_TIME_OFFER[planId].promotionCode,
      active: true,
      limit: 1,
    });
    const stablePromotion = stableCodes.data[0];
    if (!stablePromotion) {
      throw new Error(
        `No active ${LIMITED_TIME_OFFER[planId].promotionCode} promotion code.`
      );
    }
    // `applies_to` is omitted by Stripe unless explicitly expanded. We need it
    // below to guarantee that the configured offer is restricted to this plan.
    const coupon = await stripe.coupons.retrieve(
      LIMITED_TIME_OFFER[planId].couponId,
      { expand: ['applies_to'] }
    );
    const productId =
      typeof recurringPrice.product === 'string'
        ? recurringPrice.product
        : recurringPrice.product.id;
    const expectedPercentOff = LIMITED_TIME_OFFER[planId].percentOff;
    const expectedOfferCents = Math.round(PLAN_PRICES[planId][interval] * 100);
    const actualOfferCents =
      isUsableCoupon(coupon) &&
      coupon.percent_off != null &&
      recurringPrice.unit_amount != null
        ? calculateDiscountedPriceCents(
            recurringPrice.unit_amount,
            coupon.percent_off
          )
        : null;

    if (
      !stablePromotion.active ||
      !isUsableCoupon(coupon) ||
      !coupon.valid ||
      coupon.duration !== 'forever' ||
      coupon.percent_off !== expectedPercentOff ||
      actualOfferCents !== expectedOfferCents ||
      !coupon.applies_to?.products.includes(productId) ||
      stablePromotion.restrictions.first_time_transaction
    ) {
      throw new Error(
        `Stable ${planId} promotion does not match the configured limited-time offer.`
      );
    }
    return {
      ok: true,
      discounts: [{ promotion_code: stablePromotion.id }],
      checkoutPromoKey: `default:${planId}:${stablePromotion.id}`,
    };
  } catch (error) {
    secureLog.error(
      'Stripe limited-time promotion validation failed:',
      sanitizeError(error)
    );
  }

  return {
    ok: false,
    error:
      'The limited-time offer is temporarily unavailable. Please contact support.',
    status: 503,
  };
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = getSupabase();
    const PRICES = getPrices();

    const userId = await getUserId(req);
    if (!userId) {
      console.error('No user ID found - user not authenticated');
      return NextResponse.json(
        { error: 'Please log in to upgrade' },
        { status: 401 }
      );
    }

    const requestBody = await req.json();
    const { planId = 'pro', interval = 'year' } = requestBody;
    /** undefined/null/blank = limited-time offer; non-blank string = custom code */
    const promoCode = requestBody.promoCode as string | null | undefined;
    const recurringBillingAccepted =
      requestBody.recurringBillingAccepted === true;

    console.log(
      `Checkout request: planId=${planId}, interval=${interval}, userId=${userId}, promo=${promoCode === null ? 'null' : promoCode === undefined ? 'default' : 'custom'}`
    );

    if (
      !['pro', 'dedicated'].includes(planId) ||
      !['month', 'year'].includes(interval)
    ) {
      return NextResponse.json(
        { error: 'Invalid plan or interval' },
        { status: 400 }
      );
    }

    // This flag can pause new Dedicated sales without affecting existing subscribers.
    if (planId === 'dedicated' && !isDedicatedOpenForNewPurchases()) {
      return NextResponse.json(
        {
          error:
            'Dedicated purchases are temporarily paused. Choose Pro or contact support for help.',
          code: 'dedicated_closed',
        },
        { status: 400 }
      );
    }

    if (!recurringBillingAccepted) {
      return NextResponse.json(
        {
          error:
            'You must agree to the auto-renewing subscription terms before continuing to checkout.',
        },
        { status: 400 }
      );
    }

    const priceId =
      PRICES[planId as keyof typeof PRICES]?.[interval as 'month' | 'year'];

    if (!priceId) {
      console.error(
        `Missing Price ID for ${planId} - ${interval}. Available prices:`,
        PRICES
      );
      return NextResponse.json(
        {
          error:
            'Configuration Error: Price ID not found. Please contact support.',
        },
        { status: 500 }
      );
    }

    let recurringPrice: Stripe.Price;
    try {
      recurringPrice = await validateConfiguredPrice(
        stripe,
        priceId,
        planId as PlanId,
        interval as 'month' | 'year'
      );
    } catch (error) {
      secureLog.error('Stripe Price validation failed:', sanitizeError(error));
      return NextResponse.json(
        {
          error:
            'Billing configuration is being updated. Please contact support.',
        },
        { status: 503 }
      );
    }

    console.log(`Using price ID: ${priceId}`);

    const promoResolved = await resolveCheckoutPromotion(
      stripe,
      planId as PlanId,
      interval as 'month' | 'year',
      recurringPrice,
      promoCode
    );
    if (!promoResolved.ok) {
      return NextResponse.json(
        { error: promoResolved.error },
        { status: promoResolved.status }
      );
    }
    const { discounts, checkoutPromoKey } = promoResolved;
    const resolvedPromotionCodeId = discounts?.[0]?.promotion_code;
    if (typeof resolvedPromotionCodeId !== 'string') {
      secureLog.error(
        'Checkout promotion resolved without a promotion-code ID'
      );
      return NextResponse.json(
        {
          error:
            'The limited-time offer is temporarily unavailable. Please contact support.',
        },
        { status: 503 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(
        'email, first_name, last_name, stripe_customer_id, pro_free_trial_consumed'
      )
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Could not find user profile' },
        { status: 404 }
      );
    }

    let customerId = profile?.stripe_customer_id;

    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
        secureLog.log(`Verified existing Stripe customer: ${customerId}`);
      } catch (_retrieveError: unknown) {
        secureLog.log(
          `Customer ${customerId} not found in Stripe, creating new one...`
        );
        customerId = null;
      }
    }

    if (!customerId) {
      secureLog.log('Creating new Stripe customer for user:', userId);
      const customer = await stripe.customers.create({
        email: profile?.email,
        name:
          `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
          undefined,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);
      secureLog.log(`Created new Stripe customer: ${customerId}`);
    }

    secureLog.log(`Using Stripe customer: ${customerId}`);

    let proIntroConsumed = profile?.pro_free_trial_consumed === true;
    if (planId === 'pro' && !proIntroConsumed) {
      proIntroConsumed = await syncProFreeTrialConsumedFromStripe({
        stripe,
        supabase,
        userId,
        customerId,
      });
    }

    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://www.trackmyopt.com';
    const targetPlan = planId as PlanId;

    const existingSubs = await listValidCustomerSubscriptions(
      stripe,
      customerId
    );
    const bestExisting = pickBestSubscription(existingSubs);

    if (bestExisting) {
      const existingPlan = getPlanFromSubscription(bestExisting);
      const portalUrl = await createBillingPortalUrl(
        stripe,
        customerId,
        origin
      );

      // Phase 6: Dedicated → Pro migration (in-app switch for grandfathered subscribers).
      if (targetPlan === 'pro' && existingPlan === 'dedicated') {
        const audit = getRequestAuditFromHeaders(req);
        await recordBillingConsentEvent({
          userId,
          eventType: 'checkout_recurring_consent',
          planId: 'pro',
          interval: interval as BillingInterval,
          includeProIntro: false,
          ipAddress: audit.ip_address,
          userAgent: audit.user_agent,
          metadata: {
            checkout_promo_key: checkoutPromoKey,
            downgrade_from: 'dedicated',
            stripe_subscription_id: bestExisting.id,
          },
        });

        await captureServerEvent(userId, 'checkout_started', {
          $insert_id: billingInsertId(
            'checkout_started',
            `${bestExisting.id}:dedicated-to-pro`
          ),
          plan_tier: 'pro',
          interval: normalizeBillingInterval(interval),
          is_downgrade: true,
          from_plan: 'dedicated',
          to_plan: 'pro',
        });

        const downgrade = await downgradeDedicatedSubscriptionToPro({
          stripe,
          supabase,
          userId,
          customerId,
          existingSubscriptionId: bestExisting.id,
          proPriceId: priceId,
          promotionCodeId: resolvedPromotionCodeId,
          interval: interval as BillingInterval,
        });

        if (downgrade.outcome === 'active') {
          await captureServerEvent(userId, 'subscription_upgraded', {
            plan_tier: 'pro',
            interval: normalizeBillingInterval(interval),
            is_downgrade: true,
            from_plan: 'dedicated',
            to_plan: 'pro',
          });
          const body: CreateCheckoutResponse = {
            type: 'subscription_updated',
            status: 'active',
            redirect: `${origin}/premium/success?planId=pro&downgrade=1`,
            planId: 'pro',
          };
          return NextResponse.json(body);
        }

        return NextResponse.json(
          {
            error: downgrade.message,
            portalUrl,
            hostedInvoiceUrl: downgrade.hostedInvoiceUrl,
          },
          { status: 402 }
        );
      }

      if (targetPlan === 'dedicated' && existingPlan === 'pro') {
        const audit = getRequestAuditFromHeaders(req);
        await recordBillingConsentEvent({
          userId,
          eventType: 'checkout_recurring_consent',
          planId: 'dedicated',
          interval: interval as BillingInterval,
          includeProIntro: false,
          ipAddress: audit.ip_address,
          userAgent: audit.user_agent,
          metadata: {
            checkout_promo_key: checkoutPromoKey,
            upgrade_from: 'pro',
            stripe_subscription_id: bestExisting.id,
          },
        });

        await captureServerEvent(userId, 'checkout_started', {
          $insert_id: billingInsertId(
            'checkout_started',
            `${bestExisting.id}:dedicated-upgrade`
          ),
          plan_tier: 'dedicated',
          interval: normalizeBillingInterval(interval),
          is_upgrade: true,
          from_plan: 'pro',
          to_plan: 'dedicated',
        });

        const upgrade = await upgradeProSubscriptionToDedicated({
          stripe,
          supabase,
          userId,
          customerId,
          existingSubscriptionId: bestExisting.id,
          dedicatedPriceId: priceId,
          promotionCodeId: resolvedPromotionCodeId,
          interval: interval as BillingInterval,
        });

        if (upgrade.outcome === 'active') {
          await captureServerEvent(userId, 'subscription_upgraded', {
            plan_tier: 'dedicated',
            interval: normalizeBillingInterval(interval),
            is_upgrade: true,
            from_plan: 'pro',
            to_plan: 'dedicated',
          });

          const body: CreateCheckoutResponse = {
            type: 'subscription_updated',
            status: 'active',
            redirect: `${origin}/premium/success?planId=dedicated&upgrade=1`,
            planId: 'dedicated',
          };
          return NextResponse.json(body);
        }

        if (upgrade.outcome === 'payment_action_required') {
          const body: CreateCheckoutResponse = {
            type: 'payment_action_required',
            message: upgrade.message,
            clientSecret: upgrade.clientSecret,
            hostedInvoiceUrl: upgrade.hostedInvoiceUrl,
            portalUrl,
          };
          return NextResponse.json(body, { status: 402 });
        }

        const body: CreateCheckoutResponse = {
          type: 'payment_required',
          message: upgrade.message,
          hostedInvoiceUrl: upgrade.hostedInvoiceUrl,
          portalUrl,
        };
        return NextResponse.json(body, { status: 402 });
      }

      if (
        targetPlan === existingPlan ||
        getTierRank(existingPlan) > getTierRank(targetPlan)
      ) {
        const body: CreateCheckoutResponse = {
          type: 'already_subscribed',
          message: `You already have an active ${existingPlan} subscription. Manage billing in the customer portal.`,
          planId: existingPlan,
          portalUrl,
        };
        return NextResponse.json(body, { status: 409 });
      }
    }

    const includeProIntro = planId === 'pro' && !proIntroConsumed;
    const customPromoRequested =
      typeof promoCode === 'string' && promoCode.trim().length > 0;
    if (includeProIntro && customPromoRequested) {
      return NextResponse.json(
        {
          error:
            'The one-time $0.99 Pro introductory offer cannot be combined with a promo code.',
        },
        { status: 400 }
      );
    }

    let proIntroPriceId: string | undefined;
    if (includeProIntro) {
      proIntroPriceId = getProIntroPriceId();
      if (!proIntroPriceId) {
        secureLog.error('STRIPE_PRICE_PRO_INTRO is not configured');
        return NextResponse.json(
          {
            error:
              'The Pro introductory offer is temporarily unavailable. Please contact support.',
          },
          { status: 503 }
        );
      }
      try {
        await validateConfiguredOneTimePrice(
          stripe,
          proIntroPriceId,
          Math.round(PRO_PAID_INTRO_PRICE * 100)
        );
      } catch (error) {
        secureLog.error(
          'Stripe Pro introductory Price validation failed:',
          sanitizeError(error)
        );
        return NextResponse.json(
          {
            error:
              'The Pro introductory offer is temporarily unavailable. Please contact support.',
          },
          { status: 503 }
        );
      }
    }

    // The default coupon is scoped to the recurring Pro product, so it does not
    // discount the separate $0.99 intro product. It remains on the subscription
    // after the seven-day paid introduction.
    const effectiveDiscounts = discounts;
    const effectiveCheckoutPromoKey = checkoutPromoKey;

    const audit = getRequestAuditFromHeaders(req);
    await recordBillingConsentEvent({
      userId,
      eventType: 'checkout_recurring_consent',
      planId: planId as PaidPlanId,
      interval: interval as BillingInterval,
      includeProIntro,
      ipAddress: audit.ip_address,
      userAgent: audit.user_agent,
      metadata: {
        checkout_promo_key: effectiveCheckoutPromoKey,
        terms_version: LEGAL_POLICY_VERSIONS.terms_of_service,
        refund_policy_version: LEGAL_POLICY_VERSIONS.refund_policy,
      },
    });

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentPending } = await supabase
      .from('payment_transactions')
      .select('stripe_checkout_session_id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('created_at', tenMinutesAgo)
      .not('stripe_checkout_session_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentPending?.stripe_checkout_session_id) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(
          recentPending.stripe_checkout_session_id
        );
        const samePriceAsRequest =
          existingSession.metadata?.recurring_price_id === priceId;
        const sessionPromoKey = existingSession.metadata?.checkout_promo;
        const samePromoAsRequest =
          sessionPromoKey === effectiveCheckoutPromoKey;
        const sameIntroAsRequest =
          existingSession.metadata?.include_pro_intro ===
          (includeProIntro ? 'true' : 'false');

        if (
          existingSession.status === 'open' &&
          existingSession.url &&
          samePriceAsRequest &&
          samePromoAsRequest &&
          sameIntroAsRequest
        ) {
          console.log(
            `Reusing open checkout session ${existingSession.id} for ${planId}/${interval}`
          );
          await captureServerEvent(userId, 'checkout_started', {
            $insert_id: billingInsertId('checkout_started', existingSession.id),
            plan_tier: normalizePlanTier(planId),
            interval: normalizeBillingInterval(interval),
            is_upgrade: false,
            had_trial: includeProIntro,
            had_paid_intro: includeProIntro,
            session_reused: true,
          });
          const body: CreateCheckoutResponse = {
            type: 'checkout',
            sessionId: existingSession.id,
            url: existingSession.url,
          };
          return NextResponse.json(body);
        }
        console.log(
          `Not reusing pending session ${recentPending.stripe_checkout_session_id}: ` +
            `price match=${samePriceAsRequest}, promo match=${samePromoAsRequest}, intro match=${sameIntroAsRequest} (wanted ${effectiveCheckoutPromoKey}, had ${sessionPromoKey ?? 'none'})`
        );
      } catch (e) {
        console.warn(
          'Could not retrieve existing checkout session, creating a new one:',
          sanitizeError(e)
        );
      }
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
        ...(includeProIntro && proIntroPriceId
          ? [{ price: proIntroPriceId, quantity: 1 }]
          : []),
      ],
      subscription_data: {
        trial_period_days: includeProIntro ? PRO_TRIAL_DAYS : undefined,
        metadata: {
          planId,
          interval,
          include_pro_intro: includeProIntro ? 'true' : 'false',
        },
      },
      success_url: `${origin}/premium/success?session_id={CHECKOUT_SESSION_ID}&planId=${planId}`,
      cancel_url: `${origin}/premium/cancelled`,
      metadata: {
        supabase_user_id: userId,
        planId,
        interval,
        checkout_promo: effectiveCheckoutPromoKey,
        recurring_price_id: priceId,
        recurring_list_price_cents: String(
          Math.round(
            PLAN_LIST_PRICES[planId as PlanId][interval as 'month' | 'year'] *
              100
          )
        ),
        recurring_offer_price_cents: String(
          Math.round(
            PLAN_PRICES[planId as PlanId][interval as 'month' | 'year'] * 100
          )
        ),
        terms_version: LEGAL_POLICY_VERSIONS.terms_of_service,
        refund_policy_version: LEGAL_POLICY_VERSIONS.refund_policy,
        subscription_terms_version:
          LEGAL_POLICY_VERSIONS.subscription_billing_terms,
        include_pro_trial: includeProIntro ? 'true' : 'false',
        include_pro_intro: includeProIntro ? 'true' : 'false',
        pro_intro_price_cents: includeProIntro
          ? String(Math.round(PRO_PAID_INTRO_PRICE * 100))
          : '',
      },
    };

    if (effectiveDiscounts?.length) {
      sessionConfig.discounts = effectiveDiscounts;
    }

    console.log('Creating Stripe checkout session...');
    const session = await stripe.checkout.sessions.create(sessionConfig);

    const { error: pendingInsertError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        stripe_payment_intent_id: `pending_${session.id}`,
        stripe_customer_id: customerId,
        stripe_checkout_session_id: session.id,
        stripe_subscription_id: null,
        amount: 0,
        currency: 'usd',
        status: 'pending',
        payment_method_type: 'card',
        metadata: { checkout_session_pending: true },
      });
    if (pendingInsertError) {
      console.error(
        'Pending checkout row insert failed (session still valid in Stripe):',
        pendingInsertError
      );
    }

    console.log(`Checkout session created: ${session.id}`);
    await captureServerEvent(userId, 'checkout_started', {
      $insert_id: billingInsertId('checkout_started', session.id),
      plan_tier: normalizePlanTier(planId),
      interval: normalizeBillingInterval(interval),
      is_upgrade: false,
      had_trial: includeProIntro,
      had_paid_intro: includeProIntro,
      session_reused: false,
    });
    const body: CreateCheckoutResponse = {
      type: 'checkout',
      sessionId: session.id,
      url: session.url!,
    };
    return NextResponse.json(body);
  } catch (error: unknown) {
    console.error('Stripe checkout error:', sanitizeError(error));

    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('API key')) {
      return NextResponse.json(
        { error: 'Stripe API configuration error' },
        { status: 500 }
      );
    }
    if (message.includes('No such price')) {
      return NextResponse.json(
        { error: 'Invalid price configuration' },
        { status: 500 }
      );
    }
    if (message.includes('promotion_code')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
