import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

// CORS headers for Chrome extension + cache control
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
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
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );


    // Fetch opt_status data - include stem_start_date and last_updated_field
    const { data, error } = await supabase
      .from('opt_status')
      .select('program_end_date, dso_recommendation_date, opt_start_date, opt_ead_end_date, stem_start_date, last_updated_field')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error fetching opt_status:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders });
    }

    if (!data) {
    } else {
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
        stem_start_date: formatDate(data.stem_start_date),
        last_updated_field: data.last_updated_field || null,
      } : null
    }, { headers: corsHeaders });
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
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
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
      stem_start_date,
      _lastModifiedField, // Special field from dashboard to indicate which date user modified
    } = body;


    // Flexible validation: at least one date must be provided
    const dates = {
      program_end_date,
      dso_recommendation_date,
      opt_start_date,
      opt_ead_end_date,
      stem_start_date,
    };

    const hasAtLeastOneDate = Object.values(dates).some(date => date && date.trim() !== '');
    
    if (!hasAtLeastOneDate) {
      return NextResponse.json(
        { ok: false, error: 'At least one date is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Convert dates from mm/dd/yyyy to yyyy-mm-dd
    const parseDate = (dateStr: string | null): string | null => {
      if (!dateStr || dateStr.trim() === '') return null;
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      const month = parts[0];
      const day = parts[1];
      const year = parts[2];
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    const programEndISO = parseDate(program_end_date);
    const dsoRecISO = parseDate(dso_recommendation_date);
    const optStartISO = parseDate(opt_start_date);
    const optEadEndISO = parseDate(opt_ead_end_date);
    const stemStartISO = parseDate(stem_start_date);

    // Validate date formats for provided dates
    const validateDate = (dateISO: string | null, fieldName: string) => {
      if (dateISO) {
        const date = new Date(dateISO);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid ${fieldName} format. Use MM/DD/YYYY`);
        }
      }
    };

    validateDate(programEndISO, 'program_end_date');
    validateDate(dsoRecISO, 'dso_recommendation_date');
    validateDate(optStartISO, 'opt_start_date');
    validateDate(optEadEndISO, 'opt_ead_end_date');
    validateDate(stemStartISO, 'stem_start_date');

    // Determine which field was most recently updated
    let lastUpdatedField = null;
    
    if (_lastModifiedField) {
      // Client explicitly told us which field was modified
      lastUpdatedField = _lastModifiedField;
    } else {
      // Client didn't specify, use fallback logic (last non-null field wins)
      if (program_end_date) lastUpdatedField = 'program_end_date';
      if (dso_recommendation_date) lastUpdatedField = 'dso_recommendation_date';
      if (opt_start_date) lastUpdatedField = 'opt_start_date';
      if (opt_ead_end_date) lastUpdatedField = 'opt_ead_end_date';
      if (stem_start_date) lastUpdatedField = 'stem_start_date';
    }

    // First, fetch existing data to merge properly
    const { data: existingData } = await supabase
      .from('opt_status')
      .select('program_end_date, dso_recommendation_date, opt_start_date, opt_ead_end_date, stem_start_date')
      .eq('user_id', userId)
      .single();

    // Prepare data for upsert - preserve existing values, only update what was explicitly sent
    const upsertData = {
      user_id: userId,
      // Use new value if provided, otherwise keep existing value
      program_end_date: programEndISO !== null ? programEndISO : (existingData?.program_end_date || null),
      dso_recommendation_date: dsoRecISO !== null ? dsoRecISO : (existingData?.dso_recommendation_date || null),
      opt_start_date: optStartISO !== null ? optStartISO : (existingData?.opt_start_date || null),
      opt_ead_end_date: optEadEndISO !== null ? optEadEndISO : (existingData?.opt_ead_end_date || null),
      stem_start_date: stemStartISO !== null ? stemStartISO : (existingData?.stem_start_date || null),
      last_updated_field: lastUpdatedField,
      updated_at: new Date().toISOString(),
    };


    // Upsert opt_status with all 5 fields
    const { data: upsertResult, error } = await supabase
      .from('opt_status')
      .upsert(upsertData)
      .select();

    if (error) {
      console.error('❌ Error upserting opt_status:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders });
    }


    return NextResponse.json({ ok: true, data: upsertResult }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('POST /api/opt/calculator error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to save data' },
      { status: 500 }
    );
  }
}

