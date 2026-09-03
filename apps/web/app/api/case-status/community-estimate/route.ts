import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCommunityEstimate } from "@/lib/community-opt/get-estimate";
import { redactStagesForFree } from "@/lib/community-opt/stages";
import { getActiveUserPlanTier } from "@/lib/premium/user-plan-tier";

export const dynamic = "force-dynamic";

/**
 * Matched community processing-time estimate for the case-status Estimate tab.
 * Auth required (same as sibling case-status routes) — uses service-role reads.
 * Only the 3-character receipt prefix is accepted, so full receipt numbers
 * never reach request logs.
 *
 * Plan gating happens here rather than in the browser. Free plans get the
 * typical wait for each stage — the fact itself, which nobody waiting on work
 * authorization should have to pay to see — while the analysis built on top of
 * it is Pro: where the user sits in the distribution, their own filing-window
 * cohort, how the trend is moving, and the full spread. Withholding it in the
 * client would ship the numbers anyway and merely hide them.
 *
 * GET ?receipt_prefix=&case_type=&label=&filing_category=&pp_start=&received=&days=
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sp = req.nextUrl.searchParams;
    const daysRaw = sp.get("days");
    const daysSinceFiled = daysRaw ? Number(daysRaw) : 0;

    const [planTier, result] = await Promise.all([
      getActiveUserPlanTier(userId),
      getCommunityEstimate({
        receiptPrefix: sp.get("receipt_prefix")?.slice(0, 3),
        caseType: sp.get("case_type"),
        label: sp.get("label"),
        filingCategory: sp.get("filing_category"),
        ppStartDate: sp.get("pp_start"),
        receivedDate: sp.get("received"),
        daysSinceFiled: Number.isFinite(daysSinceFiled) ? daysSinceFiled : 0,
      }),
    ]);

    const headers = {
      // Varies by plan, so it must never land in a shared cache.
      "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
    };

    if (planTier === "free") {
      const { prediction, stages } = result;
      return NextResponse.json(
        {
          ok: true,
          planTier,
          // The headline wait, with nothing that positions this user inside it.
          summary: prediction
            ? {
                medianDays: prediction.medianDays,
                cohortSize: prediction.cohortSize,
                caseKind: prediction.caseKind,
                premiumProcessing: prediction.premiumProcessing,
                matchLevel: prediction.matchLevel,
                sourceNote: prediction.sourceNote,
              }
            : null,
          stages: stages ? redactStagesForFree(stages) : null,
          prediction: null,
          heatmap: [],
          weeklyTrend: [],
          histogram: null,
          similarFiling: null,
        },
        { headers }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        planTier,
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
    console.error("community-estimate error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load community estimate" },
      { status: 500 }
    );
  }
}
