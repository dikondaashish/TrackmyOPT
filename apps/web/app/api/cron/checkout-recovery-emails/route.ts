/**
 * Checkout recovery emails — one nudge for users who started Pro checkout but didn't pay.
 *
 * Triggered by cron-job.org via GET + Authorization: Bearer CRON_SECRET
 *
 * Setup on cron-job.org:
 *   Title: "TrackMyOPT - Checkout Recovery"
 *   URL: https://www.trackmyopt.com/api/cron/checkout-recovery-emails
 *   Method: GET
 *   Schedule: every 4 hours (cron: 0 minute, every 4th hour)
 *   Headers: Authorization: Bearer YOUR_CRON_SECRET
 *
 * Manual test:
 *   curl -s "https://www.trackmyopt.com/api/cron/checkout-recovery-emails" \
 *     -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";
import { createClient } from "@supabase/supabase-js";
import { findCheckoutAbandoners } from "@/lib/billing/checkout-recovery";
import { sendCheckoutRecoveryEmail } from "@/lib/notifications/transactional-emails";
import { captureServerEvent, normalizePlanTier } from "@/lib/posthog-server";
import { sanitizeError, secureLog, logIdPrefix } from "@/lib/secure-logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  const cronAuthError = verifyCronAuth(req);
  if (cronAuthError) return cronAuthError;

  let processed = 0;
  let sent = 0;
  let skipped_dedup = 0;
  let skipped_blocked = 0;
  let failed = 0;

  try {
    const abandoners = await findCheckoutAbandoners(supabase);
    secureLog.info(`checkout-recovery: ${abandoners.length} candidate(s)`);

    for (const user of abandoners) {
      processed += 1;

      const result = await sendCheckoutRecoveryEmail({
        supabase,
        userId: user.userId,
        toEmail: user.email,
        firstName: user.firstName,
      });

      if (!result.ok) {
        failed += 1;
        secureLog.error(
          "checkout-recovery send failed:",
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

      await captureServerEvent(user.userId, "checkout_recovery_email_sent", {
        plan_tier: normalizePlanTier(user.planId),
        hours_since_checkout: user.hoursSinceCheckout,
      });
    }

    return NextResponse.json({
      ok: true,
      processed,
      sent,
      skipped_dedup,
      skipped_blocked,
      failed,
      durationMs: Date.now() - startTime,
    });
  } catch (error: unknown) {
    secureLog.error("checkout-recovery cron error:", sanitizeError(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
