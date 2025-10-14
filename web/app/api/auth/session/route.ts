import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to establish server-side session from client-side auth
 * This is needed for web-only flows where the client authenticates
 * but the server needs to know about the session
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Sign in and establish session on the server
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 401 }
      );
    }

    if (!data.session || !data.user) {
      return NextResponse.json(
        { ok: false, error: 'Failed to create session' },
        { status: 401 }
      );
    }

    // Session is now established in cookies
    return NextResponse.json({ 
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    });
  } catch (err: any) {
    console.error('Session establishment error:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

