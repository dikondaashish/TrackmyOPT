/**
 * DISABLED — USCIS API compliance (July 2026).
 *
 * Former behavior: internal batch scan of neighbor receipts into uscis_case_cache.
 * Implementation preserved in lib/case-status/scan-nearby.ts.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Nearby receipt scanning is permanently disabled for USCIS API compliance.",
      code: "nearby_scan_disabled",
    },
    { status: 410 }
  );
}
