import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/export
 * 
 * Export user data as JSON or CSV
 * Available to all users (not just Pro)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get format from query params
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // 1. Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 2. Get OPT status (dates)
    const { data: optStatus } = await supabase
      .from('opt_status')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 3. Get case status
    const { data: caseStatus } = await supabase
      .from('case_status')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 4. Get employment spans
    const { data: employmentSpans } = await supabase
      .from('employment_spans')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    if (format === 'csv') {
      // Create CSV
      const csvRows = [
        'Field,Value',
        `Email,${user.email || 'Not set'}`,
        `Program End Date,${optStatus?.program_end_date || 'Not set'}`,
        `DSO Recommendation Date,${optStatus?.dso_recommendation_date || 'Not set'}`,
        `OPT Start Date,${optStatus?.opt_start_date || 'Not set'}`,
        `OPT EAD End Date,${optStatus?.opt_ead_end_date || 'Not set'}`,
        `STEM Start Date,${optStatus?.stem_start_date || 'Not set'}`,
        `Receipt Number,${caseStatus?.receipt_number || 'Not set'}`,
        `Case Status,${caseStatus?.current_status || 'Not set'}`,
        `Timezone,${profile?.timezone || 'Not set'}`,
        `STEM Eligible,${profile?.is_stem_eligible ? 'Yes' : 'No'}`,
      ];

      const csvContent = csvRows.join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="trackmyopt-data-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default: JSON format
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        email: user.email,
        createdAt: user.created_at,
      },
      profile: {
        timezone: profile?.timezone || null,
        isStemEligible: profile?.is_stem_eligible || false,
        firstName: profile?.first_name || null,
        lastName: profile?.last_name || null,
      },
      optStatus: {
        programEndDate: optStatus?.program_end_date || null,
        dsoRecommendationDate: optStatus?.dso_recommendation_date || null,
        optStartDate: optStatus?.opt_start_date || null,
        optEadEndDate: optStatus?.opt_ead_end_date || null,
        stemStartDate: optStatus?.stem_start_date || null,
      },
      caseStatus: {
        receiptNumber: caseStatus?.receipt_number || null,
        currentStatus: caseStatus?.current_status || null,
        lastCheckedAt: caseStatus?.last_checked_at || null,
      },
      employmentSpans: employmentSpans || [],
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="trackmyopt-data-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });

  } catch (error) {
    console.error('❌ Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
