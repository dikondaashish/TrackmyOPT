/**
 * Insurance Eligibility API
 * 
 * Handles saving insurance eligibility check data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, monthly_income, visa_type, date_of_birth, has_employer_insurance, user_id } = body;

    if (!state || !visa_type) {
      return NextResponse.json(
        { error: 'State and visa type are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('insurance_eligibility_checks')
      .insert({
        user_id: user_id || null,
        state,
        monthly_income: monthly_income || 0,
        visa_type,
        date_of_birth: date_of_birth || null,
        has_employer_insurance: has_employer_insurance ?? false,
        checked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving eligibility check:', error);
      return NextResponse.json(
        { error: 'Failed to save eligibility check' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('insurance_eligibility_checks')
      .select('*')
      .eq('user_id', userId)
      .order('checked_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching eligibility check:', error);
      return NextResponse.json(
        { error: 'Failed to fetch eligibility check' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data?.[0] || null });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
