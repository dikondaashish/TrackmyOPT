import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

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
  return user?.id || null;
}

/**
 * GET - Load saved OPT calculator data
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch opt_status data
    const { data, error } = await supabase
      .from('opt_status')
      .select('program_end_date, dso_recommendation_date, opt_start_date, opt_ead_end_date')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching opt_status:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Format dates to mm/dd/yyyy
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    return NextResponse.json({
      ok: true,
      data: data ? {
        program_end_date: formatDate(data.program_end_date),
        dso_recommendation_date: formatDate(data.dso_recommendation_date),
        opt_start_date: formatDate(data.opt_start_date),
        opt_ead_end_date: formatDate(data.opt_ead_end_date),
      } : null
    });
  } catch (error: any) {
    console.error('GET /api/opt/calculator error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to load data' },
      { status: 500 }
    );
  }
}

/**
 * POST - Save OPT calculator data
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const {
      program_end_date,
      dso_recommendation_date,
      opt_start_date,
      opt_ead_end_date,
    } = body;

    // Validate required fields
    if (!program_end_date) {
      return NextResponse.json(
        { ok: false, error: 'Program end date is required' },
        { status: 400 }
      );
    }

    // Convert dates from mm/dd/yyyy to yyyy-mm-dd
    const parseDate = (dateStr: string | null): string | null => {
      if (!dateStr) return null;
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      const month = parts[0];
      const day = parts[1];
      const year = parts[2];
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    const programEndISO = parseDate(program_end_date);
    const dsoRecISO = dso_recommendation_date ? parseDate(dso_recommendation_date) : null;
    const optStartISO = opt_start_date ? parseDate(opt_start_date) : null;
    const optEadEndISO = opt_ead_end_date ? parseDate(opt_ead_end_date) : null;

    if (!programEndISO) {
      return NextResponse.json(
        { ok: false, error: 'Invalid program end date format. Use mm/dd/yyyy' },
        { status: 400 }
      );
    }

    // Upsert opt_status
    const { error } = await supabase
      .from('opt_status')
      .upsert({
        user_id: userId,
        program_end_date: programEndISO,
        dso_recommendation_date: dsoRecISO,
        opt_start_date: optStartISO || programEndISO, // Default to program end if not provided
        opt_ead_end_date: optEadEndISO || programEndISO, // Default to program end if not provided
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error upserting opt_status:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('POST /api/opt/calculator error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to save data' },
      { status: 500 }
    );
  }
}

