/**
 * Cron Job: Scan nearby receipts around Pro users' tracked cases
 *
 * Fills the shared uscis_case_cache so nearby-case cohorts are warm before
 * users open the dashboard. Triggered every 15 minutes by cron-job.org.
 *
 * Setup on cron-job.org:
 * - URL: https://www.trackmyopt.com/api/cron/scan-nearby-cases
 * - Schedule: Every 15 minutes
 * - Method: GET
 * - Headers: Authorization: Bearer YOUR_CRON_SECRET
 *
 * Optional query params: ?centers=5&range=100 (clamped).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { buildReceiptRange } from "@/lib/case-status/receipt-cohort";
import { scanNearbyReceipts } from "@/lib/case-status/scan-nearby";
import { parseNearbyScanCronParams } from "@/lib/case-status/nearby-scan-cron-params";
import { sanitizeError, secureLog } from "@/lib/secure-logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.USCIS_CLIENT_ID || !process.env.USCIS_CLIENT_SECRET) {
      return NextResponse.json(
        { ok: true, skipped: true, reason: "USCIS credentials not configured" },
        { status: 200 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      secureLog.error("[cron] Missing Supabase env for scan-nearby-cases");
      return NextResponse.json(
        { ok: false, error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const { centers: centersPerRun, range } = parseNearbyScanCronParams(
      req.nextUrl.searchParams
    );

    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

    const { data: proProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("premium_status", true);

    if (profilesError) {
      secureLog.error("[cron] scan-nearby-cases profiles query failed:", profilesError);
      return NextResponse.json(
        { ok: false, error: "Failed to load Pro profiles" },
        { status: 500 }
      );
    }

    const proUserIds = (proProfiles ?? []).map((p) => p.user_id);
    if (!proUserIds.length) {
      return NextResponse.json(
        { ok: true, centers: 0, scanned: 0, valid: 0, invalid: 0 },
        { status: 200 }
      );
    }

    const { data: centers, error: centersError } = await supabase
      .from("case_status")
      .select("id, receipt_number")
      .in("user_id", proUserIds)
      .order("last_nearby_scan_at", { ascending: true, nullsFirst: true })
      .limit(centersPerRun);

    if (centersError) {
      secureLog.error("[cron] scan-nearby-cases centers query failed:", centersError);
      return NextResponse.json(
        { ok: false, error: "Failed to load case centers" },
        { status: 500 }
      );
    }

    const rows = centers ?? [];
    let scanned = 0;
    let valid = 0;
    let invalid = 0;

    for (const row of rows) {
      const rangeResult = buildReceiptRange(row.receipt_number, range, range);
      if (rangeResult) {
        const result = await scanNearbyReceipts(supabase, rangeResult.receipts);
        scanned += result.scanned;
        valid += result.valid;
        invalid += result.invalid;
      }

      const { error: stampError } = await supabase
        .from("case_status")
        .update({ last_nearby_scan_at: new Date().toISOString() })
        .eq("id", row.id);

      if (stampError) {
        secureLog.error(
          `[cron] scan-nearby-cases stamp failed for ${row.id}:`,
          stampError
        );
      }
    }

    return NextResponse.json(
      { ok: true, centers: rows.length, scanned, valid, invalid },
      { status: 200 }
    );
  } catch (error) {
    secureLog.error("[cron] scan-nearby-cases error:", sanitizeError(error));
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
