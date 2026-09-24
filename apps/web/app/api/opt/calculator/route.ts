import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/get-user-id';
import {
  calculateUnemploymentDays,
  type EmploymentSpan,
} from '@/lib/immigration/opt-calculations';
import {
  calculatorDatePatch,
  formatCalculatorDate as formatDate,
} from '@/lib/immigration/opt-date-patch';

// UUID v4 pattern for safe userId validation before use in DB queries
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = 'force-dynamic';

// CORS headers for Chrome extension + cache control
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

/**
 * GET - Load saved OPT calculator data
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId || !UUID_RE.test(userId)) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Service role is required here because this route supports both cookie-based (web)
    // and JWT-based (Chrome extension) auth via getUserId(). The user's identity is
    // verified above; every query below is scoped to userId via .eq('user_id', userId).
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch opt_status data - include stem_start_date and last_updated_field
    const { data, error } = await supabase
      .from('opt_status')
      .select(
        'program_end_date, dso_recommendation_date, stem_dso_recommendation_date, opt_start_date, opt_ead_end_date, stem_start_date, stem_ead_end_date, last_updated_field'
      )
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      console.error('❌ Error fetching opt_status:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to load OPT dates' },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!data) {
    } else {
    }

    let unemploymentClock: {
      active: true;
      used: number;
      max: 90 | 150;
      remaining: number;
      phase: 'initial' | 'stem';
    } | null = null;
    if (data?.opt_start_date && data.opt_ead_end_date) {
      const { data: employmentRows, error: employmentError } = await supabase
        .from('employment_spans')
        .select('id, employer_name, start_date, end_date')
        .eq('user_id', userId)
        .order('start_date', { ascending: true });
      if (employmentError) {
        console.error(
          'OPT calculator employment lookup error:',
          employmentError
        );
      } else {
        const spans: EmploymentSpan[] = (employmentRows || []).map((span) => ({
          ...span,
          is_current: !span.end_date,
        }));
        const breakdown = calculateUnemploymentDays(
          data.opt_start_date,
          data.opt_ead_end_date,
          spans,
          data.stem_start_date
        );
        const today = new Date().toISOString().slice(0, 10);
        const hasStarted = data.opt_start_date <= today;
        if (
          hasStarted &&
          (breakdown.phase === 'initial' || breakdown.phase === 'stem')
        ) {
          unemploymentClock = {
            active: true,
            used: breakdown.used,
            max: breakdown.max,
            remaining: breakdown.remaining,
            phase: breakdown.phase,
          };
        }
      }
    }

    return NextResponse.json(
      {
        ok: true,
        data: data
          ? {
              program_end_date: formatDate(data.program_end_date),
              dso_recommendation_date: formatDate(data.dso_recommendation_date),
              stem_dso_recommendation_date: formatDate(
                data.stem_dso_recommendation_date
              ),
              opt_start_date: formatDate(data.opt_start_date),
              opt_ead_end_date: formatDate(data.opt_ead_end_date),
              stem_start_date: formatDate(data.stem_start_date),
              stem_ead_end_date: formatDate(data.stem_ead_end_date),
              last_updated_field: data.last_updated_field || null,
              unemployment_clock: unemploymentClock,
            }
          : null,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('GET /api/opt/calculator error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to load data' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST - Save OPT calculator data
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId || !UUID_RE.test(userId)) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // See comment in GET handler — service role required for dual auth support.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let body;
    let datePatch;
    try {
      body = await req.json();
      datePatch = calculatorDatePatch(body);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Provide at least one valid date (MM/DD/YYYY), or null to clear it',
        },
        { status: 400, headers: corsHeaders }
      );
    }
    const { degree_level, major_name, is_stem_eligible } = body;
    // PostgREST updates only supplied columns on conflict. Avoid a read/merge
    // race that could replay stale dates saved by another tool or device.
    const upsertData = {
      user_id: userId,
      ...datePatch,
      updated_at: new Date().toISOString(),
    };
    const { data: upsertResult, error } = await supabase
      .from('opt_status')
      .upsert(upsertData, { onConflict: 'user_id' })
      .select();

    if (error) {
      console.error('❌ Error upserting opt_status:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to save OPT dates' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Update profiles table if course info was provided
    if (
      degree_level !== undefined ||
      major_name !== undefined ||
      is_stem_eligible !== undefined
    ) {
      const profileUpdate: any = {};
      if (degree_level !== undefined) profileUpdate.degree_level = degree_level;
      if (major_name !== undefined) profileUpdate.major_name = major_name;
      if (is_stem_eligible !== undefined)
        profileUpdate.is_stem_eligible = is_stem_eligible;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('user_id', userId);

      if (profileError) {
        console.error('❌ Error updating profiles:', profileError);
      }
    }

    return NextResponse.json(
      { ok: true, data: upsertResult },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('POST /api/opt/calculator error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to save data' },
      { status: 500 }
    );
  }
}
