import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";
import { ingestCommunityOptTimelines } from "@/lib/community-opt/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Daily ingest of partner community OPT timelines
 * (opt-tracker.com + opt-pulse.vercel.app).
 * Authorization: Bearer CRON_SECRET
 *
 * Written partner permission on file — not USCIS Case Status API data.
 */
export async function GET(req: NextRequest) {
  const denied = verifyCronAuth(req);
  if (denied) return denied;

  const result = await ingestCommunityOptTimelines();
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
