import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applyStripeCheckoutSession } from '@/lib/premium/applyStripeCheckoutSession';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock the email sender
vi.mock('@/lib/notifications/email-service', () => ({
  sendPremiumWelcomeEmail: vi.fn(() => Promise.resolve()),
}));

describe('applyStripeCheckoutSession', () => {
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
      id: 'cs_test_123',
      customer: 'cus_test_123',
      payment_intent: 'pi_test_123',
      amount_total: 4900,
      currency: 'usd',
      metadata: {
        supabase_user_id: 'user_123',
        planId: 'pro',
      },
      customer_details: {
        email: 'test@example.com',
        name: 'Test User',
      } as Stripe.Checkout.Session.CustomerDetails,
      payment_method_types: ['card'],
    };
  });

  const setupSupabaseMock = ({ txExists = false, profileUpdated = true, insertFails = false }) => {
    // Chain for payment_transactions
    const txChainable = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: txExists ? { id: 'tx_123' } : null }),
      update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
      }),
      insert: vi.fn().mockResolvedValue({ error: insertFails ? { message: 'Duplicate error', code: '23505' } : null }),
    };

    // Chain for profiles
    const profileChainable = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockImplementation((cols) => {
          // If resolving user_id update
          if (cols === 'user_id') {
              return Promise.resolve({ data: profileUpdated ? [{ user_id: 'user_123' }] : [], error: null });
          }
          // If revolving referred_by
          return {
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({ data: { referred_by: null } }),
          };
      }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'payment_transactions') return txChainable;
      if (table === 'profiles') return profileChainable;
      return txChainable;
    });

    return { txChainable, profileChainable };
  };

  it('fails if supabase_user_id metadata is missing', async () => {
    mockSession.metadata = {};
    const result = await applyStripeCheckoutSession({
      stripe: mockStripe as Stripe,
      supabase: mockSupabase as SupabaseClient,
      session: mockSession as Stripe.Checkout.Session,
    });

    expect(result).toEqual({ ok: false, reason: 'missing_supabase_user_id' });
  });

  it('successfully upgrades a user to premium on new transaction', async () => {
    setupSupabaseMock({ txExists: false, profileUpdated: true });

    const result = await applyStripeCheckoutSession({
      stripe: mockStripe as Stripe,
      supabase: mockSupabase as SupabaseClient,
      session: mockSession as Stripe.Checkout.Session,
    });

    expect(result).toEqual({ ok: true, alreadyRecorded: false });
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    expect(mockSupabase.from).toHaveBeenCalledWith('payment_transactions');
  });

  it('skips insert and returns alreadyRecorded if transaction exists', async () => {
    setupSupabaseMock({ txExists: true, profileUpdated: true });

    const result = await applyStripeCheckoutSession({
      stripe: mockStripe as Stripe,
      supabase: mockSupabase as SupabaseClient,
      session: mockSession as Stripe.Checkout.Session,
    });

    expect(result).toEqual({ ok: true, alreadyRecorded: true });
  });

  it('returns an error if the profile update returns empty data', async () => {
    setupSupabaseMock({ txExists: false, profileUpdated: false });

    const result = await applyStripeCheckoutSession({
      stripe: mockStripe as Stripe,
      supabase: mockSupabase as SupabaseClient,
      session: mockSession as Stripe.Checkout.Session,
    });

    expect(result).toEqual({ ok: false, reason: 'profile_not_found_for_metadata_user' });
  });
});
