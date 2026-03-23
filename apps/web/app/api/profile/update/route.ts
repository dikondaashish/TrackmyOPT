import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mmddyyyyToISO } from '@/lib/date';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      timezone,
      is_stem_eligible,
      degree_level,
      major_name,
      program_end_date,
      dso_recommendation_date,
      opt_ead_end_date,
      opt_start_date,
      stem_start_date,
    } = body;

    // Validate required fields
    if (!program_end_date || !opt_ead_end_date || !opt_start_date) {
      return NextResponse.json(
        { ok: false, error: 'missing_fields', details: 'Program end date, OPT EAD end date, and OPT start date are required' },
        { status: 400 }
      );
    }

    // Convert dates from MM/DD/YYYY to YYYY-MM-DD
    const programEndISO = mmddyyyyToISO(program_end_date);
    const optEadEndISO = mmddyyyyToISO(opt_ead_end_date);
    const optStartISO = mmddyyyyToISO(opt_start_date);
    const dsoRecISO = dso_recommendation_date ? mmddyyyyToISO(dso_recommendation_date) : null;
    const stemStartISO = (stem_start_date && is_stem_eligible) ? mmddyyyyToISO(stem_start_date) : null;

    if (!programEndISO || !optEadEndISO || !optStartISO) {
      return NextResponse.json(
        { ok: false, error: 'invalid_dates', details: 'Date must be in MM/DD/YYYY format' },
        { status: 400 }
      );
    }

    // Validate date logic
    const programEnd = new Date(programEndISO);
    const optStart = new Date(optStartISO);
    
    if (optStart < programEnd) {
      return NextResponse.json(
        { ok: false, error: 'invalid_dates', details: 'OPT start date must be on or after program end date' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // First fetch existing profile to merge non-provided fields
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('degree_level, major_name')
      .eq('user_id', userId)
      .single();

    // Upsert profile
    await supabase.from('profiles').upsert({
      user_id: userId,
      timezone: timezone || 'America/New_York',
      is_stem_eligible: is_stem_eligible !== undefined ? is_stem_eligible : false,
      degree_level: degree_level !== undefined ? degree_level : existingProfile?.degree_level,
      major_name: major_name !== undefined ? major_name : existingProfile?.major_name,
    });

    // Upsert opt_status
    await supabase.from('opt_status').upsert({
      user_id: userId,
      program_end_date: programEndISO,
      dso_recommendation_date: dsoRecISO,
      opt_ead_end_date: optEadEndISO,
      opt_start_date: optStartISO,
      stem_start_date: stemStartISO,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

