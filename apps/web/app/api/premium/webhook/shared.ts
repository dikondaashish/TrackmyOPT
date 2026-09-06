import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sanitizeError, secureLog } from '@/lib/secure-logger';
import { requireLiveStripeKeyInProduction } from '@/lib/stripe/require-live-key-in-production';
import { syncUserLtvToPostHog } from '@/lib/posthog/ltv-sync';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createBillingPortalUrl(
  stripe: Stripe,
  customerId: string
): Promise<string | null> {
  try {
    const allowedOrigin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://www.trackmyopt.com';
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${allowedOrigin}/dashboard/settings?tab=subscription`,
    });
    return session.url ?? null;
  } catch (e) {
    secureLog.warn('createBillingPortalUrl failed:', sanitizeError(e));
    return null;
  }
}

export function getStripe(): Stripe {
  requireLiveStripeKeyInProduction();
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-08-26.dahlia',
  });
}

export async function refreshPostHogLtv(userId: string): Promise<void> {
  try {
    await syncUserLtvToPostHog(supabase, userId);
  } catch (error) {
    secureLog.warn('posthog ltv sync failed', sanitizeError(error));
  }
}

/** Prefer checkout metadata; fall back to profiles.stripe_customer_id for analytics. */
export async function resolveCheckoutAnalyticsUserId(
  session: Stripe.Checkout.Session
): Promise<string | null> {
  const meta = session.metadata?.supabase_user_id;
  if (typeof meta === "string" && meta.trim()) return meta.trim();

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (!customerId) return null;

  // Analytics only needs user_id — do not require email (resolveUserForStripeCustomer does).
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return typeof profile?.user_id === "string" && profile.user_id.trim()
    ? profile.user_id.trim()
    : null;
}

export async function updateTransactionStatus(
  paymentIntentId: string,
  status: string,
  failureReason?: string
) {
  try {
    const { error } = await supabase
      .from('payment_transactions')
      .update({
        status,
        failure_reason: failureReason,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntentId);

    if (error) {
      secureLog.error('Error updating transaction status:', sanitizeError(error));
      throw new Error(`Transaction status update failed: ${error.message}`);
    }
  } catch (error) {
    secureLog.error('Error in updateTransactionStatus:', sanitizeError(error));
    throw error;
  }
}
