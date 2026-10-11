import { withSentryApiErrors } from '@/lib/sentry/api-errors';
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
import { getAppBaseUrl } from "@/lib/notifications/transactional/queue";
import { sendCheckoutRecoveryEmail } from "@/lib/notifications/transactional/reengagement";
import { captureServerEvent, normalizePlanTier } from "@/lib/posthog-server";
import { sanitizeError, secureLog, logIdPrefix } from "@/lib/secure-logger";
import { requireLiveStripeKeyInProduction } from "@/lib/stripe/require-live-key-in-production";

import { pendingCaseEmailsEnabled, requireCasePromotionProvider } from "@/lib/notifications/pending-case-email";

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
    apiVersion: "2026-08-26.dahlia",
  });
}

async function handleGET(req: NextRequest) {
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
    const experimentEnabled = pendingCaseEmailsEnabled();
    if (experimentEnabled) requireCasePromotionProvider();
    const abandoners = await findCheckoutAbandoners(supabase);
    secureLog.info(`checkout-recovery: ${abandoners.length} candidate(s)`);
    const stripe = getStripe();
    const appBase = getAppBaseUrl();

    for (const user of abandoners) {
      if (Date.now() - startTime > 240_000) break;
      processed += 1;
      if (experimentEnabled && !stripe) throw new Error("Recovery billing verification unavailable");

      let stripeSession: { status: string | null; url: string | null } | null =
        null;
      if (stripe) {
        try {
          const session = await stripe.checkout.sessions.retrieve(
            user.stripeCheckoutSessionId
          );
          if (session.status === "complete" || session.payment_status === "paid") {
            skipped_dedup += 1;
            continue;
          }
          stripeSession = {
            status: session.status ?? null,
            url: session.url ?? null,
          };
        } catch (e) {
          if (experimentEnabled) {
            console.error("Checkout recovery billing verification failed");
            failed += 1;
            continue;
          }
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
  } catch {
    console.error("Checkout recovery cron failed");
    return NextResponse.json(
      { error: "Checkout recovery unavailable" },
      { status: 500 }
    );
  }
}

async function handlePOST(req: NextRequest) {
  return GET(req);
}

export const GET = withSentryApiErrors(handleGET, '/api/cron/checkout-recovery-emails', 'GET');
export const POST = withSentryApiErrors(handlePOST, '/api/cron/checkout-recovery-emails', 'POST');
