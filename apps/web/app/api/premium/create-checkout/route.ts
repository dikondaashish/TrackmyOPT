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
import { sanitizeError } from "@/lib/secure-logger";
import { requireLiveStripeKeyInProduction } from "@/lib/stripe/requireLiveKeyInProduction";
import { syncProFreeTrialConsumedFromStripe } from "@/lib/premium/proFreeTrialFromStripe";

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

    const body = await req.json();
    const { planId = "pro", interval = "year" } = body;
    /** undefined = default EARLYBIRD; null = removed; string = custom */
    const promoCode = body.promoCode as string | null | undefined;

    console.log(`Checkout request: planId=${planId}, interval=${interval}, userId=${userId}, promo=${promoCode === null ? "null" : promoCode === undefined ? "default" : "custom"}`);

    if (!["pro", "dedicated"].includes(planId) || !["month", "year"].includes(interval)) {
      return NextResponse.json({ error: "Invalid plan or interval" }, { status: 400 });
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
        console.log(`Verified existing Stripe customer: ${customerId}`);
      } catch (retrieveError: unknown) {
        console.log(`Customer ${customerId} not found in Stripe, creating new one...`);
        customerId = null;
      }
    }

    if (!customerId) {
      console.log("Creating new Stripe customer for user:", userId);
      const customer = await stripe.customers.create({
        email: profile?.email,
        name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || undefined,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("user_id", userId);
      console.log(`Created new Stripe customer: ${customerId}`);
    }

    console.log(`Using Stripe customer: ${customerId}`);

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
          return NextResponse.json({
            sessionId: existingSession.id,
            url: existingSession.url,
          });
        }
        console.log(
          `Not reusing pending session ${recentPending.stripe_checkout_session_id}: ` +
            `price match=${samePriceAsRequest}, promo match=${samePromoAsRequest} (wanted ${checkoutPromoKey}, had ${sessionPromoKey ?? "none"})`
        );
      } catch (e) {
        console.warn("Could not retrieve existing checkout session, creating a new one:", sanitizeError(e));
      }
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.trackmyopt.com";

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
    return NextResponse.json({ sessionId: session.id, url: session.url });
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
