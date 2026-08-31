import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserId } from "@/lib/auth/get-user-id";
import { requireLiveStripeKeyInProduction } from "@/lib/stripe/require-live-key-in-production";
import {
  fulfillResumeCreditCheckout,
  isResumeCreditCheckout,
} from "@/lib/resume-credits/fulfillment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Invalid checkout session" }, { status: 400 });
    }

    requireLiveStripeKeyInProduction();
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-08-26.dahlia",
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (!isResumeCreditCheckout(session)) {
      return NextResponse.json({ error: "Not a resume-credit checkout" }, { status: 400 });
    }
    if (session.metadata?.supabase_user_id !== userId) {
      return NextResponse.json({ error: "Checkout does not belong to this account" }, { status: 403 });
    }

    const result = await fulfillResumeCreditCheckout(session);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[resume-credit-confirm]", error);
    return NextResponse.json(
      { error: "Unable to confirm resume credits yet. Please refresh shortly." },
      { status: 500 }
    );
  }
}
