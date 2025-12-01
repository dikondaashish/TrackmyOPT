/**
 * Tool-Specific Email API
 * 
 * Handles storing and retrieving emails for each tool's notifications:
 * - opt_apply: OPT Apply Dates tool
 * - opt_clock: OPT Clock Tracker tool
 * - stem_apply: STEM Apply Dates tool
 * - stem_clock: STEM Clock Tracker tool
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// Valid tool names
const VALID_TOOLS = ['opt_apply', 'opt_clock', 'stem_apply', 'stem_clock'] as const;
type ToolName = typeof VALID_TOOLS[number];

// CORS headers for Chrome extension
const getCorsHeaders = (req?: NextRequest) => {
  const origin = req?.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
};

// Handle preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: getCorsHeaders(req) });
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
          try {
            cookieStore.set({ name, value, ...options });
          } catch { /* ignore */ }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch { /* ignore */ }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// GET - Fetch emails for all tools or specific tool
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(req) });
    }

    const { searchParams } = new URL(req.url);
    const tool = searchParams.get('tool') as ToolName | null;

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch from profiles table
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('opt_apply_email, opt_clock_email, stem_apply_email, stem_clock_email')
      .eq('user_id', userId)
      .single();

    // If column doesn't exist or no profile, return empty
    if (fetchError && fetchError.code !== 'PGRST116') {
      // Check if columns don't exist yet
      if (fetchError.message?.includes('column') || fetchError.code === '42703') {
        return NextResponse.json({
          emails: {
            opt_apply: null,
            opt_clock: null,
            stem_apply: null,
            stem_clock: null,
          }
        }, { headers: getCorsHeaders(req) });
      }
    }

    const emails = {
      opt_apply: profile?.opt_apply_email || null,
      opt_clock: profile?.opt_clock_email || null,
      stem_apply: profile?.stem_apply_email || null,
      stem_clock: profile?.stem_clock_email || null,
    };

    // If specific tool requested, return only that
    if (tool && VALID_TOOLS.includes(tool)) {
      return NextResponse.json({
        tool,
        email: emails[tool.replace('_', '_') as keyof typeof emails] || null,
      }, { headers: getCorsHeaders(req) });
    }

    return NextResponse.json({ emails }, { headers: getCorsHeaders(req) });

  } catch (error) {
    console.error('Error fetching tool emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool emails' },
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}

// POST - Update email for a specific tool
export async function POST(req: NextRequest) {
  try {
    const { tool, email } = await req.json();

    // Validate tool name
    if (!tool || !VALID_TOOLS.includes(tool)) {
      return NextResponse.json(
        { error: 'Invalid tool name. Must be one of: opt_apply, opt_clock, stem_apply, stem_clock' },
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400, headers: getCorsHeaders(req) }
        );
      }
    }

    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(req) });
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Map tool name to column name
    const columnName = `${tool}_email`;

    // First, check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    let error;
    
    if (existingProfile) {
      // Profile exists, update the email column
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [columnName]: email || null })
        .eq('user_id', userId);
      error = updateError;
    } else {
      // Profile doesn't exist, insert new row
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          [columnName]: email || null,
        });
      error = insertError;
    }

    if (error) {
      console.error('Error saving tool email:', error);
      
      // Check if column doesn't exist
      if (error.message?.includes('column') || error.code === '42703') {
        return NextResponse.json(
          { error: 'Database column not found. Please run migration 008_add_tool_emails.sql in Supabase.' },
          { status: 500, headers: getCorsHeaders(req) }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to save email: ${error.message}` },
        { status: 500, headers: getCorsHeaders(req) }
      );
    }

    return NextResponse.json({
      success: true,
      tool,
      email: email || null,
    }, { headers: getCorsHeaders(req) });

  } catch (error) {
    console.error('Error saving tool email:', error);
    return NextResponse.json(
      { error: 'Failed to save tool email' },
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}
