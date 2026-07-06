/**
 * Weekly at-risk retention email — users in PostHog cohort 396175 proxy:
 * signed up in 90d, no sign-in in 14d.
 *
 * Env (required to send):
 *   AT_RISK_REENGAGEMENT_ENABLED=true
 *
 * Query params:
 *   limit   — max sends this run (default 25)
 *   dry_run — if "true", report eligible count only (no SMTP)
 *
 * Manual test:
 *   curl -s "https://www.trackmyopt.com/api/cron/at-risk-reengagement?dry_run=true" \
 *     -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";
import { createClient } from "@supabase/supabase-js";
import {
  AT_RISK_REENGAGEMENT_DEFAULT_BATCH,
  findAtRiskReengagementCandidates,
} from "@/lib/posthog/at-risk-reengagement";
import { sendAtRiskReengagementEmail } from "@/lib/notifications/transactional-emails";
import { captureServerEvent, normalizePlanTier } from "@/lib/posthog-server";
import { sanitizeError, secureLog, logIdPrefix } from "@/lib/secure-logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SEND_PACING_MS = 200;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function parseBatchLimit(req: NextRequest): number {
  const raw = req.nextUrl.searchParams.get("limit");
  if (!raw) return AT_RISK_REENGAGEMENT_DEFAULT_BATCH;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return AT_RISK_REENGAGEMENT_DEFAULT_BATCH;
  return Math.min(n, 100);
}

function isDryRun(req: NextRequest): boolean {
  return req.nextUrl.searchParams.get("dry_run") === "true";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  const cronAuthError = verifyCronAuth(req);
  if (cronAuthError) return cronAuthError;

  const limit = parseBatchLimit(req);
  const dryRun = isDryRun(req);

  if (process.env.AT_RISK_REENGAGEMENT_ENABLED !== "true" && !dryRun) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason:
        "AT_RISK_REENGAGEMENT_ENABLED is not true — set it to enable the weekly at-risk retention cron.",
    });
  }

  try {
    const candidates = await findAtRiskReengagementCandidates(supabase, { limit });

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dry_run: true,
        eligible: candidates.length,
        batchLimit: limit,
      });
    }

    let processed = 0;
    let sent = 0;
    let skipped_dedup = 0;
    let skipped_blocked = 0;
    let failed = 0;

    secureLog.info(
      `at-risk-reengagement: ${candidates.length} candidate(s) this batch (limit=${limit})`
    );

    for (const user of candidates) {
      processed += 1;

      const result = await sendAtRiskReengagementEmail({
        supabase,
        userId: user.userId,
        toEmail: user.email,
        firstName: user.firstName,
      });

      if (!result.ok) {
        failed += 1;
        secureLog.error(
          "at-risk-reengagement send failed:",
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

      await captureServerEvent(user.userId, "at_risk_reengagement_email_sent", {
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
    secureLog.error("at-risk-reengagement error:", sanitizeError(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
