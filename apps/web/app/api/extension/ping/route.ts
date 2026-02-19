import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Admin client to bypass RLS
const getAdminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/extension/ping
 * Called by the extension to register its presence
 * This endpoint is specifically for extension session tracking
 */
export async function POST(req: NextRequest) {
  try {
    // Extension must use JWT auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = decoded.userId || decoded.sub;
    const body = await req.json().catch(() => ({}));
    const version = body.version || 'Unknown';

    const supabase = getAdminClient();

    // Get IP from headers
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'Unknown';

    // Check if extension session exists
    const { data: existingSession } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('device_type', 'extension')
      .eq('is_active', true)
      .single();

    if (existingSession) {
      // Update existing session
      await supabase
        .from('user_sessions')
        .update({
          last_active_at: new Date().toISOString(),
          device_info: `Chrome Extension v${version}`,
          ip_address: ip,
        })
        .eq('id', existingSession.id);
    } else {
      // Create new session
      await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          device_type: 'extension',
          device_info: `Chrome Extension v${version}`,
          ip_address: ip,
          last_active_at: new Date().toISOString(),
          is_active: true,
        });
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Extension registered' 
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Extension ping error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * GET /api/extension/ping
 * Check if extension is registered for a user
 */
export async function GET(req: NextRequest) {
  try {
    // Try JWT first
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = await verifyToken(token);
      if (decoded) {
        userId = decoded.userId || decoded.sub;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const supabase = getAdminClient();

    // Check if extension has active session in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: session } = await supabase
      .from('user_sessions')
      .select('last_active_at, device_info')
      .eq('user_id', userId)
      .eq('device_type', 'extension')
      .eq('is_active', true)
      .gte('last_active_at', sevenDaysAgo.toISOString())
      .order('last_active_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      ok: true,
      isConnected: !!session,
      lastActiveAt: session?.last_active_at || null,
      version: session?.device_info || null,
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Extension ping GET error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
