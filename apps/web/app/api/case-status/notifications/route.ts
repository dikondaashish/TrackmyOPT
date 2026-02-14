import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store',
};

/**
 * Get user ID from either JWT token or session
 */
async function getUserId(req: NextRequest): Promise<string | null> {
  // Try JWT token first (for extension)
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    if (decoded) {
      return decoded.userId || decoded.sub;
    }
  }

  // Fall back to session cookies (for web)
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
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * PATCH /api/case-status/notifications
 * Toggle notification settings for user's case
 */
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { notifications_enabled } = body;

    if (typeof notifications_enabled !== 'boolean') {
      return NextResponse.json(
        { ok: false, error: 'Invalid notifications_enabled value' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Use service role key to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update notification settings
    const { error: updateError } = await supabaseAdmin
      .from('case_status')
      .update({ 
        notifications_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating notifications:', updateError);
      return NextResponse.json(
        { ok: false, error: 'Failed to update notification settings' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { ok: true, message: 'Notification settings updated' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in PATCH /api/case-status/notifications:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

