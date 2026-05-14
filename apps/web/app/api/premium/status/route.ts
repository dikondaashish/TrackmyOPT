import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth/jwt';
import Stripe from 'stripe';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { logIdPrefix, sanitizeError, secureLog } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeadersWebAndExtension(req),
  });
}

/**
 * GET - Check if user has premium access
 */
export async function GET(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  try {
    let userId: string | null = null;

    // Try JWT token first (for extension)
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = await verifyToken(token);
      if (decoded) {
        userId = decoded.userId || decoded.sub;
      }
    }

    // Fall back to session cookies (for web)
    if (!userId) {
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
              } catch (error) { /* ignore */ }
            },
            remove(name: string, options: CookieOptions) {
              try {
                cookieStore.set({ name, value: '', ...options });
              } catch (error) { /* ignore */ }
            },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    }

    if (!userId) {
      return NextResponse.json({
        isPremium: false,
        error: 'Not authenticated'
      }, {
        status: 200,
        headers: cors
      });
    }

    // Check premium status from profiles table
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('profiles')
      .select('premium_status, plan_tier, subscription_expires_at, premium_purchased_at, stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking premium status:', sanitizeError(error));
      return NextResponse.json({
        isPremium: false,
        error: error.message
      }, {
        status: 200,
        headers: cors
      });
    }

    // If no profile found — nothing to check
    if (!data) {
      return NextResponse.json({ isPremium: false, purchasedAt: null }, { status: 200, headers: cors });
    }

    // premium_status is false in DB but a stripe_customer_id exists — the DB may have
    // been incorrectly revoked. Check Stripe directly to self-heal before returning false.
    if (!data.premium_status && data.stripe_customer_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover' });
        // Query both active and trialing — status:'active' is exact and excludes trials.
        const [activeSubs, trialSubs] = await Promise.all([
          stripe.subscriptions.list({ customer: data.stripe_customer_id, status: 'active', limit: 1 }),
          stripe.subscriptions.list({ customer: data.stripe_customer_id, status: 'trialing', limit: 1 }),
        ]);
        const foundSub = activeSubs.data[0] ?? trialSubs.data[0] ?? null;
        if (foundSub) {
          // Cast needed: current_period_end is on the Subscription object but not
          // reflected in the Stripe SDK types for this API version.
          const sub = foundSub as Stripe.Subscription & { current_period_end?: number };
          const periodEnd: number | undefined = sub.current_period_end;
          const healedExpiry = typeof periodEnd === 'number'
            ? new Date(periodEnd * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          const healedPlanTier = (sub.metadata?.planId as string | undefined) || data.plan_tier || 'pro';

          await supabase
            .from('profiles')
            .update({
              premium_status: true,
              plan_tier: healedPlanTier,
              subscription_expires_at: healedExpiry,
            })
            .eq('user_id', userId);

          secureLog.info(
            `GET /api/premium/status: self-healed premium for user ${logIdPrefix(userId)}`,
          );

          return NextResponse.json(
            {
              isPremium: true,
              planName: healedPlanTier,
              expiresAt: healedExpiry,
              purchasedAt: data.premium_purchased_at,
              customerId: data.stripe_customer_id,
            },
            { status: 200, headers: cors }
          );
        }
      } catch (stripeErr) {
        secureLog.error(
          'GET /api/premium/status: Stripe self-heal check failed:',
          sanitizeError(stripeErr),
        );
      }
      // Stripe confirmed no active sub — correctly return false
      return NextResponse.json({ isPremium: false, purchasedAt: null }, { status: 200, headers: cors });
    }

    // No stripe_customer_id or premium_status is definitively false
    if (!data.premium_status) {
      return NextResponse.json({ isPremium: false, purchasedAt: null }, { status: 200, headers: cors });
    }

    // User has premium (active subscription)
    // Check if subscription has expired
    const now = new Date();
    const expiresAt = data.subscription_expires_at ? new Date(data.subscription_expires_at) : null;

    // subscription_expires_at is in the past — check Stripe before revoking.
    // This self-heals cases where the renewal webhook fired but didn't update
    // subscription_expires_at (e.g. missing customer.subscription.updated listener).
    if (expiresAt && expiresAt < now) {
      let stripeConfirmsActive = false;
      let newExpiresAt: string | null = null;
      let newPlanTier: string | null = null;

      if (data.stripe_customer_id && process.env.STRIPE_SECRET_KEY) {
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-09-30.clover',
          });
          // Query both active and trialing — status:'active' is exact and excludes trials.
          const [activeSubs, trialSubs] = await Promise.all([
            stripe.subscriptions.list({ customer: data.stripe_customer_id, status: 'active', limit: 1 }),
            stripe.subscriptions.list({ customer: data.stripe_customer_id, status: 'trialing', limit: 1 }),
          ]);
          const foundSub = (activeSubs.data[0] ?? trialSubs.data[0] ?? null) as
            | (Stripe.Subscription & { current_period_end?: number })
            | null;
          if (foundSub) {
            stripeConfirmsActive = true;
            newPlanTier = (foundSub.metadata?.planId as string | undefined) || data.plan_tier || 'pro';
            const periodEnd: number | undefined = foundSub.current_period_end;
            if (typeof periodEnd === 'number') {
              newExpiresAt = new Date(periodEnd * 1000).toISOString();
            } else {
              newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
              secureLog.warn(
                'GET /api/premium/status: current_period_end not found; using 30-day fallback expiry',
              );
            }
          }
        } catch (stripeErr) {
          secureLog.error(
            'GET /api/premium/status: Stripe check failed, trusting DB expiry:',
            sanitizeError(stripeErr),
          );
        }
      }

      if (stripeConfirmsActive) {
        const healedExpiry = newExpiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const healedPlan = newPlanTier ?? data.plan_tier ?? 'pro';
        await supabase
          .from('profiles')
          .update({
            premium_status: true,
            plan_tier: healedPlan,
            subscription_expires_at: healedExpiry,
          })
          .eq('user_id', userId);

        return NextResponse.json(
          {
            isPremium: true,
            planName: healedPlan,
            expiresAt: healedExpiry,
            purchasedAt: data.premium_purchased_at,
            customerId: data.stripe_customer_id,
          },
          { status: 200, headers: cors }
        );
      }

      // Stripe confirmed no active subscription — safely revoke.
      const { error: revokeError } = await supabase
        .from('profiles')
        .update({
          premium_status: false,
          plan_tier: null,
        })
        .eq('user_id', userId);

      if (revokeError) {
        secureLog.error(
          'GET /api/premium/status: failed to persist expiry revocation:',
          sanitizeError(revokeError),
        );
      }

      return NextResponse.json(
        {
          isPremium: false,
          expired: true,
          expiresAt: data.subscription_expires_at,
          customerId: data.stripe_customer_id,
        },
        { status: 200, headers: cors }
      );
    }

    return NextResponse.json({
      isPremium: true,
      planName: data.plan_tier || 'pro',
      expiresAt: data.subscription_expires_at,
      purchasedAt: data.premium_purchased_at,
      customerId: data.stripe_customer_id
    }, {
      status: 200,
      headers: cors
    });
  } catch (error: unknown) {
    secureLog.error('GET /api/premium/status error:', sanitizeError(error));
    return NextResponse.json(
      { isPremium: false, error: 'internal_error' },
      { status: 500, headers: cors }
    );
  }
}

