/**
 * Apply premium access from a Stripe Checkout Session (subscription or one-time).
 * Used by the Stripe webhook and by /api/premium/confirm-checkout so users are
 * upgraded immediately after redirect, not only when the webhook fires.
 */

import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendPremiumWelcomeEmail } from "@/lib/notifications/email-service";

function resolvePaymentIntentId(session: Stripe.Checkout.Session): string {
  const pi = session.payment_intent;
  if (typeof pi === "string" && pi.length > 0) return pi;
  if (pi && typeof pi === "object" && "id" in pi && typeof (pi as { id: string }).id === "string") {
    return (pi as { id: string }).id;
  }
  // Subscription Checkout often has no PaymentIntent on the Session; use subscription or session id
  if (session.subscription) {
    const sub =
      typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription as { id: string }).id;
    return sub.startsWith("sub_") ? sub : `sub_${sub}`;
  }
  return `cs_${session.id}`;
}

export function resolveStripeSubscriptionId(session: Stripe.Checkout.Session): string | null {
  if (!session.subscription) return null;
  if (typeof session.subscription === "string") return session.subscription;
  if (typeof session.subscription === "object" && session.subscription && "id" in session.subscription) {
    return (session.subscription as { id: string }).id;
  }
  return null;
}

export async function applyStripeCheckoutSession(args: {
  stripe: Stripe;
  supabase: SupabaseClient;
  session: Stripe.Checkout.Session;
  options?: {
    /** If true, skip welcome email + referral RPC (e.g. duplicate / retry) */
    skipSideEffects?: boolean;
  };
}): Promise<{ ok: true; alreadyRecorded: boolean } | { ok: false; reason: string }> {
  const { stripe, supabase, session, options } = args;
  const userId = session.metadata?.supabase_user_id;

  if (!userId) {
    return { ok: false, reason: "missing_supabase_user_id" };
  }

  const { data: existingTx } = await supabase
    .from("payment_transactions")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  const paymentIntentId = resolvePaymentIntentId(session);
  const stripeSubscriptionId = resolveStripeSubscriptionId(session);

  // Fallback expiry: derive from plan metadata if set, otherwise default to 32 days
  // (monthly safety net). Annual plans detected via planId metadata get 366 days.
  const planId = (session.metadata?.planId || "").toLowerCase();
  const isAnnual = planId.includes("annual") || planId.includes("yearly") || planId.includes("year");
  let expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (isAnnual ? 366 : 32));

  // Prefer the real Stripe period_end over the fallback — override when available.
  const subscriptionIdForRetrieve = resolveStripeSubscriptionId(session);
  if (subscriptionIdForRetrieve) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionIdForRetrieve);
      const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;
      if (typeof periodEnd === "number") {
        expiresAt = new Date(periodEnd * 1000);
      }
    } catch (e) {
      console.error("applyStripeCheckoutSession: subscription retrieve failed, using fallback period", e);
    }
  }

  const planTier = session.metadata?.planId || "pro";
  const isProCheckout = String(planTier).toLowerCase() === "pro";

  const { data: updatedProfiles, error: profileError } = await supabase
    .from("profiles")
    .update({
      premium_status: true,
      premium_purchased_at: new Date().toISOString(),
      stripe_customer_id: session.customer as string,
      stripe_payment_intent_id: paymentIntentId,
      plan_tier: planTier,
      subscription_expires_at: expiresAt.toISOString(),
      ...(isProCheckout ? { pro_free_trial_consumed: true } : {}),
    })
    .eq("user_id", userId)
    .select("user_id");

  if (profileError) {
    console.error("applyStripeCheckoutSession profile update:", profileError);
    return { ok: false, reason: profileError.message };
  }

  if (!updatedProfiles?.length) {
    console.error("applyStripeCheckoutSession: no profile row updated for user_id", userId);
    return { ok: false, reason: "profile_not_found_for_metadata_user" };
  }

  const txPayload = {
    stripe_payment_intent_id: paymentIntentId,
    stripe_customer_id: session.customer as string,
    stripe_checkout_session_id: session.id,
    stripe_subscription_id: stripeSubscriptionId,
    amount: session.amount_total ?? 0,
    currency: session.currency || "usd",
    status: "succeeded" as const,
    payment_method_type: session.payment_method_types?.[0] || "card",
    metadata: {
      session_id: session.id,
      plan_id: planTier,
      customer_email: session.customer_details?.email,
    },
    updated_at: new Date().toISOString(),
  };

  if (existingTx) {
    const { error: updErr } = await supabase
      .from("payment_transactions")
      .update(txPayload)
      .eq("id", existingTx.id);
    if (updErr) {
      console.error("applyStripeCheckoutSession transaction update (pending→succeeded):", updErr);
      return { ok: false, reason: updErr.message };
    }
    return { ok: true, alreadyRecorded: true };
  }

  const { error: transactionError } = await supabase.from("payment_transactions").insert({
    user_id: userId,
    ...txPayload,
  });

  if (transactionError) {
    // Webhook + /api/premium/confirm-checkout can race; unique on stripe_payment_intent_id causes 23505.
    const code = (transactionError as { code?: string }).code;
    const dupKey =
      code === "23505" ||
      transactionError.message?.toLowerCase().includes("duplicate") ||
      transactionError.message?.toLowerCase().includes("unique");
    if (dupKey) {
      const { data: existingBySession } = await supabase
        .from("payment_transactions")
        .select("id")
        .eq("stripe_checkout_session_id", session.id)
        .maybeSingle();
      if (existingBySession) {
        console.log("applyStripeCheckoutSession: duplicate insert ignored (row exists for session)", session.id);
        return { ok: true, alreadyRecorded: true };
      }
      const { data: existingByPi } = await supabase
        .from("payment_transactions")
        .select("id")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle();
      if (existingByPi) {
        console.log("applyStripeCheckoutSession: duplicate insert ignored (row exists for payment ref)", paymentIntentId);
        return { ok: true, alreadyRecorded: true };
      }
    }
    console.error("applyStripeCheckoutSession transaction insert:", transactionError);
    return { ok: false, reason: transactionError.message };
  }

  if (!options?.skipSideEffects) {
    if (session.customer_details?.email) {
      await sendPremiumWelcomeEmail(
        userId,
        session.customer_details.email,
        session.customer_details.name || "Student"
      ).catch(() => {});
    }

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("user_id", userId)
      .maybeSingle();

    if (userProfile?.referred_by) {
      const { error: rpcErr } = await supabase.rpc("increment_referral_conversions", {
        ref_code: userProfile.referred_by,
      });
      if (rpcErr) console.warn("increment_referral_conversions:", rpcErr.message);
    }
  }

  return { ok: true, alreadyRecorded: false };
}
