import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimitByIP,
  rateLimitResponse,
} from '@/lib/auth/api-rate-limit';
import { getCommunityEstimate } from '@/lib/community-opt/get-estimate';
import { MIN_COHORT_FOR_ESTIMATE } from '@/lib/community-opt/estimate';
import {
  daysSinceIsoDate,
  normalizeReceiptPrefix,
} from '@/lib/case-status/public-decision-window';

export const dynamic = 'force-dynamic';

const PUBLIC_LIMIT = {
  limit: 20,
  windowSeconds: 60 * 60,
  name: 'public-opt-decision-window',
} as const;

const CASE_KINDS = new Set(['initial_opt', 'stem_opt']);

/**
 * Guest-facing OPT decision window.
 * No auth. Only receipt prefix (3 chars) + received date — never a full receipt.
 */
export async function GET(req: NextRequest) {
  try {
    const limited = await checkRateLimitByIP(req, PUBLIC_LIMIT);
    if (!limited.success) {
      return rateLimitResponse(
        limited,
        'Too many decision-window lookups. Try again shortly.'
      );
    }

    const sp = req.nextUrl.searchParams;
    const received = sp.get('received')?.trim() ?? '';
    const caseKindRaw = sp.get('case_kind')?.trim() || 'initial_opt';
    const receiptPrefix = normalizeReceiptPrefix(sp.get('receipt_prefix'));

    if (!CASE_KINDS.has(caseKindRaw)) {
      return NextResponse.json(
        { ok: false, error: 'case_kind must be initial_opt or stem_opt' },
        { status: 400 }
      );
    }

    const daysSinceFiled = daysSinceIsoDate(received);
    if (daysSinceFiled === null) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Enter a valid USCIS received date (YYYY-MM-DD), within the last ~2 years.',
        },
        { status: 400 }
      );
    }

    if (sp.get('receipt_prefix')?.trim() && !receiptPrefix) {
      return NextResponse.json(
        { ok: false, error: 'Receipt prefix must be 3 letters (e.g. IOE).' },
        { status: 400 }
      );
    }

    const result = await getCommunityEstimate({
      receiptPrefix,
      filingCategory: caseKindRaw === 'stem_opt' ? 'stem_extension' : 'initial_opt',
      receivedDate: received,
      daysSinceFiled,
    });

    const prediction = result.prediction;
    if (
      !prediction ||
      prediction.cohortSize < MIN_COHORT_FOR_ESTIMATE
    ) {
      return NextResponse.json(
        {
          ok: true,
          daysSinceFiled,
          estimate: null,
          message:
            'Not enough matched community reports yet for this case type. Try again later or track your live USCIS status free.',
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        daysSinceFiled,
        estimate: {
          medianDays: prediction.medianDays,
          p25Days: prediction.p25Days,
          p75Days: prediction.p75Days,
          cohortSize: prediction.cohortSize,
          caseKind: prediction.caseKind,
          matchLevel: prediction.matchLevel,
          sourceNote: prediction.sourceNote,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('public opt-decision-window error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to load decision window' },
      { status: 500 }
    );
  }
}
