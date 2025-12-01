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
        set() {},
        remove() {},
      },
    }
  );

  const { data: { user } } = await sessionClient.auth.getUser();
  return user?.id || null;
}

export async function POST(req: NextRequest) {
  try {
    // Get user ID from JWT or session
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name, premium_status, stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Check if already premium
    if (profile?.premium_status) {
      return NextResponse.json(
        { error: 'Already premium', isPremium: true },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId = profile?.stripe_customer_id;

    // If customer ID exists, verify it's valid in this Stripe account
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch (error: any) {
        // Customer doesn't exist (maybe switched Stripe accounts), create new one
        customerId = null;
      }
    }

    // Create new customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email,
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);

    }

    // Get the origin from the request or use production URL
    const origin = req.headers.get('origin') || 
                   req.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
                   process.env.NEXT_PUBLIC_APP_URL || 
                   'https://www.trackmyopt.com';
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 299, // $2.99 in cents
            product_data: {
              name: 'TrackMyOPT Premium - Lifetime Access',
              description: 'Daily email reminders for your OPT deadlines (lifetime access)',
              images: [
                `${origin}/premium-icon.png`
              ],
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium/cancelled`,
      metadata: {
        supabase_user_id: userId,
      },
      allow_promotion_codes: true, // Allow promo codes
      billing_address_collection: 'auto',
    });


    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

