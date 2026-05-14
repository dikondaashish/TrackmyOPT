import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/getUserId';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { sanitizeError, secureLog } from '@/lib/secure-logger';

// Admin client to bypass RLS for session management
const getAdminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}



/**
 * GET /api/user/sessions
 * Get recent sessions and extension status
 */
export async function GET(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: cors }
      );
    }

    const supabase = getAdminClient();

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
      secureLog.error('Error fetching sessions:', sanitizeError(error));
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500, headers: cors }
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
    }, { headers: cors });

  } catch (error) {
    secureLog.error('Error in sessions API:', sanitizeError(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: cors }
    );
  }
}

/**
 * POST /api/user/sessions
 * Record or update a session (called on login or extension activity)
 */
export async function POST(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: cors }
      );
    }

    const body = await req.json();
    const { device_type, device_info, location } = body;

    if (!device_type || !['web', 'extension', 'mobile'].includes(device_type)) {
      return NextResponse.json(
        { error: 'Invalid device_type' },
        { status: 400, headers: cors }
      );
    }

    const supabase = getAdminClient();

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
        secureLog.error('Error updating session:', sanitizeError(updateError));
        return NextResponse.json(
          { error: 'Failed to update session' },
          { status: 500, headers: cors }
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
        secureLog.error('Error creating session:', sanitizeError(insertError));
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500, headers: cors }
        );
      }
    }

    return NextResponse.json({ ok: true }, { headers: cors });

  } catch (error) {
    secureLog.error('Error in sessions POST:', sanitizeError(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: cors }
    );
  }
}

/**
 * DELETE /api/user/sessions
 * Revoke a session or disconnect extension
 */
export async function DELETE(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: cors }
      );
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');
    const deviceType = searchParams.get('device_type');

    const supabase = getAdminClient();

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
          { status: 500, headers: cors }
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
          { status: 500, headers: cors }
        );
      }
    }

    return NextResponse.json({ ok: true }, { headers: cors });

  } catch (error) {
    secureLog.error('Error in sessions DELETE:', sanitizeError(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: cors }
    );
  }
}
