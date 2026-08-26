import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import {
  creditsForPackQuantity,
  isAllowedResumeCreditPackQuantity,
  RESUME_CREDIT_PRICE_CENTS,
} from "./config";

export const RESUME_CREDIT_PURCHASE_TYPE = "resume_credit_pack";

export function isResumeCreditCheckout(
  session: Stripe.Checkout.Session
): boolean {
  return session.metadata?.purchase_type === RESUME_CREDIT_PURCHASE_TYPE;
}

function getServiceClient(): SupabaseClient {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service credentials are not configured");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function referenceId(
  value: string | { id: string } | null
): string | null {
  if (typeof value === "string") return value;
  return value?.id ?? null;
}

export interface ResumeCreditFulfillmentResult {
  alreadyGranted: boolean;
  creditBalance: number;
  creditsGranted: number;
}

export async function fulfillResumeCreditCheckout(
  session: Stripe.Checkout.Session,
  supabase: SupabaseClient = getServiceClient()
): Promise<ResumeCreditFulfillmentResult> {
  if (!isResumeCreditCheckout(session)) {
    throw new Error("Checkout is not a resume-credit purchase");
  }
  if (session.status !== "complete" || session.payment_status !== "paid") {
    throw new Error("Resume-credit payment is not complete");
  }

  const userId = session.metadata?.supabase_user_id?.trim();
  const quantity = Number(session.metadata?.pack_quantity);
  const paymentIntentId = referenceId(session.payment_intent);
  const customerId = referenceId(session.customer);
  if (!userId || !paymentIntentId || !Number.isInteger(quantity)) {
    throw new Error("Resume-credit checkout metadata is incomplete");
  }
  if (!isAllowedResumeCreditPackQuantity(quantity)) {
    throw new Error("Resume-credit checkout quantity is invalid");
  }

  const expectedAmount = quantity * RESUME_CREDIT_PRICE_CENTS;
  const creditsGranted = creditsForPackQuantity(quantity);
  if (
    session.currency?.toLowerCase() !== "usd" ||
    session.amount_total !== expectedAmount
  ) {
    throw new Error("Resume-credit checkout amount does not match the configured pack");
  }

  const { data, error } = await supabase.rpc("grant_resume_credit_purchase", {
    p_user_id: userId,
    p_checkout_session_id: session.id,
    p_payment_intent_id: paymentIntentId,
    p_customer_id: customerId,
    p_pack_quantity: quantity,
    p_amount_paid_cents: expectedAmount,
    p_credits_granted: creditsGranted,
    p_metadata: {
      purchase_type: RESUME_CREDIT_PURCHASE_TYPE,
      customer_email: session.customer_details?.email ?? null,
    },
  });
  if (error) {
    throw new Error(`Resume-credit grant failed: ${error.message}`);
  }

  const grant = Array.isArray(data) ? data[0] : data;
  if (!grant) throw new Error("Resume-credit grant returned no result");

  const { error: transactionError } = await supabase
    .from("payment_transactions")
    .upsert(
      {
        user_id: userId,
        stripe_payment_intent_id: paymentIntentId,
        stripe_customer_id: customerId,
        stripe_checkout_session_id: session.id,
        stripe_subscription_id: null,
        plan_id: "resume_credits",
        amount: expectedAmount,
        currency: "usd",
        status: "succeeded",
        payment_method_type: session.payment_method_types?.[0] || "card",
        metadata: {
          purchase_type: RESUME_CREDIT_PURCHASE_TYPE,
          pack_quantity: quantity,
          credits_granted: creditsGranted,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_payment_intent_id" }
    );
  if (transactionError) {
    throw new Error(`Resume-credit transaction log failed: ${transactionError.message}`);
  }

  if (customerId) {
    const { error: customerError } = await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", userId)
      .is("stripe_customer_id", null);
    if (customerError) {
      throw new Error(`Resume-credit customer link failed: ${customerError.message}`);
    }
  }

  return {
    alreadyGranted: grant.already_granted === true,
    creditBalance: Math.max(0, Number(grant.credit_balance || 0)),
    creditsGranted,
  };
}

export async function applyResumeCreditRefund(
  charge: Stripe.Charge,
  stripeEventId: string,
  supabase: SupabaseClient = getServiceClient()
): Promise<{
  handled: boolean;
  userId: string | null;
  creditsRevoked: number;
  creditBalance: number;
}> {
  const paymentIntentId = referenceId(charge.payment_intent);
  if (!paymentIntentId) {
    return { handled: false, userId: null, creditsRevoked: 0, creditBalance: 0 };
  }

  const { data, error } = await supabase.rpc("apply_resume_credit_refund", {
    p_payment_intent_id: paymentIntentId,
    p_charge_id: charge.id,
    p_amount_refunded_cents: charge.amount_refunded,
    p_stripe_event_id: stripeEventId,
  });
  if (error) {
    throw new Error(`Resume-credit refund failed: ${error.message}`);
  }

  const result = Array.isArray(data) ? data[0] : data;
  return {
    handled: result?.handled === true,
    userId: typeof result?.user_id === "string" ? result.user_id : null,
    creditsRevoked: Math.max(0, Number(result?.credits_revoked || 0)),
    creditBalance: Math.max(0, Number(result?.credit_balance || 0)),
  };
}
