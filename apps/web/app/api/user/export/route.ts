import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { decryptPrivateApplicationAnswers } from '@/lib/private-application-answers';

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

    // 5. Get application profile (autofill data)
    const { data: applicationProfile } = await supabase
      .from('application_profile')
      .select('phone, city, state, years_experience, linkedin_url, portfolio_url')
      .eq('user_id', user.id)
      .maybeSingle();

    // Server-only encrypted data is not directly selectable by browser clients.
    // Include it in the user's explicit data export after re-authentication.
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: privateAnswerRow } = await admin
      .from('private_application_answers')
      .select('encrypted_payload')
      .eq('user_id', user.id)
      .maybeSingle();
    let privateApplicationAnswers = null;
    if (privateAnswerRow?.encrypted_payload) {
      privateApplicationAnswers = decryptPrivateApplicationAnswers(
        privateAnswerRow.encrypted_payload
      );
    }

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
        `Work Authorization,${privateApplicationAnswers?.workAuthorization || 'Not set'}`,
        `Sponsorship Required,${privateApplicationAnswers?.requiresSponsorship || 'Not set'}`,
        `Visa Status,${privateApplicationAnswers?.visaStatus || 'Not set'}`,
        `Citizenship,${privateApplicationAnswers?.citizenship || 'Not set'}`,
        `Salary Expectation,${privateApplicationAnswers?.salaryExpectation || 'Not set'}`,
        `Date of Birth,${privateApplicationAnswers?.dateOfBirth || 'Not set'}`,
        `Sex or Gender,${privateApplicationAnswers?.sexGender || 'Not set'}`,
        `Hispanic or Latino,${privateApplicationAnswers?.hispanicLatino || 'Not set'}`,
        `Race or Ethnicity,${privateApplicationAnswers?.raceEthnicity || 'Not set'}`,
        `Veteran Status,${privateApplicationAnswers?.veteranStatus || 'Not set'}`,
        `Disability Status,${privateApplicationAnswers?.disabilityStatus || 'Not set'}`,
      ];

      const csvContent = csvRows.join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="trackmyopt-data-${new Date().toISOString().split('T')[0]}.csv"`,
          'Cache-Control': 'no-store, private, max-age=0',
          'X-Content-Type-Options': 'nosniff',
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
      applicationProfile: {
        phone: applicationProfile?.phone || null,
        city: applicationProfile?.city || null,
        state: applicationProfile?.state || null,
        yearsExperience: applicationProfile?.years_experience ?? null,
        linkedinUrl: applicationProfile?.linkedin_url || null,
        portfolioUrl: applicationProfile?.portfolio_url || null,
      },
      privateApplicationAnswers,
      employmentSpans: employmentSpans || [],
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="trackmyopt-data-${new Date().toISOString().split('T')[0]}.json"`,
        'Cache-Control': 'no-store, private, max-age=0',
        'X-Content-Type-Options': 'nosniff',
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
