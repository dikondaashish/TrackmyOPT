import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Policy Consent API
 * 
 * GET /api/policy/consent - Check if user has consented to current policies
 * POST /api/policy/consent - Record user consent to a policy
 */

interface PolicyConsentRequest {
  policyType:
    | 'privacy_policy'
    | 'terms_of_service'
    | 'refund_policy'
    | 'subscription_billing_terms';
  policyVersion: string;
  consentMethod: 'checkbox' | 'modal' | 'banner_click' | 'checkout_checkbox';
}

/**
 * GET - Check user's consent status for all policies
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current policy versions
    const { data: policyVersions, error: versionsError } = await supabase
      .from('policy_versions')
      .select('*');

    if (versionsError) {
      // Table might not exist yet, return default
      return NextResponse.json({
        requiresConsent: false,
        policies: [],
      });
    }

    // Get user's consents
    const { data: userConsents } = await supabase
      .from('policy_consents')
      .select('*')
      .eq('user_id', user.id);

    // Check which policies need consent
    const policiesNeedingConsent = policyVersions?.filter(policy => {
      if (!policy.requires_consent) return false;
      
      const hasConsented = userConsents?.some(
        consent => consent.policy_type === policy.policy_type && 
                   consent.policy_version === policy.current_version
      );
      
      return !hasConsented;
    }) || [];

    return NextResponse.json({
      requiresConsent: policiesNeedingConsent.length > 0,
      policies: policiesNeedingConsent.map(p => ({
        type: p.policy_type,
        version: p.current_version,
        changeSummary: p.change_summary,
        effectiveDate: p.effective_date,
      })),
      allPolicies: policyVersions?.map(p => ({
        type: p.policy_type,
        version: p.current_version,
        requiresConsent: p.requires_consent,
        effectiveDate: p.effective_date,
      })),
    });

  } catch (error) {
    console.error('Policy consent check error:', error);
    return NextResponse.json(
      { error: 'Failed to check consent status' },
      { status: 500 }
    );
  }
}

/**
 * POST - Record user consent to a policy
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: PolicyConsentRequest = await request.json();
    const { policyType, policyVersion, consentMethod } = body;

    if (!policyType || !policyVersion || !consentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get IP and user agent for audit
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Record consent
    const { error: insertError } = await supabase
      .from('policy_consents')
      .upsert({
        user_id: user.id,
        policy_type: policyType,
        policy_version: policyVersion,
        consent_method: consentMethod,
        ip_address: ipAddress,
        user_agent: userAgent,
        consented_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,policy_type,policy_version',
      });

    if (insertError) {
      console.error('Error recording consent:', insertError);
      return NextResponse.json(
        { error: 'Failed to record consent' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Consent recorded successfully',
      policyType,
      policyVersion,
      consentedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Policy consent error:', error);
    return NextResponse.json(
      { error: 'Failed to record consent' },
      { status: 500 }
    );
  }
}
