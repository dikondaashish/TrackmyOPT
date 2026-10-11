import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { cancelStripeSubscriptionsForCustomer } from '@/lib/premium/cancel-stripe-subscriptions-for-customer';
import { logIdPrefix, sanitizeError, secureLog } from '@/lib/secure-logger';
import { deleteAccountData } from '@/lib/privacy/delete-account-data';

export const dynamic = 'force-dynamic';

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: '2026-08-26.dahlia',
  });
}

async function handleDELETE() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Cookie setting can fail in middleware
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // Cookie removal can fail in middleware
            }
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const userEmail = user.email;

    // Use service role key to delete user and related data
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Load billing id before any row deletes (profiles row holds stripe_customer_id)
    const { data: billingProfile, error: billingError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (billingError) throw new Error('Account deletion: billing lookup failed');

    const stripeCustomerId = billingProfile?.stripe_customer_id?.trim() || null;

    // Cancel active Stripe subscriptions so the user is not charged after leaving
    if (stripeCustomerId) {
      const stripe = getStripe();
      if (!stripe) {
        throw new Error('Account deletion: payment provider unavailable');
      } else {
        try {
          const { cancelledIds } = await cancelStripeSubscriptionsForCustomer(stripe, stripeCustomerId);
          if (cancelledIds.length > 0) {
            secureLog.log(
              `Account delete: cancelled Stripe subscriptions: ${cancelledIds.map((id) => logIdPrefix(id)).join(', ')}`,
            );
          }
        } catch (err: unknown) {
          const code =
            typeof err === 'object' && err !== null && 'code' in err
              ? String((err as { code?: string }).code)
              : '';
          const message = err instanceof Error ? err.message : String(err);
          // Customer already removed in Stripe — still delete our account
          if (code === 'resource_missing' || message.includes('No such customer')) {
            secureLog.warn(
              'Account delete: Stripe customer not found, continuing:',
              logIdPrefix(stripeCustomerId),
            );
          } else {
            secureLog.error('Account delete: Stripe subscription cancel failed:', sanitizeError(err));
            return NextResponse.json(
              {
                error:
                  'We could not cancel your subscription with our payment provider. Open Settings → Subscription → Manage billing to cancel, then try deleting your account again.',
              },
              { status: 502 }
            );
          }
        }
      }
    }

    await deleteAccountData(supabaseAdmin, userId, userEmail);

    // Finally, delete the user from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Account deletion: Auth cleanup failed');
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    // Sign out the user
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) console.error('Account deletion: session cleanup failed after Auth deletion');

    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });

  } catch {
    console.error('Account deletion: cleanup failed');
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

export const DELETE = withSentryApiErrors(handleDELETE, '/api/auth/delete-account', 'DELETE');
