import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getUserId } from "@/lib/auth/getUserId";
import { applyStripeCheckoutSession } from "@/lib/premium/applyStripeCheckoutSession";
import { sanitizeError } from "@/lib/secure-logger";
import { requireLiveStripeKeyInProduction } from "@/lib/stripe/requireLiveKeyInProduction";

export const dynamic = "force-dynamic";

const getStripe = () => {
  requireLiveStripeKeyInProduction();
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
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

    return NextResponse.json({
      ok: true,
      alreadyRecorded: result.alreadyRecorded,
    });
  } catch (e) {
    console.error("confirm-checkout:", sanitizeError(e));
    return NextResponse.json({ ok: false, error: "Failed to confirm checkout" }, { status: 500 });
  }
}
