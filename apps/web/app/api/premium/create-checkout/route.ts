/**
 * Stripe Checkout Session Creation
 *
 * This endpoint creates a Stripe checkout session for premium upgrade
 * Supports both extension (JWT) and web (session) authentication
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getUserId } from "@/lib/auth/getUserId";
import { sanitizeError, secureLog } from "@/lib/secure-logger";
import { requireLiveStripeKeyInProduction } from "@/lib/stripe/requireLiveKeyInProduction";
import { syncProFreeTrialConsumedFromStripe } from "@/lib/premium/proFreeTrialFromStripe";
import {
  getPlanFromSubscription,
  getTierRank,
  listValidCustomerSubscriptions,
  pickBestSubscription,
  upgradeProSubscriptionToDedicated,
} from "@/lib/premium/stripeSubscriptionSync";
import type { CreateCheckoutResponse } from "@/lib/premium/checkoutResponseTypes";
import { recordBillingConsentEvent } from "@/lib/billing/recordBillingConsent";
import { getRequestAuditFromHeaders } from "@/lib/billing/request-audit";
import { LEGAL_POLICY_VERSIONS } from "@/lib/billing/legal-config";
import type { BillingInterval, PaidPlanId } from "@/lib/billing/legal-config";
import {
  captureServerEvent,
  normalizeBillingInterval,
  normalizePlanTier,
} from "@/lib/posthog-server";

// Initialize Stripe
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  requireLiveStripeKeyInProduction();
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
  });
};

// Initialize Supabase
const getSupabase = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase environment variables are not configured");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
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

type PlanId = "pro" | "dedicated";

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
 * promoCode: undefined = default EARLYBIRD (env per planId; applies to all intervals for that plan),
 * null = explicit no discount, string = lookup active promotion code by customer-facing code.
 */
async function resolveCheckoutPromotion(
  stripe: Stripe,
  planId: PlanId,
  promoCode: unknown
): Promise<
  | {
      ok: true;
      discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
      checkoutPromoKey: string;
    }
  | { ok: false; error: string }
> {
  if (promoCode === null) {
    return { ok: true, discounts: undefined, checkoutPromoKey: "none" };
  }

  if (typeof promoCode === "string") {
    const trimmed = promoCode.trim();
    if (!trimmed) {
      return { ok: true, discounts: undefined, checkoutPromoKey: "none" };
    }
    try {
      const codes = await stripe.promotionCodes.list({
        code: trimmed,
        active: true,
        limit: 1,
      });
      if (!codes.data.length) {
        return { ok: false, error: "Invalid promo code" };
      }
      const promoId = codes.data[0].id;
      return {
        ok: true,
        discounts: [{ promotion_code: promoId }],
        checkoutPromoKey: `custom:${promoId}`,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid promo code";
      return { ok: false, error: msg };
    }
  }

  const envPromo =
    planId === "pro" ? process.env.STRIPE_PROMO_CODE_PRO : process.env.STRIPE_PROMO_CODE_DEDICATED;
  const trimmedEnv = envPromo?.trim();
  if (!trimmedEnv) {
    return { ok: true, discounts: undefined, checkoutPromoKey: `default:${planId}:missing` };
  }
  return {
    ok: true,
    discounts: [{ promotion_code: trimmedEnv }],
    checkoutPromoKey: `default:${planId}:${trimmedEnv}`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = getSupabase();
    const PRICES = getPrices();

    const userId = await getUserId(req);
    if (!userId) {
      console.error("No user ID found - user not authenticated");
      return NextResponse.json({ error: "Please log in to upgrade" }, { status: 401 });
    }

    const requestBody = await req.json();
    const { planId = "pro", interval = "year" } = requestBody;
    /** undefined = default EARLYBIRD; null = removed; string = custom */
    const promoCode = requestBody.promoCode as string | null | undefined;
    const recurringBillingAccepted = requestBody.recurringBillingAccepted === true;

    console.log(`Checkout request: planId=${planId}, interval=${interval}, userId=${userId}, promo=${promoCode === null ? "null" : promoCode === undefined ? "default" : "custom"}`);

    if (!["pro", "dedicated"].includes(planId) || !["month", "year"].includes(interval)) {
      return NextResponse.json({ error: "Invalid plan or interval" }, { status: 400 });
    }

    if (!recurringBillingAccepted) {
      return NextResponse.json(
        {
          error:
            "You must agree to the auto-renewing subscription terms before continuing to checkout.",
        },
        { status: 400 }
      );
    }

    const priceId = PRICES[planId as keyof typeof PRICES]?.[interval as "month" | "year"];

    if (!priceId) {
      console.error(`Missing Price ID for ${planId} - ${interval}. Available prices:`, PRICES);
      return NextResponse.json(
        { error: "Configuration Error: Price ID not found. Please contact support." },
        { status: 500 }
      );
    }

    console.log(`Using price ID: ${priceId}`);

    const promoResolved = await resolveCheckoutPromotion(stripe, planId as PlanId, promoCode);
    if (!promoResolved.ok) {
      return NextResponse.json({ error: promoResolved.error }, { status: 400 });
    }
    const { discounts, checkoutPromoKey } = promoResolved;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, first_name, last_name, stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ error: "Could not find user profile" }, { status: 404 });
    }

    let customerId = profile?.stripe_customer_id;

    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
        secureLog.log(`Verified existing Stripe customer: ${customerId}`);
      } catch (retrieveError: unknown) {
        secureLog.log(`Customer ${customerId} not found in Stripe, creating new one...`);
        customerId = null;
      }
    }

    if (!customerId) {
      secureLog.log("Creating new Stripe customer for user:", userId);
      const customer = await stripe.customers.create({
        email: profile?.email,
        name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || undefined,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("user_id", userId);
      secureLog.log(`Created new Stripe customer: ${customerId}`);
    }

    secureLog.log(`Using Stripe customer: ${customerId}`);

    const origin =
      req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.trackmyopt.com";
    const targetPlan = planId as PlanId;

    const existingSubs = await listValidCustomerSubscriptions(stripe, customerId);
    const bestExisting = pickBestSubscription(existingSubs);

    if (bestExisting) {
      const existingPlan = getPlanFromSubscription(bestExisting);
      const portalUrl = await createBillingPortalUrl(stripe, customerId, origin);

      if (targetPlan === "dedicated" && existingPlan === "pro") {
        const audit = getRequestAuditFromHeaders(req);
        await recordBillingConsentEvent({
          userId,
          eventType: "checkout_recurring_consent",
          planId: "dedicated",
          interval: interval as BillingInterval,
          includeProTrial: false,
          ipAddress: audit.ip_address,
          userAgent: audit.user_agent,
          metadata: {
            checkout_promo_key: checkoutPromoKey,
            upgrade_from: "pro",
            stripe_subscription_id: bestExisting.id,
          },
        });

        await captureServerEvent(userId, "checkout_started", {
          plan_tier: "dedicated",
          interval: normalizeBillingInterval(interval),
          is_upgrade: true,
          from_plan: "pro",
          to_plan: "dedicated",
        });

        const upgrade = await upgradeProSubscriptionToDedicated({
          stripe,
          supabase,
          userId,
          customerId,
          existingSubscriptionId: bestExisting.id,
          dedicatedPriceId: priceId,
          interval: interval as BillingInterval,
        });

        if (upgrade.outcome === "active") {
          await captureServerEvent(userId, "subscription_upgraded", {
            plan_tier: "dedicated",
            interval: normalizeBillingInterval(interval),
            is_upgrade: true,
            from_plan: "pro",
            to_plan: "dedicated",
          });

          const body: CreateCheckoutResponse = {
            type: "subscription_updated",
            status: "active",
            redirect: `${origin}/premium/success?planId=dedicated&upgrade=1`,
            planId: "dedicated",
          };
          return NextResponse.json(body);
        }

        if (upgrade.outcome === "payment_action_required") {
          const body: CreateCheckoutResponse = {
            type: "payment_action_required",
            message: upgrade.message,
            clientSecret: upgrade.clientSecret,
            hostedInvoiceUrl: upgrade.hostedInvoiceUrl,
            portalUrl,
          };
          return NextResponse.json(body, { status: 402 });
        }

        const body: CreateCheckoutResponse = {
          type: "payment_required",
          message: upgrade.message,
          hostedInvoiceUrl: upgrade.hostedInvoiceUrl,
          portalUrl,
        };
        return NextResponse.json(body, { status: 402 });
      }

      if (targetPlan === existingPlan || getTierRank(existingPlan) > getTierRank(targetPlan)) {
        const body: CreateCheckoutResponse = {
          type: "already_subscribed",
          message: `You already have an active ${existingPlan} subscription. Manage billing in the customer portal.`,
          planId: existingPlan,
          portalUrl,
        };
        return NextResponse.json(body, { status: 409 });
      }
    }

    const profileRow = profile as typeof profile & { pro_free_trial_consumed?: boolean | null };
    let proFreeTrialConsumed = profileRow.pro_free_trial_consumed === true;
    if (!proFreeTrialConsumed && customerId) {
      try {
        const synced = await syncProFreeTrialConsumedFromStripe({
          stripe,
          supabase,
          userId,
          customerId,
        });
        if (synced) proFreeTrialConsumed = true;
      } catch (e) {
        console.warn("pro_free_trial Stripe history sync failed (continuing with DB flag):", sanitizeError(e));
      }
    }

    const includeProTrial = planId === "pro" && !proFreeTrialConsumed;

    const audit = getRequestAuditFromHeaders(req);
    await recordBillingConsentEvent({
      userId,
      eventType: "checkout_recurring_consent",
      planId: planId as PaidPlanId,
      interval: interval as BillingInterval,
      includeProTrial,
      ipAddress: audit.ip_address,
      userAgent: audit.user_agent,
      metadata: {
        checkout_promo_key: checkoutPromoKey,
        terms_version: LEGAL_POLICY_VERSIONS.terms_of_service,
        refund_policy_version: LEGAL_POLICY_VERSIONS.refund_policy,
      },
    });

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentPending } = await supabase
      .from("payment_transactions")
      .select("stripe_checkout_session_id")
      .eq("user_id", userId)
      .eq("status", "pending")
      .gte("created_at", tenMinutesAgo)
      .not("stripe_checkout_session_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentPending?.stripe_checkout_session_id) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(
          recentPending.stripe_checkout_session_id
        );
        const lineItems = await stripe.checkout.sessions.listLineItems(
          recentPending.stripe_checkout_session_id,
          { limit: 1 }
        );
        const rawPrice = lineItems.data[0]?.price;
        const sessionPriceId =
          typeof rawPrice === "string"
            ? rawPrice
            : rawPrice && typeof rawPrice === "object" && "id" in rawPrice
              ? (rawPrice as Stripe.Price).id
              : undefined;
        const samePriceAsRequest = sessionPriceId === priceId;
        const sessionPromoKey = existingSession.metadata?.checkout_promo;
        const samePromoAsRequest = sessionPromoKey === checkoutPromoKey;

        if (
          existingSession.status === "open" &&
          existingSession.url &&
          samePriceAsRequest &&
          samePromoAsRequest
        ) {
          console.log(`Reusing open checkout session ${existingSession.id} for ${planId}/${interval}`);
          await captureServerEvent(userId, "checkout_started", {
            plan_tier: normalizePlanTier(planId),
            interval: normalizeBillingInterval(interval),
            is_upgrade: false,
            had_trial: includeProTrial,
            session_reused: true,
          });
          const body: CreateCheckoutResponse = {
            type: "checkout",
            sessionId: existingSession.id,
            url: existingSession.url,
          };
          return NextResponse.json(body);
        }
        console.log(
          `Not reusing pending session ${recentPending.stripe_checkout_session_id}: ` +
            `price match=${samePriceAsRequest}, promo match=${samePromoAsRequest} (wanted ${checkoutPromoKey}, had ${sessionPromoKey ?? "none"})`
        );
      } catch (e) {
        console.warn("Could not retrieve existing checkout session, creating a new one:", sanitizeError(e));
      }
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: includeProTrial ? 7 : undefined,
        metadata: {
          planId,
          interval,
        },
      },
      success_url: `${origin}/premium/success?session_id={CHECKOUT_SESSION_ID}&planId=${planId}`,
      cancel_url: `${origin}/premium/cancelled`,
      metadata: {
        supabase_user_id: userId,
        planId,
        interval,
        checkout_promo: checkoutPromoKey,
        terms_version: LEGAL_POLICY_VERSIONS.terms_of_service,
        refund_policy_version: LEGAL_POLICY_VERSIONS.refund_policy,
        subscription_terms_version: LEGAL_POLICY_VERSIONS.subscription_billing_terms,
        include_pro_trial: includeProTrial ? "true" : "false",
      },
    };

    if (discounts?.length) {
      sessionConfig.discounts = discounts;
    }

    console.log("Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create(sessionConfig);

    const { error: pendingInsertError } = await supabase.from("payment_transactions").insert({
      user_id: userId,
      stripe_payment_intent_id: `pending_${session.id}`,
      stripe_customer_id: customerId,
      stripe_checkout_session_id: session.id,
      stripe_subscription_id: null,
      amount: 0,
      currency: "usd",
      status: "pending",
      payment_method_type: "card",
      metadata: { checkout_session_pending: true },
    });
    if (pendingInsertError) {
      console.error("Pending checkout row insert failed (session still valid in Stripe):", pendingInsertError);
    }

    console.log(`Checkout session created: ${session.id}`);
    await captureServerEvent(userId, "checkout_started", {
      plan_tier: normalizePlanTier(planId),
      interval: normalizeBillingInterval(interval),
      is_upgrade: false,
      had_trial: includeProTrial,
      session_reused: false,
    });
    const body: CreateCheckoutResponse = {
      type: "checkout",
      sessionId: session.id,
      url: session.url!,
    };
    return NextResponse.json(body);
  } catch (error: unknown) {
    console.error("Stripe checkout error:", sanitizeError(error));

    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("API key")) {
      return NextResponse.json({ error: "Stripe API configuration error" }, { status: 500 });
    }
    if (message.includes("No such price")) {
      return NextResponse.json({ error: "Invalid price configuration" }, { status: 500 });
    }
    if (message.includes("promotion_code")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message || "Checkout failed" }, { status: 500 });
  }
}
