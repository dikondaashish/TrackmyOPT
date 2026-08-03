/**
 * Transactional email queue core: blocked-address checks, per-type dedupe
 * rules, the email_queue write path, and the shared formatting helpers every
 * template module uses.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "@/types/supabase";
import { getSmtpFromHeader, sendMailWithRetry } from "../email-smtp";

export function getAppBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://www.trackmyopt.com").replace(/\/$/, "");
}

export function getFromHeader(): string {
  return getTransactionalEmailFromHeader();
}

/** From header for SMTP — exported for retry cron + tests */
export function getTransactionalEmailFromHeader(): string {
  return getSmtpFromHeader();
}

type EmailDataRow = { id: string; email_data: Json | null; created_at: string | null };

async function isEmailBlocked(supabase: SupabaseClient, email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const { data } = await supabase
    .from("blocked_emails")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();
  return Boolean(data);
}

async function fetchExistingTypeRows(
  supabase: SupabaseClient,
  userId: string,
  emailType: string
): Promise<EmailDataRow[]> {
  const { data } = await supabase
    .from("email_queue")
    .select("id, email_data, created_at")
    .eq("user_id", userId)
    .eq("email_type", emailType);
  return (data as EmailDataRow[]) || [];
}

function getStripeEventIdFromRow(row: EmailDataRow): string | undefined {
  const ed = row.email_data;
  if (ed && typeof ed === "object" && !Array.isArray(ed) && "stripe_event_id" in ed) {
    const v = (ed as { stripe_event_id?: unknown }).stripe_event_id;
    return typeof v === "string" ? v : undefined;
  }
  return undefined;
}

/** payment_failed: same Stripe event OR same invoice id in 24h; plus stripe_event_id all-time */
async function shouldSkipPaymentFailed(
  supabase: SupabaseClient,
  userId: string,
  stripeEventId: string,
  invoiceId?: string | null
): Promise<boolean> {
  const rows = await fetchExistingTypeRows(supabase, userId, "payment_failed");
  if (rows.some((r) => getStripeEventIdFromRow(r) === stripeEventId)) return true;
  if (invoiceId) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const dupInvoice = rows.some((r) => {
      const ed = r.email_data;
      if (!ed || typeof ed !== "object" || Array.isArray(ed)) return false;
      const inv = (ed as { stripe_invoice_id?: string }).stripe_invoice_id;
      return inv === invoiceId && r.created_at && r.created_at >= since;
    });
    if (dupInvoice) return true;
  }
  return false;
}

async function shouldSkipStripeEventAllTime(
  supabase: SupabaseClient,
  userId: string,
  emailType: string,
  stripeEventId: string
): Promise<boolean> {
  const rows = await fetchExistingTypeRows(supabase, userId, emailType);
  return rows.some((r) => getStripeEventIdFromRow(r) === stripeEventId);
}

async function shouldSkipWelcomeFree(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const rows = await fetchExistingTypeRows(supabase, userId, "welcome_free");
  return rows.length > 0;
}

async function shouldSkipPremiumWelcome(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const rows = await fetchExistingTypeRows(supabase, userId, "premium_welcome");
  return rows.length > 0;
}

async function shouldSkipCheckoutRecovery(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const rows = await fetchExistingTypeRows(supabase, userId, "checkout_recovery");
  return rows.length > 0;
}

async function shouldSkipFreeReceiptReengagement(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const rows = await fetchExistingTypeRows(supabase, userId, "free_receipt_reengagement");
  return rows.length > 0;
}

async function shouldSkipAtRiskReengagement(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const rows = await fetchExistingTypeRows(supabase, userId, "at_risk_reengagement");
  return rows.length > 0;
}

async function shouldSkipWelcomeFreeResend(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const [resentRows, sentWelcomeRows] = await Promise.all([
    fetchExistingTypeRows(supabase, userId, "welcome_free_resend"),
    supabase
      .from("email_queue")
      .select("id")
      .eq("user_id", userId)
      .eq("email_type", "welcome_free")
      .eq("status", "sent")
      .limit(1),
  ]);

  if (resentRows.length > 0) return true;
  return Boolean(sentWelcomeRows.data && sentWelcomeRows.data.length > 0);
}

/** STEM OPT window alert: skip if we already queued/sent this type in the last 60 days */
async function shouldSkipStemOptWindowWithin60Days(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("email_queue")
    .select("id")
    .eq("user_id", userId)
    .eq("email_type", "stem_opt_window_open")
    .gte("created_at", since)
    .limit(1);
  return Boolean(data && data.length > 0);
}

async function shouldSkipD1ActivationNudge(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("email_queue")
    .select("id")
    .eq("user_id", userId)
    .eq("email_type", "d1_activation_nudge")
    .in("status", ["sent", "pending"])
    .limit(1);
  return Boolean(data?.length);
}

export type QueueTransactionalResult =
  | { ok: true; skipped: "blocked" | "deduped" }
  | { ok: true; skipped: false; queueId: string }
  | { ok: false; error: string };

type DedupeMode =
  | { kind: "payment_failed"; stripeEventId: string; stripeInvoiceId?: string | null }
  | { kind: "stripe_event_alltime"; stripeEventId: string }
  | { kind: "material_policy"; policyVersion: string }
  | { kind: "welcome_free" }
  | { kind: "premium_welcome" }
  | { kind: "checkout_recovery" }
  | { kind: "free_receipt_reengagement" }
  | { kind: "at_risk_reengagement" }
  | { kind: "welcome_free_resend" }
  | { kind: "stem_opt_window" }
  | { kind: "d1_activation_nudge" }
  | { kind: "none" };

/**
 * Insert pending → send SMTP → update sent/failed. Updates provider_message_id with SMTP Message-ID.
 */
export async function queueTransactionalEmailSend(args: {
  supabase: SupabaseClient;
  /** Nullable for public contact form auto-reply (no auth user). */
  userId: string | null;
  emailAddress: string;
  emailType: string;
  subject: string;
  html: string;
  text: string;
  emailData?: Record<string, unknown>;
  dedupe: DedupeMode;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, emailAddress, emailType, subject, html, text, emailData, dedupe } = args;

  if (await isEmailBlocked(supabase, emailAddress)) {
    return { ok: true, skipped: "blocked" };
  }

  const dataWithEvent = {
    ...emailData,
  } as Record<string, unknown>;

  if (dedupe.kind === "welcome_free") {
    if (!userId) {
      return { ok: false, error: "user_id required for welcome_free" };
    }
    if (await shouldSkipWelcomeFree(supabase, userId)) {
      return { ok: true, skipped: "deduped" };
    }
  } else if (dedupe.kind === "premium_welcome") {
    if (!userId) {
      return { ok: false, error: "user_id required for premium_welcome" };
    }
    if (await shouldSkipPremiumWelcome(supabase, userId)) {
      return { ok: true, skipped: "deduped" };
    }
  } else if (dedupe.kind === "checkout_recovery") {
    if (!userId) {
      return { ok: false, error: "user_id required for checkout_recovery" };
    }
    if (await shouldSkipCheckoutRecovery(supabase, userId)) {
      return { ok: true, skipped: "deduped" };
    }
  } else if (dedupe.kind === "free_receipt_reengagement") {
    if (!userId) {
      return { ok: false, error: "user_id required for free_receipt_reengagement" };
    }
    if (await shouldSkipFreeReceiptReengagement(supabase, userId)) {
      return { ok: true, skipped: "deduped" };
    }
  } else if (dedupe.kind === "at_risk_reengagement") {
    if (!userId) {
      return { ok: false, error: "user_id required for at_risk_reengagement" };
    }
    if (await shouldSkipAtRiskReengagement(supabase, userId)) {
      return { ok: true, skipped: "deduped" };
    }
  } else if (dedupe.kind === "welcome_free_resend") {
    if (!userId) {
      return { ok: false, error: "user_id required for welcome_free_resend" };
    }
    if (await shouldSkipWelcomeFreeResend(supabase, userId)) {
      return { ok: true, skipped: "deduped" };
    }
  } else if (dedupe.kind === "stem_opt_window") {
    if (!userId) {
      return { ok: false, error: "user_id required for stem_opt_window" };
    }
    if (await shouldSkipStemOptWindowWithin60Days(supabase, userId)) {
      return { ok: true, skipped: "deduped" };
    }
  } else if (dedupe.kind === "d1_activation_nudge") {
    if (!userId) {
      return { ok: false, error: "user_id required for d1_activation_nudge" };
    }
    if (await shouldSkipD1ActivationNudge(supabase, userId)) {
      return { ok: true, skipped: "deduped" };
    }
  } else if (dedupe.kind === "payment_failed") {
    if (!userId) {
      return { ok: false, error: "user_id required for payment_failed" };
    }
    if (
      await shouldSkipPaymentFailed(
        supabase,
        userId,
        dedupe.stripeEventId,
        dedupe.stripeInvoiceId ?? undefined
      )
    ) {
      return { ok: true, skipped: "deduped" };
    }
    dataWithEvent.stripe_event_id = dedupe.stripeEventId;
    if (dedupe.stripeInvoiceId) dataWithEvent.stripe_invoice_id = dedupe.stripeInvoiceId;
  } else if (dedupe.kind === "stripe_event_alltime") {
    if (!userId) {
      return { ok: false, error: "user_id required for stripe_event_alltime dedupe" };
    }
    if (await shouldSkipStripeEventAllTime(supabase, userId, emailType, dedupe.stripeEventId)) {
      return { ok: true, skipped: "deduped" };
    }
    dataWithEvent.stripe_event_id = dedupe.stripeEventId;
  } else if (dedupe.kind === "material_policy") {
    if (!userId) {
      return { ok: false, error: "user_id required for material_policy dedupe" };
    }
    const { data: prior } = await supabase
      .from("email_queue")
      .select("id")
      .eq("user_id", userId)
      .eq("email_type", "material_policy_change")
      .contains("email_data", { policy_version: dedupe.policyVersion })
      .limit(1)
      .maybeSingle();
    if (prior?.id) {
      return { ok: true, skipped: "deduped" };
    }
    dataWithEvent.policy_version = dedupe.policyVersion;
  }

  const { data: inserted, error: insErr } = await supabase
    .from("email_queue")
    .insert({
      user_id: userId,
      email_address: emailAddress.trim(),
      email_type: emailType,
      email_subject: subject,
      email_data: dataWithEvent as Json,
      status: "pending",
      retry_count: 0,
      body_html: html,
      body_text: text,
    })
    .select("id")
    .single();

  if (insErr || !inserted?.id) {
    const pgCode =
      insErr && typeof insErr === "object" && "code" in insErr
        ? String((insErr as { code?: string }).code)
        : "";
    if (pgCode === "23505" && dedupe.kind === "d1_activation_nudge") {
      return { ok: true, skipped: "deduped" };
    }
    console.error("queueTransactionalEmailSend insert:", insErr);
    return { ok: false, error: insErr?.message || "insert_failed" };
  }

  const queueId = inserted.id as string;

  try {
    const info = await sendMailWithRetry({
      from: getFromHeader(),
      to: emailAddress,
      subject,
      html,
      text,
    });

    const messageId =
      typeof info.messageId === "string" && info.messageId.length > 0
        ? info.messageId
        : `smtp-${queueId}`;

    const { error: updErr } = await supabase
      .from("email_queue")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        provider_message_id: messageId,
      })
      .eq("id", queueId);

    if (updErr) {
      console.error("queueTransactionalEmailSend update sent:", updErr);
    }

    return { ok: true, skipped: false, queueId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await supabase
      .from("email_queue")
      .update({
        status: "failed",
        error_message: msg.slice(0, 2000),
      })
      .eq("id", queueId);
    console.error("queueTransactionalEmailSend send failed:", msg);
    return { ok: false, error: msg };
  }
}
