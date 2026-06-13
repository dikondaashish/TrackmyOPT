/**
 * One-time reengagement blast — free users with a saved receipt who never upgraded.
 *
 * NOT a standing cron. Enable only for the campaign, run manually (or fire once on
 * cron-job.org), then disable FREE_RECEIPT_REENGAGEMENT_ENABLED.
 *
 * Env (required to send):
 *   FREE_RECEIPT_REENGAGEMENT_ENABLED=true
 *
 * Query params:
 *   limit — max sends this run (default 25). Re-run until remaining=0.
 *
 * Manual test:
 *   curl -s "https://www.trackmyopt.com/api/cron/free-receipt-reengagement?limit=25" \
 *     -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  findFreeReceiptReengagementCandidates,
  FREE_RECEIPT_REENGAGEMENT_DEFAULT_BATCH,
} from "@/lib/billing/free-receipt-reengagement";
import { sendFreeReceiptReengagementEmail } from "@/lib/notifications/transactional-emails";
import { captureServerEvent, normalizePlanTier } from "@/lib/posthog-server";
import { sanitizeError, secureLog, logIdPrefix } from "@/lib/secure-logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Pause between SMTP sends to avoid rate limits (ms). */
const SEND_PACING_MS = 200;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function parseBatchLimit(req: NextRequest): number {
  const raw = req.nextUrl.searchParams.get("limit");
  if (!raw) return FREE_RECEIPT_REENGAGEMENT_DEFAULT_BATCH;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return FREE_RECEIPT_REENGAGEMENT_DEFAULT_BATCH;
  return Math.min(n, 100);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  const authHeader = req.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!expectedAuth || authHeader !== expectedAuth) {
    secureLog.warn("Unauthorized free-receipt-reengagement attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.FREE_RECEIPT_REENGAGEMENT_ENABLED !== "true") {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason:
        "FREE_RECEIPT_REENGAGEMENT_ENABLED is not true — set it for the one-time campaign, then disable after.",
    });
  }

  const limit = parseBatchLimit(req);
  let processed = 0;
  let sent = 0;
  let skipped_dedup = 0;
  let skipped_blocked = 0;
  let failed = 0;

  try {
    const candidates = await findFreeReceiptReengagementCandidates(supabase, {
      limit,
    });

    secureLog.info(
      `free-receipt-reengagement: ${candidates.length} candidate(s) this batch (limit=${limit})`
    );

    for (const user of candidates) {
      processed += 1;

      const result = await sendFreeReceiptReengagementEmail({
        supabase,
        userId: user.userId,
        toEmail: user.email,
        firstName: user.firstName,
      });

      if (!result.ok) {
        failed += 1;
        secureLog.error(
          "free-receipt-reengagement send failed:",
          logIdPrefix(user.userId),
          result.error
        );
        continue;
      }

      if (result.skipped === "deduped") {
        skipped_dedup += 1;
        continue;
      }

      if (result.skipped === "blocked") {
        skipped_blocked += 1;
        continue;
      }

      sent += 1;

      await captureServerEvent(user.userId, "reengagement_email_sent", {
        plan_tier: normalizePlanTier(user.planTier),
      });

      if (SEND_PACING_MS > 0 && processed < candidates.length) {
        await sleep(SEND_PACING_MS);
      }
    }

    return NextResponse.json({
      ok: true,
      batchLimit: limit,
      processed,
      sent,
      skipped_dedup,
      skipped_blocked,
      failed,
      hasMore: candidates.length === limit,
      durationMs: Date.now() - startTime,
    });
  } catch (error: unknown) {
    secureLog.error("free-receipt-reengagement error:", sanitizeError(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
