import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

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

  // Try session (for web)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * GET /api/user/sessions
 * Get recent sessions and extension status
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const supabase = await createClient();

    // Get recent sessions (last 30 days, limit 10)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('last_active_at', thirtyDaysAgo.toISOString())
      .order('last_active_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Check if extension is connected (has activity in last 24 hours)
    const extensionSession = sessions?.find(
      s => s.device_type === 'extension' && s.is_active
    );
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const extensionConnected = extensionSession && 
      new Date(extensionSession.last_active_at) > oneDayAgo;

    return NextResponse.json({
      ok: true,
      sessions: sessions || [],
      extensionStatus: {
        isConnected: !!extensionConnected,
        lastActiveAt: extensionSession?.last_active_at || null,
        version: extensionSession?.device_info || null,
      },
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error in sessions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/user/sessions
 * Record or update a session (called on login or extension activity)
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { device_type, device_info, location } = body;

    if (!device_type || !['web', 'extension', 'mobile'].includes(device_type)) {
      return NextResponse.json(
        { error: 'Invalid device_type' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = await createClient();

    // Get IP from headers (might be behind proxy)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'Unknown';

    // Check if session exists for this device type
    const { data: existingSession } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('device_type', device_type)
      .eq('is_active', true)
      .single();

    if (existingSession) {
      // Update existing session
      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({
          last_active_at: new Date().toISOString(),
          device_info: device_info || undefined,
          ip_address: ip,
          location: location || undefined,
        })
        .eq('id', existingSession.id);

      if (updateError) {
        console.error('Error updating session:', updateError);
        return NextResponse.json(
          { error: 'Failed to update session' },
          { status: 500, headers: corsHeaders }
        );
      }
    } else {
      // Create new session
      const { error: insertError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          device_type,
          device_info: device_info || null,
          ip_address: ip,
          location: location || null,
          last_active_at: new Date().toISOString(),
          is_active: true,
        });

      if (insertError) {
        console.error('Error creating session:', insertError);
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    return NextResponse.json({ ok: true }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error in sessions POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/user/sessions
 * Revoke a session or disconnect extension
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');
    const deviceType = searchParams.get('device_type');

    const supabase = await createClient();

    if (sessionId) {
      // Delete specific session
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to revoke session' },
          { status: 500, headers: corsHeaders }
        );
      }
    } else if (deviceType) {
      // Disconnect all sessions of a device type (e.g., extension)
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('device_type', deviceType);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to disconnect device' },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    return NextResponse.json({ ok: true }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error in sessions DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
