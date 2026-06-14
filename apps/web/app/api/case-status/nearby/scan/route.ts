import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { buildReceiptRange, MAX_COHORT_RANGE } from "@/lib/case-status/receipt-cohort";
import { scanNearbyReceipts } from "@/lib/case-status/scan-nearby";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/case-status/nearby/scan
 * Internal endpoint (CRON_SECRET) that scans a batch of uncached receipts in
 * the range around a center receipt and writes them to uscis_case_cache.
 */
export async function POST(req: NextRequest) {
  try {
    const internalSecret = req.headers.get("X-Internal-Secret");
    if (!internalSecret || internalSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const receipt = typeof body.receipt === "string" ? body.receipt : null;
    const before = Math.min(Number(body.before) || 0, MAX_COHORT_RANGE);
    const after = Math.min(Number(body.after) || 0, MAX_COHORT_RANGE);

    if (!receipt) {
      return NextResponse.json({ ok: false, error: "receipt required" }, { status: 400 });
    }

    const range = buildReceiptRange(receipt, before, after);
    if (!range) {
      return NextResponse.json({ ok: false, error: "invalid receipt" }, { status: 400 });
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const result = await scanNearbyReceipts(supabase, range.receipts);

    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/case-status/nearby/scan:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
