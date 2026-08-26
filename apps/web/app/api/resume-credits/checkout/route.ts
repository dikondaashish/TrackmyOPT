import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import {
  addRateLimitHeaders,
  checkRateLimitByUser,
  rateLimitResponse,
} from "@/lib/auth/api-rate-limit";
import { getUserId } from "@/lib/auth/get-user-id";
import { requireLiveStripeKeyInProduction } from "@/lib/stripe/require-live-key-in-production";
import { hasActivePaidResumePlan } from "@/lib/usage-limit";
import {
  creditsForPackQuantity,
  isAllowedResumeCreditPackQuantity,
  RESUME_CREDIT_PRICE_CENTS,
} from "@/lib/resume-credits/config";
import { RESUME_CREDIT_PURCHASE_TYPE } from "@/lib/resume-credits/fulfillment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const checkoutRateLimit = {
  limit: 10,
  windowSeconds: 60 * 60,
  name: "resume-credit-checkout",
};

function getStripe(): Stripe {
  requireLiveStripeKeyInProduction();
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
  });
}

async function validateCreditPrice(stripe: Stripe, priceId: string) {
  const price = await stripe.prices.retrieve(priceId);
  if (
    !price.active ||
    price.currency.toLowerCase() !== "usd" ||
    price.unit_amount !== RESUME_CREDIT_PRICE_CENTS ||
    price.recurring != null
  ) {
    throw new Error(
      `Stripe Price ${priceId} must be an active one-time USD $1.00 Price.`
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Sign in to buy resume credits." }, { status: 401 });
    }

    const limit = await checkRateLimitByUser(userId, checkoutRateLimit);
    if (!limit.success) {
      return rateLimitResponse(limit, "Too many checkout attempts. Please try again later.");
    }

    const body = await request.json().catch(() => ({}));
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || !isAllowedResumeCreditPackQuantity(quantity)) {
      return NextResponse.json({ error: "Choose a valid resume-credit pack." }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase service credentials are not configured");
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan_tier, premium_status, subscription_expires_at, stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (profileError) throw new Error(`Unable to verify subscription: ${profileError.message}`);
    if (!profile || !hasActivePaidResumePlan(profile)) {
      return NextResponse.json(
        {
          error: "Resume-credit top-ups require an active Pro or Dedicated subscription.",
          code: "subscription_required",
        },
        { status: 403 }
      );
    }

    const priceId = process.env.STRIPE_PRICE_RESUME_CREDITS_10?.trim();
    if (!priceId) {
      throw new Error("STRIPE_PRICE_RESUME_CREDITS_10 is not configured");
    }
    const stripe = getStripe();
    await validateCreditPrice(stripe, priceId);

    let customerEmail: string | undefined;
    if (!profile.stripe_customer_id) {
      const { data: authUser, error: authUserError } =
        await supabase.auth.admin.getUserById(userId);
      if (authUserError) throw new Error(`Unable to load billing email: ${authUserError.message}`);
      customerEmail = authUser.user?.email || undefined;
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://www.trackmyopt.com"
    ).replace(/\/$/, "");
    const credits = creditsForPackQuantity(quantity);
    const metadata = {
      purchase_type: RESUME_CREDIT_PURCHASE_TYPE,
      supabase_user_id: userId,
      pack_quantity: String(quantity),
      credits_total: String(credits),
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: profile.stripe_customer_id || undefined,
      customer_email: profile.stripe_customer_id ? undefined : customerEmail,
      customer_creation: profile.stripe_customer_id ? undefined : "always",
      client_reference_id: userId,
      line_items: [{ price: priceId, quantity }],
      metadata,
      payment_intent_data: { metadata },
      allow_promotion_codes: false,
      success_url: `${siteUrl}/dashboard/career/resume-generator?credit_checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/dashboard/career/resume-generator?credit_checkout=cancelled`,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return addRateLimitHeaders(NextResponse.json({ url: session.url }), limit);
  } catch (error) {
    console.error("[resume-credit-checkout]", error);
    return NextResponse.json(
      { error: "Resume-credit checkout is temporarily unavailable." },
      { status: 500 }
    );
  }
}
