import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getPoliciesNeedingConsent,
  recordPolicyConsentsBatch,
} from '@/lib/compliance/policy-consent';
import type { LegalPolicyType } from '@/lib/legal/legal-config';

export const dynamic = 'force-dynamic';

/**
 * Policy Consent API
 *
 * GET /api/policy/consent - Check if user has consented to current policies
 * POST /api/policy/consent - Record user consent (single or all required)
 */

type ConsentMethod = 'checkbox' | 'modal' | 'banner_click' | 'checkout_checkbox';

interface PolicyConsentRequest {
  policyType?: LegalPolicyType;
  policyVersion?: string;
  consentMethod: ConsentMethod;
  acceptAllRequired?: boolean;
}

function getRequestMeta(request: NextRequest) {
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: policyVersions, error: versionsError } = await supabase
      .from('policy_versions')
      .select('*');

    if (versionsError) {
      return NextResponse.json({
        requiresConsent: false,
        policies: [],
      });
    }

    const { data: userConsents } = await supabase
      .from('policy_consents')
      .select('policy_type, policy_version')
      .eq('user_id', user.id);

    const policiesNeedingConsent = getPoliciesNeedingConsent(
      policyVersions ?? [],
      userConsents ?? []
    );

    return NextResponse.json({
      requiresConsent: policiesNeedingConsent.length > 0,
      policies: policiesNeedingConsent,
      allPolicies: policyVersions?.map((p) => ({
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as PolicyConsentRequest;
    const { policyType, policyVersion, consentMethod, acceptAllRequired } = body;

    if (!consentMethod) {
      return NextResponse.json({ error: 'Missing consentMethod' }, { status: 400 });
    }

    const { ipAddress, userAgent } = getRequestMeta(request);

    if (acceptAllRequired) {
      const { data: policyVersions, error: versionsError } = await supabase
        .from('policy_versions')
        .select('*');

      if (versionsError) {
        return NextResponse.json({ error: 'Failed to load policies' }, { status: 500 });
      }

      const { data: userConsents } = await supabase
        .from('policy_consents')
        .select('policy_type, policy_version')
        .eq('user_id', user.id);

      const pending = getPoliciesNeedingConsent(policyVersions ?? [], userConsents ?? []);

      if (pending.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No additional consents required',
          recorded: 0,
        });
      }

      const result = await recordPolicyConsentsBatch({
        supabase,
        userId: user.id,
        policies: pending.map((p) => ({
          policyType: p.type,
          policyVersion: p.version,
        })),
        consentMethod,
        ipAddress,
        userAgent,
      });

      if (!result.ok) {
        return NextResponse.json(
          {
            success: false,
            error: 'Some consents could not be recorded',
            details: result.errors,
            recorded: result.recorded,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'All required policy consents recorded',
        recorded: result.recorded,
        consentedAt: new Date().toISOString(),
      });
    }

    if (!policyType || !policyVersion) {
      return NextResponse.json(
        { error: 'Missing policyType or policyVersion (or set acceptAllRequired)' },
        { status: 400 }
      );
    }

    const result = await recordPolicyConsentsBatch({
      supabase,
      userId: user.id,
      policies: [{ policyType, policyVersion }],
      consentMethod,
      ipAddress,
      userAgent,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: 'Failed to record consent', details: result.errors },
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
