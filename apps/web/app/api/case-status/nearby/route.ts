/**
 * DISABLED — USCIS API compliance (July 2026).
 *
 * Former behavior: served cached nearby-case cohort analytics and triggered background
 * scans. No fire-and-forget scan triggers remain anywhere in the codebase.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store",
};

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: "Nearby case analysis is unavailable for USCIS API compliance.",
      code: "nearby_scan_disabled",
    },
    { status: 410, headers: corsHeaders }
  );
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
