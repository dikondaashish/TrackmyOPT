import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

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
      return NextResponse.json({ isPremium: false }, { status: 200 });
    }

    // TODO: Check premium status from database
    // For now, return false (no one has premium yet)
    // Later: Check `premium_users` table or `profiles.is_premium` column
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('premium_users')
      .select('user_id, expires_at')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking premium status:', error);
      return NextResponse.json({ isPremium: false }, { status: 200 });
    }

    // If no premium record found, user is not premium
    if (!data) {
      return NextResponse.json({ isPremium: false }, { status: 200 });
    }

    // Check if premium is still valid (lifetime means expires_at is null)
    const isPremium = data.expires_at === null || new Date(data.expires_at) > new Date();

    return NextResponse.json({ isPremium }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/premium/status error:', error);
    return NextResponse.json(
      { isPremium: false },
      { status: 200 } // Return 200 with false to avoid breaking the UI
    );
  }
}

