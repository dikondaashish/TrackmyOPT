import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import {
  applyResumeCreditRefund,
  fulfillResumeCreditCheckout,
} from "./fulfillment";

function checkoutSession(overrides: Partial<Stripe.Checkout.Session> = {}) {
  return {
    id: "cs_credit_123",
    status: "complete",
    payment_status: "paid",
    currency: "usd",
    amount_total: 500,
    customer: "cus_123",
    payment_intent: "pi_123",
    payment_method_types: ["card"],
    customer_details: { email: "student@example.com" },
    metadata: {
      purchase_type: "resume_credit_pack",
      supabase_user_id: "user-123",
      pack_quantity: "5",
    },
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

function fulfillmentClient() {
  const rpc = vi.fn().mockResolvedValue({
    data: [{ already_granted: false, credit_balance: 50 }],
    error: null,
  });
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const is = vi.fn().mockResolvedValue({ error: null });
  const eq = vi.fn(() => ({ is }));
  const update = vi.fn(() => ({ eq }));
  const from = vi.fn((table: string) => {
    if (table === "payment_transactions") return { upsert };
    if (table === "profiles") return { update };
    throw new Error(`Unexpected table: ${table}`);
  });

  return {
    client: { rpc, from } as unknown as SupabaseClient,
    rpc,
    upsert,
  };
}

describe("resume-credit fulfillment", () => {
  it("grants 50 credits for an exact $5 one-time payment", async () => {
    const { client, rpc, upsert } = fulfillmentClient();

    const result = await fulfillResumeCreditCheckout(checkoutSession(), client);

    expect(result).toEqual({
      alreadyGranted: false,
      creditBalance: 50,
      creditsGranted: 50,
    });
    expect(rpc).toHaveBeenCalledWith(
      "grant_resume_credit_purchase",
      expect.objectContaining({
        p_pack_quantity: 5,
        p_amount_paid_cents: 500,
        p_credits_granted: 50,
      })
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 500, plan_id: "resume_credits" }),
      { onConflict: "stripe_payment_intent_id" }
    );
  });

  it("rejects a payment whose Stripe total does not match the pack", async () => {
    const { client, rpc } = fulfillmentClient();

    await expect(
      fulfillResumeCreditCheckout(checkoutSession({ amount_total: 499 }), client)
    ).rejects.toThrow("amount does not match");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("applies cumulative Stripe refunds through the credit ledger", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{ handled: true, user_id: "user-123", credits_revoked: 10, credit_balance: 40 }],
      error: null,
    });
    const client = { rpc } as unknown as SupabaseClient;
    const charge = {
      id: "ch_123",
      payment_intent: "pi_123",
      amount_refunded: 100,
    } as unknown as Stripe.Charge;

    await expect(applyResumeCreditRefund(charge, "evt_refund", client)).resolves.toEqual({
      handled: true,
      userId: "user-123",
      creditsRevoked: 10,
      creditBalance: 40,
    });
  });
});
