import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import {
  addRateLimitHeaders,
  checkRateLimitByUser,
  rateLimitResponse,
} from '@/lib/auth/api-rate-limit';
import { getUserId } from '@/lib/auth/get-user-id';
import { recordBillingConsentEvent } from '@/lib/billing/record-billing-consent';
import { getRequestAuditFromHeaders } from '@/lib/billing/request-audit';
import { getCasePassConsentLabel } from '@/lib/legal/legal-config';
import { billingInsertId } from '@/lib/posthog/billing-analytics';
import { normalizeProCheckoutSource } from '@/lib/posthog/pro-conversion';
import { captureServerEvent } from '@/lib/posthog-server';
import {
  CASE_PASS_PLAN_ID,
  CASE_PASS_PRICE_CENTS,
  CASE_PASS_PURCHASE_TYPE,
} from '@/lib/premium/case-pass';
import { resolveActivePlanTier } from '@/lib/premium/user-plan-tier';
import { CASE_PASS } from '@/lib/pricing/plan-config';
import { requireLiveStripeKeyInProduction } from '@/lib/stripe/require-live-key-in-production';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const checkoutRateLimit = {
  limit: 10,
  windowSeconds: 60 * 60,
  name: 'case-pass-checkout',
};

function getStripe(): Stripe {
  requireLiveStripeKeyInProduction();
  if (!process.env.STRIPE_SECRET_KEY)
    throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-08-26.dahlia',
  });
}

/**
 * POST /api/premium/case-pass/checkout
 *
 * One-time Stripe Checkout for the Case Pass: a single payment for Pro access
 * over a fixed term, with no subscription. Access is granted by the webhook
 * (and /api/premium/confirm-checkout) through applyStripeCheckoutSession.
 */
async function handlePOST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId)
      return NextResponse.json(
        { error: 'Please log in to buy the Case Pass.' },
        { status: 401 }
      );

    const limit = await checkRateLimitByUser(userId, checkoutRateLimit);
    if (!limit.success)
      return rateLimitResponse(
        limit,
        'Too many checkout attempts. Please try again later.'
      );

    const body = await request.json().catch(() => ({}));
    // The buyer must have ticked the one-time, non-refundable consent box.
    if (body?.nonRefundableAccepted !== true)
      return NextResponse.json(
        { error: 'Confirm the Case Pass terms to continue.' },
        { status: 400 }
      );
    const source = normalizeProCheckoutSource(body?.source);

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    )
      throw new Error('Supabase service credentials are not configured');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(
        'plan_tier, premium_status, subscription_expires_at, stripe_customer_id'
      )
      .eq('user_id', userId)
      .maybeSingle();
    if (profileError) throw new Error('Unable to verify the current plan');
    if (!profile)
      return NextResponse.json(
        { error: 'Account profile not found.' },
        { status: 404 }
      );
    // A pass on top of a running plan would charge for access already held.
    if (resolveActivePlanTier(profile) !== 'free')
      return NextResponse.json(
        {
          error: 'You already have Pro access on this account.',
          code: 'already_premium',
        },
        { status: 409 }
      );

    let customerEmail: string | undefined;
    if (!profile.stripe_customer_id) {
      const { data: authUser, error: authUserError } =
        await supabase.auth.admin.getUserById(userId);
      if (authUserError) throw new Error('Unable to load the billing email');
      customerEmail = authUser.user?.email || undefined;
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://www.trackmyopt.com'
    ).replace(/\/$/, '');
    const metadata = {
      purchase_type: CASE_PASS_PURCHASE_TYPE,
      // applyStripeCheckoutSession stores this as the plan tier.
      planId: 'pro',
      supabase_user_id: userId,
      checkout_source: source,
      pass_days: String(CASE_PASS.durationDays),
    };

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: profile.stripe_customer_id || undefined,
      customer_email: profile.stripe_customer_id ? undefined : customerEmail,
      customer_creation: profile.stripe_customer_id ? undefined : 'always',
      client_reference_id: userId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: CASE_PASS_PRICE_CENTS,
            product_data: {
              name: `TrackMyOPT Case Pass (Pro for ${CASE_PASS.durationLabel})`,
              description: `One-time payment for ${CASE_PASS.durationDays} days of Pro. Does not renew. Non-refundable.`,
            },
          },
        },
      ],
      metadata,
      payment_intent_data: { metadata },
      allow_promotion_codes: false,
      success_url: `${siteUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}&planId=pro&pass=1`,
      cancel_url: `${siteUrl}/premium/cancelled`,
    });
    if (!session.url) throw new Error('Stripe did not return a checkout URL');

    const audit = getRequestAuditFromHeaders(request);
    const consent = await recordBillingConsentEvent({
      userId,
      eventType: 'case_pass_checkout_consent',
      ipAddress: audit.ip_address,
      userAgent: audit.user_agent,
      stripeCheckoutSessionId: session.id,
      metadata: {
        plan_id: CASE_PASS_PLAN_ID,
        amount_cents: CASE_PASS_PRICE_CENTS,
        pass_days: CASE_PASS.durationDays,
        consent_text: getCasePassConsentLabel(),
        source,
      },
    });
    if (!consent.ok) console.error('Case Pass consent record failed');

    await captureServerEvent(userId, 'checkout_started', {
      $insert_id: billingInsertId('checkout_started', session.id),
      plan_id: CASE_PASS_PLAN_ID,
      plan_tier: 'pro',
      amount_cents: CASE_PASS_PRICE_CENTS,
      source,
    });

    return addRateLimitHeaders(
      NextResponse.json({ type: 'checkout', url: session.url }),
      limit
    );
  } catch {
    console.error('Case Pass checkout failed');
    return NextResponse.json(
      { error: 'Case Pass checkout is temporarily unavailable.' },
      { status: 500 }
    );
  }
}

export const POST = withSentryApiErrors(
  handlePOST,
  '/api/premium/case-pass/checkout',
  'POST'
);
