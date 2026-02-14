import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

/**
 * GET - Check if user has premium access
 */
export async function GET(req: NextRequest) {
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
      const cookieStore = cookies();
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
        headers: corsHeaders
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
      console.error('Error checking premium status:', error);
      return NextResponse.json({
        isPremium: false,
        error: error.message
      }, {
        status: 200,
        headers: corsHeaders
      });
    }

    // If no profile found or premium_status is false
    if (!data || !data.premium_status) {
      return NextResponse.json({
        isPremium: false,
        purchasedAt: null
      }, {
        status: 200,
        headers: corsHeaders
      });
    }

    // User has premium (active subscription)
    // Check if subscription has expired
    const now = new Date();
    const expiresAt = data.subscription_expires_at ? new Date(data.subscription_expires_at) : null;

    // If expired more than 3 days ago (grace period), revoke access
    // We allow slight grace period for webhook delays or payment retries
    if (expiresAt && expiresAt < now) {
      // Optional: You could trigger a DB update here to set premium_status=false
      // but purely reading is safer for this endpoint.
      return NextResponse.json({
        isPremium: false,
        expired: true,
        expiresAt: data.subscription_expires_at,
        customerId: data.stripe_customer_id
      }, {
        status: 200,
        headers: corsHeaders
      });
    }

    return NextResponse.json({
      isPremium: true,
      planName: data.plan_tier || 'pro',
      expiresAt: data.subscription_expires_at,
      purchasedAt: data.premium_purchased_at,
      customerId: data.stripe_customer_id
    }, {
      status: 200,
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('GET /api/premium/status error:', error);
    return NextResponse.json(
      { isPremium: false },
      {
        status: 200,
        headers: corsHeaders
      }
    );
  }
}

