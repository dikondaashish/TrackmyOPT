import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// CORS headers for Chrome extension
const getCorsHeaders = (req?: NextRequest) => {
  const origin = req?.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
};

// Handle preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: getCorsHeaders(req) });
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
        headers: getCorsHeaders(req)
      });
    }

    // Check premium status from profiles table
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('profiles')
      .select('premium_status, premium_purchased_at, stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking premium status:', error);
      return NextResponse.json({ 
        isPremium: false,
        error: error.message
      }, { 
        status: 200,
        headers: getCorsHeaders(req)
      });
    }

    // If no profile found or premium_status is false
    if (!data || !data.premium_status) {
      return NextResponse.json({ 
        isPremium: false,
        purchasedAt: null
      }, { 
        status: 200,
        headers: getCorsHeaders(req)
      });
    }

    // User has premium (lifetime access)
    return NextResponse.json({ 
      isPremium: true,
      purchasedAt: data.premium_purchased_at,
      customerId: data.stripe_customer_id
    }, { 
      status: 200,
      headers: getCorsHeaders(req)
    });
  } catch (error: any) {
    console.error('GET /api/premium/status error:', error);
    return NextResponse.json(
      { isPremium: false },
      { 
        status: 200,
        headers: getCorsHeaders(req)
      }
    );
  }
}

