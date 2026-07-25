/**
 * Checkout recovery emails — one nudge for users who started Pro checkout but didn't pay.
 *
 * Runs on Vercel Cron every 4h (see vercel.json) and optionally via cron-job.org.
 *
 * Manual test:
 *   curl -s "https://www.trackmyopt.com/api/cron/checkout-recovery-emails" \
 *     -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";
import { createClient } from "@supabase/supabase-js";
import {
  findCheckoutAbandoners,
  resolveCheckoutResumeUrl,
} from "@/lib/billing/checkout-recovery";
import {
  getAppBaseUrl,
  sendCheckoutRecoveryEmail,
} from "@/lib/notifications/transactional-emails";
import { captureServerEvent, normalizePlanTier } from "@/lib/posthog-server";
import { sanitizeError, secureLog, logIdPrefix } from "@/lib/secure-logger";
import { requireLiveStripeKeyInProduction } from "@/lib/stripe/requireLiveKeyInProduction";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  requireLiveStripeKeyInProduction();
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
  });
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  const cronAuthError = verifyCronAuth(req);
  if (cronAuthError) return cronAuthError;

  let processed = 0;
  let sent = 0;
  let skipped_dedup = 0;
  let skipped_blocked = 0;
  let failed = 0;
  let open_session_links = 0;
  let fresh_checkout_links = 0;

  try {
    const abandoners = await findCheckoutAbandoners(supabase);
    secureLog.info(`checkout-recovery: ${abandoners.length} candidate(s)`);
    const stripe = getStripe();
    const appBase = getAppBaseUrl();

    for (const user of abandoners) {
      processed += 1;

      let stripeSession: { status: string | null; url: string | null } | null =
        null;
      if (stripe) {
        try {
          const session = await stripe.checkout.sessions.retrieve(
            user.stripeCheckoutSessionId
          );
          stripeSession = {
            status: session.status ?? null,
            url: session.url ?? null,
          };
        } catch (e) {
          secureLog.warn(
            "checkout-recovery session retrieve failed:",
            logIdPrefix(user.stripeCheckoutSessionId),
            sanitizeError(e)
          );
        }
      }

      const resume = resolveCheckoutResumeUrl({
        appBaseUrl: appBase,
        planId: user.planId,
        billingInterval: user.billingInterval,
        stripeSession,
      });
      if (resume.kind === "open_session") open_session_links += 1;
      else fresh_checkout_links += 1;

      const result = await sendCheckoutRecoveryEmail({
        supabase,
        userId: user.userId,
        toEmail: user.email,
        firstName: user.firstName,
        checkoutUrl: resume.url,
        resumeKind: resume.kind,
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
        resume_kind: resume.kind,
      });
    }

    return NextResponse.json({
      ok: true,
      processed,
      sent,
      skipped_dedup,
      skipped_blocked,
      failed,
      open_session_links,
      fresh_checkout_links,
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
