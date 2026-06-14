import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserId } from "@/lib/auth/getUserId";
import type { Database } from "@/types/supabase";
import {
  buildReceiptRange,
  DEFAULT_COHORT_RANGE,
  MAX_COHORT_RANGE,
} from "@/lib/case-status/receipt-cohort";
import {
  categorizeStatus,
  computeCohortAnalytics,
  type CohortCase,
} from "@/lib/case-status/cohort-analytics";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store",
};

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function clampRange(value: string | null, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(Math.floor(n), MAX_COHORT_RANGE);
}

/**
 * GET /api/case-status/nearby?receipt=IOE...&before=100&after=100
 * Pro-only nearby-case cohort analysis. Serves cached cases instantly and
 * triggers a background scan to fill gaps over time.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: profile } = await supabase
      .from("profiles")
      .select("premium_status")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile?.premium_status !== true) {
      return NextResponse.json(
        {
          ok: false,
          error: "Nearby-case analysis is a Pro feature.",
          code: "pro_required",
        },
        { status: 403, headers: corsHeaders }
      );
    }

    const receiptParam = req.nextUrl.searchParams.get("receipt");
    const before = clampRange(req.nextUrl.searchParams.get("before"), DEFAULT_COHORT_RANGE);
    const after = clampRange(req.nextUrl.searchParams.get("after"), DEFAULT_COHORT_RANGE);

    if (!receiptParam) {
      return NextResponse.json(
        { ok: false, error: "receipt is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const normalized = receiptParam.trim().toUpperCase();

    // Security: only allow cohorts around a receipt the user actually tracks.
    const { data: ownCase } = await supabase
      .from("case_status")
      .select("receipt_number")
      .eq("user_id", userId)
      .eq("receipt_number", normalized)
      .maybeSingle();

    if (!ownCase) {
      return NextResponse.json(
        { ok: false, error: "You can only analyze a case you are tracking." },
        { status: 403, headers: corsHeaders }
      );
    }

    const range = buildReceiptRange(normalized, before, after);
    if (!range) {
      return NextResponse.json(
        { ok: false, error: "Invalid receipt number format." },
        { status: 400, headers: corsHeaders }
      );
    }

    const startSerial = range.center.serial - before;
    const endSerial = range.center.serial + after;

    const { data: cached } = await supabase
      .from("uscis_case_cache")
      .select(
        "receipt_number, serial, current_status, case_type, status_date, received_date, is_valid"
      )
      .eq("prefix", range.center.prefix)
      .gte("serial", Math.max(0, startSerial))
      .lte("serial", endSerial)
      .order("serial", { ascending: true });

    const cases: CohortCase[] = (cached ?? []).map((row) => ({
      receiptNumber: row.receipt_number,
      serial: Number(row.serial),
      currentStatus: row.current_status,
      caseType: row.case_type,
      statusDate: row.status_date,
      receivedDate: row.received_date,
      isValid: row.is_valid,
      category: categorizeStatus(row.current_status, row.is_valid),
      isCenter: row.receipt_number === normalized,
    }));

    const analytics = computeCohortAnalytics({
      cases,
      totalRequested: range.receipts.length,
    });

    // Fire-and-forget background scan to fill gaps (does not block the response).
    void fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/case-status/nearby/scan`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Secret": process.env.CRON_SECRET || "",
        },
        body: JSON.stringify({ receipt: normalized, before, after }),
      }
    ).catch(() => {});

    return NextResponse.json(
      {
        ok: true,
        center: normalized,
        range: { before, after },
        analytics,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error in GET /api/case-status/nearby:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
