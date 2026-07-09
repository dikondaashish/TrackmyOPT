/**
 * Nightly LTV sync — pushes Supabase payment totals to PostHog person properties.
 *
 * Schedule on cron-job.org (not Vercel Cron). Suggested: daily 6:00 AM UTC.
 *
 * Env: POSTHOG_LTV_SYNC_ENABLED=true
 *
 * Query params:
 *   limit  — max users per run (default 50)
 *   offset — pagination offset for full backfill
 *
 * Manual test:
 *   curl -s "https://www.trackmyopt.com/api/cron/posthog-ltv-sync?limit=50" \
 *     -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";
import { createClient } from "@supabase/supabase-js";
import {
  findLtvSyncCandidates,
  LTV_SYNC_DEFAULT_BATCH,
  syncLtvBatch,
} from "@/lib/posthog/ltv-sync";
import { sanitizeError, secureLog } from "@/lib/secure-logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function parseLimit(req: NextRequest): number {
  const raw = req.nextUrl.searchParams.get("limit");
  if (!raw) return LTV_SYNC_DEFAULT_BATCH;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return LTV_SYNC_DEFAULT_BATCH;
  return Math.min(n, 200);
}

function parseOffset(req: NextRequest): number {
  const raw = req.nextUrl.searchParams.get("offset");
  if (!raw) return 0;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const cronAuthError = verifyCronAuth(req);
  if (cronAuthError) return cronAuthError;

  if (process.env.POSTHOG_LTV_SYNC_ENABLED !== "true") {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "POSTHOG_LTV_SYNC_ENABLED is not true.",
    });
  }

  const limit = parseLimit(req);
  const offset = parseOffset(req);

  try {
    const userIds = await findLtvSyncCandidates(supabase, { limit, offset });
    const result = await syncLtvBatch(supabase, userIds);

    return NextResponse.json({
      ok: true,
      batchLimit: limit,
      offset,
      processed: userIds.length,
      synced: result.synced,
      skipped: result.skipped,
      hasMore: userIds.length === limit,
      durationMs: Date.now() - startTime,
    });
  } catch (error: unknown) {
    secureLog.error("posthog-ltv-sync error:", sanitizeError(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
