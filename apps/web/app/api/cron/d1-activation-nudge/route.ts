/**
 * D1 activation nudge — free users signed up ≥24h ago who never opened the dashboard.
 *
 * Vercel Cron hourly (see vercel.json). Also callable via cron-job.org:
 *   GET /api/cron/d1-activation-nudge
 *   Authorization: Bearer CRON_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";
import { createClient } from "@supabase/supabase-js";
import {
  D1_ACTIVATION_NUDGE_DEFAULT_BATCH,
  findD1ActivationNudgeCandidates,
} from "@/lib/billing/d1-activation-nudge";
import { sendD1ActivationNudgeEmail } from "@/lib/notifications/transactional-emails";
import { sanitizeError, secureLog, logIdPrefix } from "@/lib/secure-logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SEND_PACING_MS = 150;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function parseBatchLimit(req: NextRequest): number {
  const raw = req.nextUrl.searchParams.get("limit");
  if (!raw) return D1_ACTIVATION_NUDGE_DEFAULT_BATCH;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return D1_ACTIVATION_NUDGE_DEFAULT_BATCH;
  return Math.min(n, 100);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  const cronAuthError = verifyCronAuth(req);
  if (cronAuthError) return cronAuthError;

  const limit = parseBatchLimit(req);
  let processed = 0;
  let sent = 0;
  let skipped_dedup = 0;
  let skipped_blocked = 0;
  let failed = 0;

  try {
    const candidates = await findD1ActivationNudgeCandidates(supabase, { limit });

    secureLog.info(
      `d1-activation-nudge: ${candidates.length} candidate(s) (limit=${limit})`
    );

    for (const user of candidates) {
      processed += 1;

      const result = await sendD1ActivationNudgeEmail({
        supabase,
        userId: user.userId,
        toEmail: user.email,
        firstName: user.firstName,
        hasCaseStatus: user.hasCaseStatus,
        caseStatusText: user.caseStatusText,
        optHeadline: user.optHeadline,
      });

      if (!result.ok) {
        failed += 1;
        secureLog.error(
          "d1-activation-nudge send failed:",
          logIdPrefix(user.userId),
          "error" in result ? result.error : "unknown"
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
    secureLog.error("d1-activation-nudge error:", sanitizeError(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
