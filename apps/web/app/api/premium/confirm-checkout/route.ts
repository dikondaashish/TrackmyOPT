import { NextRequest, NextResponse, after } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getUserId } from "@/lib/auth/get-user-id";
import { applyStripeCheckoutSession } from "@/lib/premium/apply-stripe-checkout-session";
import { sanitizeError } from "@/lib/secure-logger";
import { requireLiveStripeKeyInProduction } from "@/lib/stripe/require-live-key-in-production";
import { billingInsertId } from "@/lib/posthog/billing-analytics";
import {
  captureServerEvent,
  normalizePlanTier,
} from "@/lib/posthog-server";

export const dynamic = "force-dynamic";

const getStripe = () => {
  requireLiveStripeKeyInProduction();
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-08-26.dahlia",
  });
};

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "payment_intent"],
    });

    if (session.metadata?.supabase_user_id !== userId) {
      return NextResponse.json({ ok: false, error: "Session does not belong to this account" }, { status: 403 });
    }

    if (session.status !== "complete") {
      return NextResponse.json(
        { ok: false, error: "Checkout session is not complete yet" },
        { status: 400 }
      );
    }
    const paidLike =
      session.payment_status === "paid" || session.payment_status === "no_payment_required";
    if (!paidLike) {
      return NextResponse.json(
        { ok: false, error: "Payment not completed for this session" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const result = await applyStripeCheckoutSession({ stripe, supabase, session });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.reason }, { status: 500 });
    }

    if (!result.alreadyRecorded) {
      after(() => {
        void captureServerEvent(userId, "premium_checkout_completed", {
          plan_tier: normalizePlanTier(session.metadata?.planId),
          stripe_session_id: sessionId,
          source: "confirm_checkout_api",
          $insert_id: billingInsertId("premium_checkout_completed", sessionId),
        });
      });
    }

    let subscriptionStatus: string | null = null;
    let trialEnd: string | null = null;
    const subRef = session.subscription;
    const subObj =
      typeof subRef === "object" && subRef && "status" in subRef
        ? (subRef as Stripe.Subscription)
        : null;
    if (subObj) {
      subscriptionStatus = subObj.status;
      if (subObj.trial_end) {
        trialEnd = new Date(subObj.trial_end * 1000).toISOString();
      }
    } else if (typeof subRef === "string") {
      try {
        const sub = await stripe.subscriptions.retrieve(subRef);
        subscriptionStatus = sub.status;
        if (sub.trial_end) {
          trialEnd = new Date(sub.trial_end * 1000).toISOString();
        }
      } catch {
        /* non-blocking */
      }
    }

    return NextResponse.json({
      ok: true,
      alreadyRecorded: result.alreadyRecorded,
      subscriptionStatus,
      trialEnd,
      planId: session.metadata?.planId ?? null,
      interval: session.metadata?.interval ?? null,
    });
  } catch (e) {
    console.error("confirm-checkout:", sanitizeError(e));
    return NextResponse.json({ ok: false, error: "Failed to confirm checkout" }, { status: 500 });
  }
}
