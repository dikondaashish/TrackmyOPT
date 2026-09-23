/**
 * Retries transactional emails stuck in email_queue (status=pending) after SMTP
 * never completed — e.g. serverless returned before send finished.
 *
 * Security: CRON_SECRET (same as other cron routes)
 *
 * Manual / cron-job.org:
 *   curl -s "https://YOUR_DOMAIN/api/cron/retry-pending-emails" \
 *     -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";
import { createClient } from "@supabase/supabase-js";
import { sendMailWithRetry } from "@/lib/notifications/email-smtp";
import { buildWelcomeFreeEmailBodies } from "@/lib/notifications/transactional/onboarding";
import { buildStemOptWindowEmailBodies } from "@/lib/notifications/transactional/alerts";
import {
  buildCheckoutRecoveryEmailBodies,
  buildFreeReceiptReengagementEmailBodies,
  buildAtRiskReengagementEmailBodies,
} from "@/lib/notifications/transactional/reengagement";
import { getTransactionalEmailFromHeader } from "@/lib/notifications/transactional/queue";
import { sanitizeError, secureLog, logIdPrefix } from "@/lib/secure-logger";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_RETRIES = 3;
const STALE_MINUTES = 10;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type EmailQueueRow = {
  id: string;
  user_id: string | null;
  email_address: string;
  email_subject: string | null;
  email_type: string;
  body_html: string | null;
  body_text: string | null;
  retry_count: number | null;
};

async function resolveBodiesForRetry(
  row: EmailQueueRow
): Promise<{ subject: string; html: string; text: string } | null> {
  const subjectFallback = row.email_subject?.trim() || "Email from TrackMyOPT";

  // Daily reminders are freshly calculated by their own cron. Their queue rows
  // reserve the per-user day; replaying a saved countdown can send stale dates
  // or disclose tools to an address that is no longer enrolled.
  if (row.email_type === "daily_reminder") return null;

  // A saved STEM body can outlive a recommendation date edit or a filing deadline.
  // Always rebuild it before considering the generic persisted-body shortcut.
  if (row.email_type === "stem_opt_window_open") {
    if (!row.user_id) return null;
    const [optResult, profileResult] = await Promise.all([
      supabase.from("opt_status")
        .select("opt_ead_end_date, stem_dso_recommendation_date, stem_start_date")
        .eq("user_id", row.user_id).maybeSingle(),
      supabase.from("profiles").select("first_name, stem_apply_email, notification_email, email")
        .eq("user_id", row.user_id).maybeSingle(),
    ]);
    if (optResult.error || !optResult.data?.opt_ead_end_date || optResult.data.stem_start_date) return null;
    if (profileResult.error || !profileResult.data) return null;
    const profile = profileResult.data;
    // Match the window cron's existing recipient preference; never send to an old address.
    const currentEmail = profile.stem_apply_email?.trim() || profile.notification_email?.trim() || profile.email?.trim();
    if (!currentEmail || currentEmail.toLowerCase() !== row.email_address.trim().toLowerCase()) return null;
    return buildStemOptWindowEmailBodies({
      firstName: profileResult.data?.first_name ?? null,
      optEadEndDate: optResult.data.opt_ead_end_date,
      stemDsoRecommendationDate: optResult.data.stem_dso_recommendation_date,
    });
  }

  if (row.body_html && row.body_text) {
    return {
      subject: subjectFallback,
      html: row.body_html,
      text: row.body_text,
    };
  }

  if (row.email_type === "welcome_free" && row.user_id) {
    let firstName: string | null = null;
    const { data, error } = await supabase.auth.admin.getUserById(row.user_id);
    if (error) {
      secureLog.error("retry-pending-emails getUserById:", sanitizeError(error));
    } else if (data?.user) {
      const meta = data.user.user_metadata as { firstName?: string; first_name?: string } | undefined;
      firstName = meta?.firstName || meta?.first_name || null;
    }
    const bodies = buildWelcomeFreeEmailBodies(firstName);
    return { subject: bodies.subject, html: bodies.html, text: bodies.text };
  }

  if (row.email_type === "welcome_free_resend" && row.user_id) {
    let firstName: string | null = null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("user_id", row.user_id)
      .maybeSingle();
    firstName = profile?.first_name ?? null;
    if (!firstName) {
      const { data, error } = await supabase.auth.admin.getUserById(row.user_id);
      if (!error && data?.user) {
        const meta = data.user.user_metadata as { firstName?: string; first_name?: string } | undefined;
        firstName = meta?.firstName || meta?.first_name || null;
      }
    }
    const bodies = buildWelcomeFreeEmailBodies(firstName);
    return { subject: bodies.subject, html: bodies.html, text: bodies.text };
  }

  if (row.email_type === "checkout_recovery" && row.user_id) {
    let firstName: string | null = null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("user_id", row.user_id)
      .maybeSingle();
    firstName = profile?.first_name ?? null;

    // Prefer stored resume URL from the original queue row when bodies were dropped.
    let checkoutUrl: string | undefined;
    let resumeKind: "open_session" | "fresh_checkout" | undefined;
    const { data: fullRow } = await supabase
      .from("email_queue")
      .select("email_data")
      .eq("id", row.id)
      .maybeSingle();
    const emailData = (fullRow?.email_data ?? null) as {
      checkout_url?: string | null;
      resume_kind?: string | null;
    } | null;
    if (typeof emailData?.checkout_url === "string" && emailData.checkout_url.trim()) {
      checkoutUrl = emailData.checkout_url.trim();
    }
    if (emailData?.resume_kind === "open_session" || emailData?.resume_kind === "fresh_checkout") {
      resumeKind = emailData.resume_kind;
    }

    const bodies = buildCheckoutRecoveryEmailBodies(firstName, {
      checkoutUrl,
      resumeKind,
    });
    return { subject: bodies.subject, html: bodies.html, text: bodies.text };
  }

  if (row.email_type === "free_receipt_reengagement" && row.user_id) {
    let firstName: string | null = null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("user_id", row.user_id)
      .maybeSingle();
    firstName = profile?.first_name ?? null;
    const bodies = buildFreeReceiptReengagementEmailBodies(firstName);
    return { subject: bodies.subject, html: bodies.html, text: bodies.text };
  }

  if (row.email_type === "at_risk_reengagement" && row.user_id) {
    let firstName: string | null = null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("user_id", row.user_id)
      .maybeSingle();
    firstName = profile?.first_name ?? null;
    const bodies = buildAtRiskReengagementEmailBodies(firstName);
    return { subject: bodies.subject, html: bodies.html, text: bodies.text };
  }

  return null;
}

export async function GET(req: NextRequest) {
  const cronAuthError = verifyCronAuth(req);
  if (cronAuthError) return cronAuthError;

  const cutoffIso = new Date(Date.now() - STALE_MINUTES * 60 * 1000).toISOString();

  const { data: rows, error: qErr } = await supabase
    .from("email_queue")
    .select(
      "id, user_id, email_address, email_subject, email_type, body_html, body_text, retry_count"
    )
    .eq("status", "pending")
    .lt("created_at", cutoffIso);

  if (qErr) {
    secureLog.error("retry-pending-emails query:", sanitizeError(qErr));
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  const list = (rows || []) as EmailQueueRow[];
  const results: Array<{ id: string; outcome: string }> = [];

  for (const row of list) {
    const retryCount = row.retry_count ?? 0;

    if (retryCount >= MAX_RETRIES) {
      await supabase
        .from("email_queue")
        .update({
          status: "failed",
          error_message: "max retries exceeded",
        })
        .eq("id", row.id);
      results.push({ id: row.id, outcome: "failed_max_retries" });
      continue;
    }

    const resolved = await resolveBodiesForRetry(row);
    if (!resolved) {
      await supabase
        .from("email_queue")
        .update({
          status: "failed",
          error_message:
            "retry suppressed: unsupported daily replay, unavailable current data/recipient, or missing body",
          retry_count: Math.min(retryCount + 1, MAX_RETRIES),
        })
        .eq("id", row.id);
      results.push({ id: row.id, outcome: "failed_missing_body" });
      continue;
    }

    const { subject, html, text } = resolved;

    try {
      const info = await sendMailWithRetry({
        from: getTransactionalEmailFromHeader(),
        to: row.email_address,
        subject,
        html,
        text,
      });

      const messageId =
        typeof info.messageId === "string" && info.messageId.length > 0
          ? info.messageId
          : `smtp-retry-${row.id}`;

      await supabase
        .from("email_queue")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          provider_message_id: messageId,
          body_html: html,
          body_text: text,
          email_subject: subject,
          error_message: null,
        })
        .eq("id", row.id);

      results.push({ id: row.id, outcome: "sent" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const nextRetry = retryCount + 1;
      const failed = nextRetry >= MAX_RETRIES;

      await supabase
        .from("email_queue")
        .update({
          status: failed ? "failed" : "pending",
          error_message: failed ? msg.slice(0, 2000) : `retry ${nextRetry}/${MAX_RETRIES}: ${msg.slice(0, 500)}`,
          retry_count: nextRetry,
        })
        .eq("id", row.id);

      results.push({ id: row.id, outcome: failed ? "failed_send" : "pending_retry" });
      secureLog.error("retry-pending-emails send failed:", logIdPrefix(row.id), msg);
    }
  }

  return NextResponse.json({
    ok: true,
    staleMinutes: STALE_MINUTES,
    maxRetries: MAX_RETRIES,
    processed: list.length,
    results,
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
