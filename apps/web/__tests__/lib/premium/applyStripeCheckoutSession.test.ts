import { describe, it, expect, vi, beforeEach } from "vitest";
import { applyStripeCheckoutSession } from "@/lib/premium/applyStripeCheckoutSession";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/notifications/email-service", () => ({
  sendPremiumWelcomeEmail: vi.fn(() => Promise.resolve()),
}));

describe("applyStripeCheckoutSession", () => {
  let mockStripe: any;
  let mockSupabase: any;
  let mockSession: Partial<Stripe.Checkout.Session>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStripe = {
      subscriptions: {
        retrieve: vi.fn(),
      },
    };

    mockSupabase = {
      from: vi.fn(),
      rpc: vi.fn(() => Promise.resolve({ error: null })),
    };

    mockSession = {
      id: "cs_test_123",
      customer: "cus_test_123",
      payment_intent: "pi_test_123",
      amount_total: 4900,
      currency: "usd",
      metadata: {
        supabase_user_id: "user_123",
        planId: "pro",
      },
      customer_details: {
        email: "test@example.com",
        name: "Test User",
      } as Stripe.Checkout.Session.CustomerDetails,
      payment_method_types: ["card"],
    };
  });

  const setupSupabaseMock = ({
    txExists = false,
    profileUpdated = true,
    insertFails = false,
    customerLookupUserId = null as string | null,
  }) => {
    const txChainable = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: txExists ? { id: "tx_123" } : null,
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      insert: vi.fn().mockResolvedValue({
        error: insertFails
          ? { message: "Duplicate error", code: "23505" }
          : null,
      }),
    };

    // select("user_id") supports:
    // - customer fallback: .select().eq().maybeSingle()
    // - after update: .update().eq().select() awaited as a thenable
    const profileChainable = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockImplementation((cols) => {
        if (cols === "user_id") {
          return {
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: customerLookupUserId
                  ? { user_id: customerLookupUserId }
                  : null,
                error: null,
              }),
            }),
            then(
              onFulfilled: (value: unknown) => unknown,
              onRejected?: (reason: unknown) => unknown
            ) {
              return Promise.resolve({
                data: profileUpdated ? [{ user_id: "user_123" }] : [],
                error: null,
              }).then(onFulfilled, onRejected);
            },
          };
        }
        return {
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi
            .fn()
            .mockResolvedValue({ data: { referred_by: null } }),
        };
      }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "payment_transactions") return txChainable;
      if (table === "profiles") return profileChainable;
      return txChainable;
    });

    return { txChainable, profileChainable };
  };

  it("fails if supabase_user_id metadata is missing and no customer match", async () => {
    mockSession.metadata = {};
    setupSupabaseMock({ customerLookupUserId: null });

    const result = await applyStripeCheckoutSession({
      stripe: mockStripe as Stripe,
      supabase: mockSupabase as SupabaseClient,
      session: mockSession as Stripe.Checkout.Session,
    });

    expect(result).toEqual({ ok: false, reason: "missing_supabase_user_id" });
  });

  it("resolves user via stripe_customer_id when metadata is missing", async () => {
    mockSession.metadata = { planId: "pro" };
    setupSupabaseMock({
      txExists: false,
      profileUpdated: true,
      customerLookupUserId: "user_123",
    });

    const result = await applyStripeCheckoutSession({
      stripe: mockStripe as Stripe,
      supabase: mockSupabase as SupabaseClient,
      session: mockSession as Stripe.Checkout.Session,
    });

    expect(result).toEqual({ ok: true, alreadyRecorded: false });
  });

  it("successfully upgrades a user to premium on new transaction", async () => {
    setupSupabaseMock({ txExists: false, profileUpdated: true });

    const result = await applyStripeCheckoutSession({
      stripe: mockStripe as Stripe,
      supabase: mockSupabase as SupabaseClient,
      session: mockSession as Stripe.Checkout.Session,
    });

    expect(result).toEqual({ ok: true, alreadyRecorded: false });
    expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
    expect(mockSupabase.from).toHaveBeenCalledWith("payment_transactions");
  });

  it("skips insert and returns alreadyRecorded if transaction exists", async () => {
    setupSupabaseMock({ txExists: true, profileUpdated: true });

    const result = await applyStripeCheckoutSession({
      stripe: mockStripe as Stripe,
      supabase: mockSupabase as SupabaseClient,
      session: mockSession as Stripe.Checkout.Session,
    });

    expect(result).toEqual({ ok: true, alreadyRecorded: true });
  });

  it("returns an error if the profile update returns empty data", async () => {
    setupSupabaseMock({ txExists: false, profileUpdated: false });

    const result = await applyStripeCheckoutSession({
      stripe: mockStripe as Stripe,
      supabase: mockSupabase as SupabaseClient,
      session: mockSession as Stripe.Checkout.Session,
    });

    expect(result).toEqual({
      ok: false,
      reason: "profile_not_found_for_metadata_user",
    });
  });
});
