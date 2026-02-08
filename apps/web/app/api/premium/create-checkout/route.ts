/**
 * Stripe Checkout Session Creation
 * 
 * This endpoint creates a Stripe checkout session for premium upgrade
 * Supports both extension (JWT) and web (session) authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUserId(req: NextRequest): Promise<string | null> {
  // Try JWT (extension)
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = await verifyToken(token);
      if (decoded) return decoded.userId || decoded.sub;
    } catch (error) {
      console.error('JWT verification error:', error);
    }
  }

  // Try session (web)
  const cookieStore = cookies();
  const sessionClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() { },
        remove() { },
      },
    }
  );

  const { data: { user } } = await sessionClient.auth.getUser();
  return user?.id || null;
}

const PRICES = {
  pro: {
    month: process.env.STRIPE_PRICE_PRO_MONTHLY,
    year: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
  dedicated: {
    month: process.env.STRIPE_PRICE_DEDICATED_MONTHLY,
    year: process.env.STRIPE_PRICE_DEDICATED_YEARLY,
  }
};

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planId = 'pro', interval = 'year' } = body;

    // Validate Plan
    if (!['pro', 'dedicated'].includes(planId) || !['month', 'year'].includes(interval)) {
      return NextResponse.json({ error: 'Invalid plan or interval' }, { status: 400 });
    }

    // Get Stripe Price ID
    // @ts-ignore
    const priceId = PRICES[planId]?.[interval];

    if (!priceId) {
      console.error(`Missing Price ID for ${planId} - ${interval}`);
      return NextResponse.json(
        { error: 'Configuration Error: Price ID not found. Please contact support.' },
        { status: 500 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, first_name, last_name, stripe_customer_id')
      .eq('user_id', userId)
      .single();

    // Create/Get Customer (Same logic as before)
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email,
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('user_id', userId);
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://www.trackmyopt.com';


    // Determine Promo Code (Auto-Apply)
    let promotionCode: string | undefined;
    if (planId === 'pro') {
      promotionCode = process.env.STRIPE_PROMO_CODE_PRO;
    } else if (planId === 'dedicated') {
      promotionCode = process.env.STRIPE_PROMO_CODE_DEDICATED;
    }

    // Create Subscription Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: planId === 'pro' ? 7 : undefined, // 7-Day Trial for Pro only
        metadata: {
          planId,
          interval
        }
      },
      success_url: `${origin}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        supabase_user_id: userId,
        planId,
        interval
      },
      // Apply discount if exists, otherwise allow user to enter code
      discounts: promotionCode ? [{ promotion_code: promotionCode }] : undefined,
      allow_promotion_codes: promotionCode ? undefined : true,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

