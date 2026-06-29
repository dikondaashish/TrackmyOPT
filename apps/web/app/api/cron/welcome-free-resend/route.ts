/**
 * One-time welcome_free resend — users whose welcome failed with SMTP 535 auth errors.
 *
 * NOT a standing cron. Enable only for the campaign, run manually (or fire once on
 * cron-job.org), then disable WELCOME_FREE_RESEND_ENABLED.
 *
 * Env (required to send):
 *   WELCOME_FREE_RESEND_ENABLED=true
 *
 * Query params:
 *   limit   — max sends this run (default 25). Re-run until remaining=0.
 *   dry_run — if "true", report eligible count only (no SMTP).
 *
 * Manual test:
 *   curl -s "https://www.trackmyopt.com/api/cron/welcome-free-resend?dry_run=true" \
 *     -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";
import { createClient } from "@supabase/supabase-js";
import {
  countWelcomeFreeResendEligible,
  findWelcomeFreeResendCandidates,
  WELCOME_FREE_RESEND_DEFAULT_BATCH,
} from "@/lib/billing/welcome-free-resend";
import { sendWelcomeFreeResendEmail } from "@/lib/notifications/transactional-emails";
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
  if (!raw) return WELCOME_FREE_RESEND_DEFAULT_BATCH;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return WELCOME_FREE_RESEND_DEFAULT_BATCH;
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

  const dryRun = isDryRun(req);

  if (!dryRun && process.env.WELCOME_FREE_RESEND_ENABLED !== "true") {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason:
        "WELCOME_FREE_RESEND_ENABLED is not true — set it for the one-time campaign, then disable after.",
    });
  }

  const limit = parseBatchLimit(req);
  let processed = 0;
  let sent = 0;
  let skipped_dedup = 0;
  let skipped_blocked = 0;
  let failed = 0;

  try {
    const eligibleTotal = await countWelcomeFreeResendEligible(supabase);

    secureLog.info(
      `welcome-free-resend: ${eligibleTotal} eligible user(s) total (dry_run=${dryRun})`
    );

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        eligibleTotal,
        batchLimit: limit,
        durationMs: Date.now() - startTime,
      });
    }

    const candidates = await findWelcomeFreeResendCandidates(supabase, { limit });

    secureLog.info(
      `welcome-free-resend: sending batch of ${candidates.length} (limit=${limit}, eligibleTotal=${eligibleTotal})`
    );

    for (const user of candidates) {
      processed += 1;

      const result = await sendWelcomeFreeResendEmail({
        supabase,
        userId: user.userId,
        toEmail: user.email,
        firstName: user.firstName,
      });

      if (!result.ok) {
        failed += 1;
        secureLog.error(
          "welcome-free-resend send failed:",
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

      await captureServerEvent(user.userId, "welcome_resend_sent", {
        plan_tier: normalizePlanTier(user.planTier),
      });

      if (SEND_PACING_MS > 0 && processed < candidates.length) {
        await sleep(SEND_PACING_MS);
      }
    }

    const remaining = await countWelcomeFreeResendEligible(supabase);

    return NextResponse.json({
      ok: true,
      eligibleTotal,
      batchLimit: limit,
      processed,
      sent,
      skipped_dedup,
      skipped_blocked,
      failed,
      remaining,
      hasMore: remaining > 0,
      durationMs: Date.now() - startTime,
    });
  } catch (error: unknown) {
    secureLog.error("welcome-free-resend error:", sanitizeError(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
