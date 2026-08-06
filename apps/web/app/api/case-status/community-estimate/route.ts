import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCommunityEstimate } from "@/lib/community-opt/get-estimate";

export const dynamic = "force-dynamic";

/**
 * Matched community processing-time estimate for the case-status Estimate tab.
 * Auth required (same as sibling case-status routes) — uses service-role reads.
 * Only the 3-character receipt prefix is accepted, so full receipt numbers
 * never reach request logs.
 *
 * GET ?receipt_prefix=&case_type=&label=&pp_start=&received=&days=
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

    const result = await getCommunityEstimate({
      receiptPrefix: sp.get("receipt_prefix")?.slice(0, 3),
      caseType: sp.get("case_type"),
      label: sp.get("label"),
      ppStartDate: sp.get("pp_start"),
      receivedDate: sp.get("received"),
      daysSinceFiled: Number.isFinite(daysSinceFiled) ? daysSinceFiled : 0,
    });

    return NextResponse.json(
      {
        ok: true,
        prediction: result.prediction,
        heatmap: result.heatmap,
        weeklyTrend: result.weeklyTrend,
        histogram: result.histogram,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("community-estimate error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load community estimate" },
      { status: 500 }
    );
  }
}
