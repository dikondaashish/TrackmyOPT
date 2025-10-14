import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { mmddyyyyToISO } from '@/lib/date';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, employer_name, start_date, end_date } = body;

    // Validate required fields
    if (!employer_name || !start_date) {
      return NextResponse.json(
        { ok: false, error: 'employer_name and start_date are required' },
        { status: 400 }
      );
    }

    // Convert dates from MM/DD/YYYY to YYYY-MM-DD
    let startDateISO: string;
    let endDateISO: string | null = null;

    try {
      startDateISO = mmddyyyyToISO(start_date);
      if (end_date) {
        endDateISO = mmddyyyyToISO(end_date);
      }
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: 'Invalid date format. Must be MM/DD/YYYY' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    if (id) {
      // Update existing employment span
      const { error } = await supabase
        .from('employment_spans')
        .update({
          employer_name,
          start_date: startDateISO,
          end_date: endDateISO,
        })
        .eq('id', id)
        .eq('user_id', userId); // Ensure user owns this record

      if (error) throw error;

      return NextResponse.json({ ok: true, id });
    } else {
      // Insert new employment span
      const { data, error } = await supabase
        .from('employment_spans')
        .insert({
          user_id: userId,
          employer_name,
          start_date: startDateISO,
          end_date: endDateISO,
        })
        .select('id')
        .single();

      if (error) throw error;

      return NextResponse.json({ ok: true, id: data.id });
    }
  } catch (error: any) {
    console.error('Employment upsert error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to save employment span' },
      { status: 500 }
    );
  }
}

