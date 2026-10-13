import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth/get-user-id';
import { getCommunityEstimate } from '@/lib/community-opt/get-estimate';
import { getActiveUserPlanTier } from '@/lib/premium/user-plan-tier';

export const dynamic = 'force-dynamic';

/**
 * Matched community processing-time estimate for the case-status Estimate tab.
 * Auth required (same as sibling case-status routes) — uses service-role reads.
 * Only the 3-character receipt prefix is accepted, so full receipt numbers
 * never reach request logs.
 *
 * Metrics require a current premium subscription, checked before data reads.
 *
 * GET ?receipt_prefix=&case_type=&label=&filing_category=&pp_start=&received=&days=
 */
async function handleGET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sp = req.nextUrl.searchParams;
    const daysRaw = sp.get('days');
    const daysSinceFiled = daysRaw ? Number(daysRaw) : 0;

    const planTier = await getActiveUserPlanTier(userId);
    if (planTier === 'free')
      return NextResponse.json(
        { ok: false, error: 'Case metrics require premium' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    const result = await getCommunityEstimate({
      receiptPrefix: sp.get('receipt_prefix')?.slice(0, 3),
      caseType: sp.get('case_type'),
      label: sp.get('label'),
      filingCategory: sp.get('filing_category'),
      ppStartDate: sp.get('pp_start'),
      receivedDate: sp.get('received'),
      daysSinceFiled: Number.isFinite(daysSinceFiled) ? daysSinceFiled : 0,
    });

    const headers = {
      // Varies by plan, so it must never land in a shared cache.
      'Cache-Control': 'no-store',
    };

    return NextResponse.json(
      {
        ok: true,
        planTier,
        evidence: result.evidence,
        premiumUpgrade: result.premiumUpgrade,
        summary: result.prediction
          ? {
              medianDays: result.prediction.medianDays,
              cohortSize: result.prediction.cohortSize,
              caseKind: result.prediction.caseKind,
              premiumProcessing: result.prediction.premiumProcessing,
              matchLevel: result.prediction.matchLevel,
              sourceNote: result.prediction.sourceNote,
            }
          : null,
        prediction: result.prediction,
        heatmap: result.heatmap,
        weeklyTrend: result.weeklyTrend,
        histogram: result.histogram,
        similarFiling: result.similarFiling,
        stages: result.stages,
      },
      { headers }
    );
  } catch (error) {
    console.error('community-estimate error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to load community estimate' },
      { status: 500 }
    );
  }
}

export const GET = withSentryApiErrors(
  handleGET,
  '/api/case-status/community-estimate',
  'GET'
);
