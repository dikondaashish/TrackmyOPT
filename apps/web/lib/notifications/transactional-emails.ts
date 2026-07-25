/**
 * Transactional emails (billing, onboarding, refunds) — all sends go through
 * email_queue (pending → sent/failed), blocked_emails check, HTML + text, SMTP via sendMailWithRetry.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "@/types/supabase";
import { getSmtpFromHeader, sendMailWithRetry } from "./email-smtp";
import { EMAIL } from "./email-brand";
import {
  buildTransactionalEmail,
  emailBodySectionClose,
  emailBodySectionOpen,
  emailInfoCallout,
  emailPrimaryButton,
  emailTextLead,
  emailTextList,
  emailTextMuted,
  emailTextP,
  emailTextStrong,
  emailWarningNote,
  buildInternalAlertEmail,
} from "./email-layout";
import { COMPANY, LEGAL_CONTACT } from "@/lib/legal/legal-config";

export function getAppBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://www.trackmyopt.com").replace(/\/$/, "");
}

function getFromHeader(): string {
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(amountCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${currency}`;
  }
}

/** HTML + plain text for payment-failed dunning (shared by send + preview catalog). */
export function buildPaymentFailedEmailBodies(args: {
  firstName: string | null;
  planLabel: string;
  amountCents: number;
  currency: string;
  /** Prefer Stripe Customer Portal URL; falls back to /api/premium/portal GET. */
  updatePaymentUrl?: string;
}): { subject: string; html: string; text: string } {
  const base = getAppBaseUrl();
  const settingsUrl = `${base}/dashboard/settings?tab=subscription`;
  const updateUrl = args.updatePaymentUrl?.trim() || `${base}/api/premium/portal`;
  const greeting = args.firstName?.trim()
    ? `Hi ${escapeHtml(args.firstName.trim())},`
    : "Hi,";
  const amountStr = formatMoney(args.amountCents, args.currency);
  const safePlan = escapeHtml(args.planLabel);

  const html = buildTransactionalEmail({
    headerTitle: "Update your payment method",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting)}
${emailTextLead("Your subscription payment needs attention")}
${emailTextP(
  `We couldn&rsquo;t process the charge below. Stripe may retry automatically, but updating your card now helps you keep uninterrupted Premium access.`
)}
${emailInfoCallout(`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">
  <tr>
    <td style="padding:0 0 10px 0;border-bottom:1px solid ${EMAIL.infoBorder};">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Plan</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:16px;font-weight:600;color:${EMAIL.infoText} !important;">${safePlan}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0 0 0;">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Amount</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:16px;font-weight:600;color:${EMAIL.infoText} !important;">${escapeHtml(amountStr)}</p>
    </td>
  </tr>
</table>
`)}
${emailTextLead("What to do")}
${emailTextList([
  "Open the secure Stripe billing portal with the button below",
  "Update your card or payment method and save",
  `Or go to <a href="${settingsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">Settings &rarr; Subscription</a> anytime`,
])}
${emailPrimaryButton(updateUrl, "Update payment method")}
${emailTextMuted(
  `Questions? Contact <a href="mailto:${LEGAL_CONTACT.support}" class="tmo-force-link" style="color:${EMAIL.link} !important;">${LEGAL_CONTACT.support}</a>`
)}
${emailBodySectionClose()}`,
  });

  const greetingText = args.firstName?.trim() ? `Hi ${args.firstName.trim()},` : "Hi,";
  const text = `${greetingText}

Your subscription payment needs attention.

We couldn't process your latest charge:
Plan: ${args.planLabel}
Amount: ${amountStr}

Stripe may retry automatically. To keep Premium access without interruption, update your payment method:

Update payment method: ${updateUrl}
Settings → Subscription: ${settingsUrl}

Questions? ${LEGAL_CONTACT.support}

© ${new Date().getFullYear()} ${COMPANY.legalName}`;

  return {
    subject: "TrackMyOPT: Payment failed — update your card",
    html,
    text,
  };
}

export async function sendPaymentFailedEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  planLabel: string;
  amountCents: number;
  currency: string;
  stripeEventId: string;
  stripeInvoiceId?: string | null;
  updatePaymentUrl?: string;
}): Promise<QueueTransactionalResult> {
  const {
    supabase,
    userId,
    toEmail,
    firstName,
    planLabel,
    amountCents,
    currency,
    stripeEventId,
    stripeInvoiceId,
    updatePaymentUrl,
  } = args;

  const { subject, html, text } = buildPaymentFailedEmailBodies({
    firstName,
    planLabel,
    amountCents,
    currency,
    updatePaymentUrl,
  });

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "payment_failed",
    subject,
    html,
    text,
    emailData: {
      plan_label: planLabel,
      amount_cents: amountCents,
      currency,
    },
    dedupe: {
      kind: "payment_failed",
      stripeEventId,
      stripeInvoiceId: stripeInvoiceId ?? null,
    },
  });
}

/** HTML + plain text when Premium / Pro subscription ends (shared by send + preview catalog). */
export function buildSubscriptionEndedEmailBodies(args: {
  firstName: string | null;
  accessEndedDate: string;
}): { subject: string; html: string; text: string } {
  const base = getAppBaseUrl();
  const checkoutUrl = `${base}/premium/checkout?planId=pro&interval=year`;
  const dashUrl = `${base}/dashboard`;
  const settingsUrl = `${base}/dashboard/settings`;
  const caseStatusUrl = `${base}/dashboard/case-status`;
  const greeting = args.firstName?.trim()
    ? `Hi ${escapeHtml(args.firstName.trim())},`
    : "Hi,";
  const safeEndDate = escapeHtml(args.accessEndedDate);

  const html = buildTransactionalEmail({
    headerTitle: "Your Pro access has ended",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting)}
${emailTextLead("Pro now auto-checks your case daily &mdash; reopen alerts")}
${emailTextP(
  `Your paid subscription ended on ${emailTextStrong(safeEndDate)}. You&rsquo;re on Free now: manual case refresh still works, but daily USCIS auto-checks and status-change emails are paused.`
)}
${emailInfoCallout(`
<p class="tmo-force-info-text" style="margin:0;color:${EMAIL.infoText} !important;font-size:14px;line-height:1.55;">
  Resubscribe to Pro and we&rsquo;ll auto-check USCIS every day and email you the moment your case status changes.
</p>
`)}
${emailTextLead("What you still have on Free")}
${emailTextList([
  "OPT &amp; STEM timeline calculators and unemployment trackers",
  "Manual USCIS case status checks and core dashboard access",
  `<strong>AI Resume Generator</strong> &mdash; ${emailTextStrong("5 AI-built resumes per month")}`,
  "Chrome extension and saved account data",
], { ordered: false })}
${emailPrimaryButton(checkoutUrl, "Reopen daily USCIS alerts")}
${emailTextMuted(
  `No further charges unless you resubscribe. <a href="${caseStatusUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Case Status</a> &middot; <a href="${dashUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Dashboard</a> &middot; <a href="${settingsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Billing settings</a>`
)}
${emailTextMuted(
  `Questions? Contact <a href="mailto:${LEGAL_CONTACT.support}" class="tmo-force-link" style="color:${EMAIL.link} !important;">${LEGAL_CONTACT.support}</a>`
)}
${emailBodySectionClose()}`,
  });

  const greetingText = args.firstName?.trim() ? `Hi ${args.firstName.trim()},` : "Hi,";
  const text = `${greetingText}

Pro now auto-checks your case daily — reopen alerts.

Your paid subscription ended on ${args.accessEndedDate}. You're on Free: manual refresh still works, but daily auto-checks and status-change emails are paused.

Reopen daily USCIS alerts: ${checkoutUrl}

What you still have on Free:
- OPT & STEM calculators and unemployment trackers
- Manual USCIS case checks
- AI Resume Generator — 5/month
- Chrome extension and saved data

Dashboard: ${dashUrl}
Billing settings: ${settingsUrl}

Questions? ${LEGAL_CONTACT.support}

— ${COMPANY.productName} Team`;

  return {
    subject: "Pro now auto-checks your case daily — reopen alerts",
    html,
    text,
  };
}

/** Targeted win-back when Stripe cancel feedback is "unused". */
export function buildUnusedCancelWinbackEmailBodies(args: {
  firstName: string | null;
}): { subject: string; html: string; text: string } {
  const checkoutUrl = `${getAppBaseUrl()}/premium/checkout?planId=pro&interval=year`;
  const caseStatusUrl = `${getAppBaseUrl()}/dashboard/case-status`;
  const greeting = args.firstName?.trim()
    ? `Hi ${escapeHtml(args.firstName.trim())},`
    : "Hi,";
  const greetingText = args.firstName?.trim() ? `Hi ${args.firstName.trim()},` : "Hi,";

  const html = buildTransactionalEmail({
    headerTitle: "Your case still needs daily monitoring",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting)}
${emailTextLead("Pro now auto-checks your case daily &mdash; reopen alerts")}
${emailTextP(
  "You canceled because Pro wasn&rsquo;t getting used. That&rsquo;s fair &mdash; and it&rsquo;s fixed: Pro runs daily USCIS auto-checks and emails you when status changes, so you don&rsquo;t have to remember to refresh."
)}
${emailTextList(
  [
    "Automatic daily USCIS case checks",
    "Instant email when your status changes",
    "OPT/STEM reminders and document vault",
  ],
  { ordered: false }
)}
${emailPrimaryButton(checkoutUrl, "Restart Pro with daily auto-checks")}
${emailTextMuted(
  `Prefer Free for now? Keep using <a href="${caseStatusUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">manual Case Status</a> anytime.`
)}
${emailBodySectionClose()}`,
  });

  const text = `${greetingText}

Pro now auto-checks your case daily — reopen alerts.

You canceled because Pro wasn't getting used. Pro now runs daily USCIS auto-checks and emails you when status changes.

Restart Pro: ${checkoutUrl}
Manual Case Status (Free): ${caseStatusUrl}

— ${COMPANY.productName} Team`;

  return {
    subject: "Pro now auto-checks your case daily — reopen alerts",
    html,
    text,
  };
}

export async function sendSubscriptionEndedEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  accessEndedDate: string;
  stripeEventId: string;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName, accessEndedDate, stripeEventId } = args;

  const { subject, html, text } = buildSubscriptionEndedEmailBodies({
    firstName,
    accessEndedDate,
  });

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "subscription_ended",
    subject,
    html,
    text,
    emailData: { access_ended_date: accessEndedDate },
    dedupe: { kind: "stripe_event_alltime", stripeEventId },
  });
}

export async function sendUnusedCancelWinbackEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  stripeEventId: string;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName, stripeEventId } = args;
  const { subject, html, text } = buildUnusedCancelWinbackEmailBodies({ firstName });

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "unused_cancel_winback",
    subject,
    html,
    text,
    emailData: { cancel_feedback: "unused" },
    dedupe: { kind: "stripe_event_alltime", stripeEventId: `${stripeEventId}:unused_winback` },
  });
}

function welcomeOnboardingStepHtml(num: number, title: string, description: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px 0;">
    <tr>
      <td width="40" valign="top" style="padding-top:2px;">
        <div class="tmo-force-badge" style="width:32px;height:32px;line-height:32px;text-align:center;background:${EMAIL.primary};color:${EMAIL.ctaText} !important;border-radius:50%;font-size:15px;font-weight:700;font-family:${EMAIL.fontStack};">${num}</div>
      </td>
      <td valign="top" style="padding-left:12px;">
        <p class="tmo-force-text" style="margin:0 0 4px 0;font-weight:600;color:${EMAIL.text} !important;font-size:15px;font-family:${EMAIL.fontStack};">${title}</p>
        <p class="tmo-force-muted" style="margin:0;color:${EMAIL.textMuted} !important;font-size:14px;line-height:1.55;font-family:${EMAIL.fontStack};">${description}</p>
      </td>
    </tr>
  </table>`;
}

/** HTML + text + subject for free welcome — used by retry cron when body columns were empty */
export function buildWelcomeFreeEmailBodies(firstName: string | null): {
  subject: string;
  html: string;
  text: string;
} {
  const base = getAppBaseUrl();
  const dashUrl = `${base}/dashboard`;
  const settingsUrl = `${base}/dashboard/settings`;
  const resumeUrl = `${base}/dashboard/career/resume-generator`;
  const caseStatusUrl = `${base}/dashboard/case-status`;
  const optToolsUrl = `${base}/dashboard/opt-tools/opt-apply`;
  const chromeExtensionUrl =
    "https://chromewebstore.google.com/detail/trackmyopt/hfljbefkccdmlnhclfojlafipjnjbajm";
  const pricingUrl = `${base}/premium/checkout`;
  const greeting = firstName?.trim() ? `Hi ${escapeHtml(firstName.trim())},` : "Hi,";
  const greetingText = firstName?.trim() ? `Hi ${firstName.trim()},` : "Hi,";

  const html = buildTransactionalEmail({
    headerTitle: "Welcome aboard",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("Your OPT &amp; STEM command center")}
${emailTextP(greeting)}
${emailTextP(
  `${escapeHtml(COMPANY.productName)} helps you stay on top of OPT &amp; STEM deadlines, unemployment days, USCIS case status, and your job search &mdash; including our ${emailTextStrong("AI Resume Generator")} for ATS-friendly resumes tailored to U.S. roles.`
)}
${emailInfoCallout(`
  <p class="tmo-force-info-text" style="margin:0 0 8px 0;color:${EMAIL.infoText} !important;font-size:14px;font-weight:600;">AI Resume Generator</p>
  <p class="tmo-force-light-text" style="margin:0 0 14px 0;color:${EMAIL.textSecondary} !important;font-size:14px;line-height:1.55;">
    Turn a rough draft or old CV into a polished, job-ready resume in minutes. Start free with ${emailTextStrong("5 AI generations per month")} &mdash; upgrade anytime for higher limits and unlimited ATS scans.
  </p>
  <p style="margin:0;text-align:center;">
    <a href="${resumeUrl}" class="tmo-force-cta" style="display:inline-block;background:${EMAIL.cta};color:${EMAIL.ctaText} !important;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Try AI Resume Generator</a>
  </p>
`)}
${emailInfoCallout(`
  <p class="tmo-force-info-text" style="margin:0 0 10px 0;color:${EMAIL.infoText} !important;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">Get started in 3 steps</p>
  ${welcomeOnboardingStepHtml(
    1,
    "Set your OPT / STEM key dates",
    "Add program start, end, and reporting dates so your timeline stays accurate."
  )}
  ${welcomeOnboardingStepHtml(
    2,
    "Add your notification email",
    "Choose where you want deadline and case-status reminders delivered."
  )}
  ${welcomeOnboardingStepHtml(
    3,
    "Turn on reminders in Settings",
    `Open <a href="${settingsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;text-decoration:none;">Settings</a> and enable the alerts that matter to you (Premium adds daily 9&nbsp;AM emails).`
  )}
`)}
${emailTextLead("Explore your toolkit")}
${emailTextList([
  `<a href="${optToolsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">OPT &amp; STEM calculators</a> &mdash; filing windows and unemployment day tracking`,
  `<a href="${caseStatusUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">Case Status Tracker</a> &mdash; check USCIS updates by receipt number`,
  `<a href="${resumeUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">AI Resume Generator</a> &mdash; ATS-friendly resumes for U.S. applications`,
  `<a href="${chromeExtensionUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">Chrome extension</a> &mdash; see deadlines on every new tab`,
], { ordered: false })}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="tmo-force-card" style="margin:0 0 20px 0;background:${EMAIL.bgCard};border:1px solid ${EMAIL.border};border-radius:8px;">
  <tr>
    <td style="width:50%;padding:12px 8px;text-align:center;vertical-align:top;border-bottom:1px solid ${EMAIL.border};border-right:1px solid ${EMAIL.border};">
      <p class="tmo-force-text" style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:${EMAIL.text} !important;">Deadlines</p>
      <p class="tmo-force-muted" style="margin:0;font-size:12px;color:${EMAIL.textMuted} !important;line-height:1.4;">OPT &amp; STEM clocks</p>
    </td>
    <td style="width:50%;padding:12px 8px;text-align:center;vertical-align:top;border-bottom:1px solid ${EMAIL.border};">
      <p class="tmo-force-text" style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:${EMAIL.text} !important;">Case status</p>
      <p class="tmo-force-muted" style="margin:0;font-size:12px;color:${EMAIL.textMuted} !important;line-height:1.4;">USCIS updates</p>
    </td>
  </tr>
  <tr>
    <td style="width:50%;padding:12px 8px;text-align:center;vertical-align:top;border-right:1px solid ${EMAIL.border};">
      <p class="tmo-force-text" style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:${EMAIL.text} !important;">Unemployment</p>
      <p class="tmo-force-muted" style="margin:0;font-size:12px;color:${EMAIL.textMuted} !important;line-height:1.4;">Day tracking</p>
    </td>
    <td style="width:50%;padding:12px 8px;text-align:center;vertical-align:top;">
      <p class="tmo-force-text" style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:${EMAIL.primary} !important;">AI Resume</p>
      <p class="tmo-force-muted" style="margin:0;font-size:12px;color:${EMAIL.textMuted} !important;line-height:1.4;">ATS-ready drafts</p>
    </td>
  </tr>
</table>
${emailPrimaryButton(dashUrl, "Go to dashboard")}
${emailTextMuted(
  `Need more? <a href="${pricingUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">See Premium</a> for daily reminders, auto USCIS checks, document vault, and higher AI resume limits.`
)}
${emailTextMuted(
  `Questions? <a href="mailto:${LEGAL_CONTACT.support}" class="tmo-force-link" style="color:${EMAIL.link} !important;text-decoration:none;">${LEGAL_CONTACT.support}</a>`,
)}
${emailBodySectionClose()}`,
  });

  const text = `${greetingText}

Welcome to ${COMPANY.productName} — your OPT & STEM command center.

${COMPANY.productName} helps you stay on top of OPT & STEM deadlines, unemployment days, USCIS case status, and your job search — including the AI Resume Generator for ATS-friendly U.S. resumes.

AI Resume Generator (try it free):
- Build job-ready resumes in minutes from a draft or existing CV
- Free plan: 5 AI generations per month
Try it: ${resumeUrl}

Get started in 3 steps:
1) Set your OPT / STEM key dates
2) Add your notification email for reminders
3) Enable reminders in Settings: ${settingsUrl}

Explore your toolkit:
- OPT & STEM calculators: ${optToolsUrl}
- Case Status Tracker: ${caseStatusUrl}
- AI Resume Generator: ${resumeUrl}
- Chrome extension: ${chromeExtensionUrl}

Open your dashboard: ${dashUrl}
See Premium: ${pricingUrl}

Questions? ${LEGAL_CONTACT.support}

— ${COMPANY.productName} Team
© ${new Date().getFullYear()} ${COMPANY.legalName}`;

  return {
    subject: "Welcome to TrackMyOPT — here’s how to get started",
    html,
    text,
  };
}

export async function sendFreeWelcomeEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName } = args;
  const { subject, html, text } = buildWelcomeFreeEmailBodies(firstName);

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "welcome_free",
    subject,
    html,
    text,
    emailData: {},
    dedupe: { kind: "welcome_free" },
  });
}

/** Re-send welcome_free for users whose original send failed (one-time campaign). */
export async function sendWelcomeFreeResendEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName } = args;
  const { subject, html, text } = buildWelcomeFreeEmailBodies(firstName);

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "welcome_free_resend",
    subject,
    html,
    text,
    emailData: { welcome_resend: true },
    dedupe: { kind: "welcome_free_resend" },
  });
}

/** HTML + text for abandoned checkout recovery — resume open session or fresh checkout. */
export function buildCheckoutRecoveryEmailBodies(
  firstName: string | null,
  options?: {
    checkoutUrl?: string;
    resumeKind?: "open_session" | "fresh_checkout";
  }
): {
  subject: string;
  html: string;
  text: string;
} {
  const checkoutUrl =
    options?.checkoutUrl?.trim() ||
    `${getAppBaseUrl()}/premium/checkout?planId=pro&interval=year`;
  const isOpenSession = options?.resumeKind === "open_session";
  const greeting = firstName?.trim() ? `Hi ${escapeHtml(firstName.trim())},` : "Hi,";
  const greetingText = firstName?.trim() ? `Hi ${firstName.trim()},` : "Hi,";
  const muted = isOpenSession
    ? "This link resumes your open Stripe checkout session."
    : "This link opens a fresh checkout &mdash; your previous session may have expired.";
  const mutedText = isOpenSession
    ? "This link resumes your open Stripe checkout session."
    : "This link opens a fresh checkout — your previous session may have expired.";

  const html = buildTransactionalEmail({
    headerTitle: "Finish your Pro setup",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("Daily USCIS alerts &mdash; one step left")}
${emailTextP(greeting)}
${emailTextP(
  "You started setting up daily USCIS alerts. Finish in one step and we&rsquo;ll email you the moment your case status changes."
)}
${emailTextList(
  [
    "Automatic daily USCIS case checks",
    "Instant email alerts when your status changes",
    "Full case history in your dashboard",
  ],
  { ordered: false }
)}
${emailPrimaryButton(checkoutUrl, "Finish checkout")}
${emailTextMuted(muted)}
${emailBodySectionClose()}`,
  });

  const text = `${greetingText}

You started setting up daily USCIS alerts. Finish in one step.

- Automatic daily USCIS case checks
- Instant email alerts when your status changes
- Full case history in your dashboard

Finish checkout: ${checkoutUrl}

${mutedText}

— ${COMPANY.productName} Team`;

  return {
    subject: "Finish setting up your daily USCIS alerts",
    html,
    text,
  };
}

export async function sendCheckoutRecoveryEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  checkoutUrl?: string;
  resumeKind?: "open_session" | "fresh_checkout";
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName, checkoutUrl, resumeKind } = args;
  const { subject, html, text } = buildCheckoutRecoveryEmailBodies(firstName, {
    checkoutUrl,
    resumeKind,
  });

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "checkout_recovery",
    subject,
    html,
    text,
    emailData: {
      recovery_email_sent: true,
      resume_kind: resumeKind ?? "fresh_checkout",
      checkout_url: checkoutUrl ?? null,
    },
    dedupe: { kind: "checkout_recovery" },
  });
}

/** HTML + text for free users with a saved receipt — Pro trial / auto-check upsell. */
export function buildFreeReceiptReengagementEmailBodies(firstName: string | null): {
  subject: string;
  html: string;
  text: string;
} {
  const trialUrl = `${getAppBaseUrl()}/premium/checkout?planId=pro&interval=year`;
  const caseStatusUrl = `${getAppBaseUrl()}/dashboard/case-status`;
  const greeting = firstName?.trim() ? `Hi ${escapeHtml(firstName.trim())},` : "Hi,";
  const greetingText = firstName?.trim() ? `Hi ${firstName.trim()},` : "Hi,";

  const html = buildTransactionalEmail({
    headerTitle: "Your case is on our radar",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("Next: refresh once, then try Pro daily auto-checks")}
${emailTextP(greeting)}
${emailTextP(
  "You already saved a receipt. On Free, open Case Status and refresh anytime. Pro adds daily USCIS auto-checks and emails you when status changes &mdash; start with a 7-day free trial."
)}
${emailTextList(
  [
    "Open Case Status and run a manual refresh (Free)",
    "Start a 7-day Pro trial for daily auto-checks",
    "Get email when your USCIS status changes",
  ],
  { ordered: true }
)}
${emailPrimaryButton(trialUrl, "Start 7-Day Free Trial")}
${emailTextMuted(
  `<a href="${caseStatusUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">View your case status</a> and refresh anytime on Free.`
)}
${emailBodySectionClose()}`,
  });

  const text = `${greetingText}

You already saved a receipt. On Free, open Case Status and refresh anytime. Pro adds daily USCIS auto-checks and emails you when status changes — start with a 7-day free trial.

1. Open Case Status and run a manual refresh (Free)
2. Start a 7-day Pro trial for daily auto-checks
3. Get email when your USCIS status changes

Start 7-Day Free Trial: ${trialUrl}
View your case status: ${caseStatusUrl}

— ${COMPANY.productName} Team`;

  return {
    subject: "Try Pro: daily USCIS auto-checks + status-change emails",
    html,
    text,
  };
}

export async function sendFreeReceiptReengagementEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName } = args;
  const { subject, html, text } = buildFreeReceiptReengagementEmailBodies(firstName);

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "free_receipt_reengagement",
    subject,
    html,
    text,
    emailData: { reengagement_email_sent: true },
    dedupe: { kind: "free_receipt_reengagement" },
  });
}

/** HTML + plain text for at-risk users (signed up recently, inactive 14d+). */
export function buildAtRiskReengagementEmailBodies(firstName: string | null): {
  subject: string;
  html: string;
  text: string;
} {
  const dashboardUrl = `${getAppBaseUrl()}/dashboard`;
  const caseStatusUrl = `${getAppBaseUrl()}/dashboard/case-status`;
  const greeting = firstName?.trim() ? `Hi ${escapeHtml(firstName.trim())},` : "Hi,";
  const greetingText = firstName?.trim() ? `Hi ${firstName.trim()},` : "Hi,";

  const html = buildTransactionalEmail({
    headerTitle: "Your OPT dashboard is waiting",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("Pick up where you left off")}
${emailTextP(greeting)}
${emailTextP(
  "It&rsquo;s been a little while since your last visit. Your TrackMyOPT account is still active &mdash; here&rsquo;s a quick way to get value in under a minute."
)}
${emailTextList(
  [
    "Check your USCIS case status (free)",
    "Review OPT countdowns and unemployment days",
    "Finish onboarding if you skipped the receipt step",
  ],
  { ordered: false }
)}
${emailPrimaryButton(caseStatusUrl, "Check case status")}
${emailTextMuted(`You can also open your dashboard anytime: ${escapeHtml(dashboardUrl)}`)}
${emailBodySectionClose()}
`,
  });

  const text = [
    greetingText,
    "",
    "It's been a little while since your last visit. Your TrackMyOPT account is still active.",
    "",
    "- Check your USCIS case status (free)",
    "- Review OPT countdowns and unemployment days",
    "- Finish onboarding if you skipped the receipt step",
    "",
    `Check case status: ${caseStatusUrl}`,
    `Dashboard: ${dashboardUrl}`,
  ].join("\n");

  return {
    subject: "Your OPT tools are still here when you need them",
    html,
    text,
  };
}

export async function sendAtRiskReengagementEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName } = args;
  const { subject, html, text } = buildAtRiskReengagementEmailBodies(firstName);

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "at_risk_reengagement",
    subject,
    html,
    text,
    emailData: { at_risk_reengagement_sent: true },
    dedupe: { kind: "at_risk_reengagement" },
  });
}

export function buildD1ActivationNudgeEmailBodies(args: {
  firstName: string | null;
  hasCaseStatus: boolean;
  caseStatusText: string | null;
  optHeadline: string | null;
}): { subject: string; html: string; text: string } {
  const caseStatusUrl = `${getAppBaseUrl()}/dashboard/case-status`;
  const greeting = args.firstName?.trim()
    ? `Hi ${escapeHtml(args.firstName.trim())},`
    : "Hi,";
  const greetingText = args.firstName?.trim()
    ? `Hi ${args.firstName.trim()},`
    : "Hi,";

  const headline = args.hasCaseStatus && args.caseStatusText
    ? `Your USCIS status: ${escapeHtml(args.caseStatusText.slice(0, 120))}`
    : args.optHeadline
      ? escapeHtml(args.optHeadline)
      : "Add your USCIS receipt to activate tracking";

  const lead = args.hasCaseStatus
    ? "Open Case Status to refresh anytime on Free — or start a 7-day Pro trial for daily auto-checks and email alerts."
    : args.optHeadline
      ? "Next: add your I-765 receipt number so we can track your case. Free includes manual refresh; Pro adds daily auto-checks."
      : "Your next step: open Case Status, add your receipt number, and run your first check. Then try Pro for daily auto-checks.";

  const subject = args.hasCaseStatus
    ? "Refresh your case — or try Pro daily auto-checks"
    : args.optHeadline
      ? "Add your USCIS receipt to finish activation"
      : "Add your USCIS receipt — activate TrackMyOPT in 2 minutes";

  const ctaLabel = args.hasCaseStatus
    ? "Open Case Status"
    : "Add your receipt";

  const html = buildTransactionalEmail({
    headerTitle: "Activate your case tracker",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting)}
${emailTextLead(headline)}
${emailTextP(lead)}
${emailTextList(
  [
    "Add your receipt number (Free)",
    "Run a manual status check (Free)",
    "Start a 7-day Pro trial for daily auto-checks + alerts",
  ],
  { ordered: true }
)}
${emailPrimaryButton(caseStatusUrl, ctaLabel)}
${emailTextMuted("Signed up yesterday? Open Case Status to activate tracking — add your receipt, run a check, then try Pro.")}
${emailBodySectionClose()}
`,
  });

  const text = [
    greetingText,
    "",
    headline.replace(/<[^>]+>/g, ""),
    lead,
    "",
    "1. Add your receipt number (Free)",
    "2. Run a manual status check (Free)",
    "3. Start a 7-day Pro trial for daily auto-checks + alerts",
    "",
    `${ctaLabel}: ${caseStatusUrl}`,
  ].join("\n");

  return { subject, html, text };
}

export async function sendD1ActivationNudgeEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  hasCaseStatus: boolean;
  caseStatusText: string | null;
  optHeadline: string | null;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName, hasCaseStatus, caseStatusText, optHeadline } =
    args;
  const { subject, html, text } = buildD1ActivationNudgeEmailBodies({
    firstName,
    hasCaseStatus,
    caseStatusText,
    optHeadline,
  });

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "d1_activation_nudge",
    subject,
    html,
    text,
    emailData: { d1_activation_nudge: true },
    dedupe: { kind: "d1_activation_nudge" },
  });
}

/** HTML + plain text for refund confirmation (shared by send + preview catalog). */
export function buildRefundProcessedEmailBodies(args: {
  firstName: string | null;
  amountCents: number;
  currency: string;
}): { subject: string; html: string; text: string } {
  const base = getAppBaseUrl();
  const dashUrl = `${base}/dashboard`;
  const settingsUrl = `${base}/dashboard/settings`;
  const resumeUrl = `${base}/dashboard/career/resume-generator`;
  const pricingUrl = `${base}/premium/checkout`;
  const greeting = args.firstName?.trim()
    ? `Hi ${escapeHtml(args.firstName.trim())},`
    : "Hi,";
  const amountStr = formatMoney(args.amountCents, args.currency);

  const html = buildTransactionalEmail({
    headerTitle: "Refund confirmation",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting)}
${emailTextLead("Your refund has been processed")}
${emailTextP(
  `This confirms we issued a refund to your original payment method and moved your account back to the ${emailTextStrong("Free")} plan. Your TrackMyOPT account stays active &mdash; nothing was deleted.`
)}
${emailInfoCallout(`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">
  <tr>
    <td style="padding:0 0 10px 0;border-bottom:1px solid ${EMAIL.infoBorder};">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Refund amount</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:18px;font-weight:700;color:${EMAIL.infoText} !important;">${escapeHtml(amountStr)}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid ${EMAIL.infoBorder};">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Status</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:16px;font-weight:600;color:${EMAIL.infoText} !important;">Processed</p>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0 0 0;">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Current plan</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:16px;font-weight:600;color:${EMAIL.infoText} !important;">Free</p>
    </td>
  </tr>
</table>
`)}
${emailTextLead("When to expect the credit")}
${emailTextP(
  `Most refunds appear on your statement within ${emailTextStrong("5&ndash;10 business days")}. Your bank or card issuer may take a few extra days to post the credit &mdash; the exact timing depends on their processing cycle.`
)}
${emailTextLead("What this means for your account")}
${emailTextList([
  `${emailTextStrong("Premium access has ended")} &mdash; daily reminders, auto USCIS checks, document vault, and other Pro-only tools are paused`,
  `${emailTextStrong("Your data is unchanged")} &mdash; OPT/STEM timelines, saved resumes, and profile settings remain in your account`,
  `<strong>AI Resume Generator</strong> is still available on Free (${emailTextStrong("5 AI-built resumes per month")})`,
  `${emailTextStrong("No further charges")} unless you choose to subscribe again`,
], { ordered: false })}
${emailPrimaryButton(dashUrl, "Go to dashboard")}
${emailTextMuted(
  `Changed your mind? You can resubscribe anytime from <a href="${pricingUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Premium checkout</a> or <a href="${settingsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Billing settings</a>.`
)}
${emailTextMuted(
  `While on Free, try the <a href="${resumeUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">AI Resume Generator</a> for your job search.`
)}
${emailTextMuted(
  `Questions about this refund? Contact <a href="mailto:${LEGAL_CONTACT.support}" class="tmo-force-link" style="color:${EMAIL.link} !important;">${LEGAL_CONTACT.support}</a> and include the email address on your TrackMyOPT account.`
)}
${emailBodySectionClose()}`,
  });

  const greetingText = args.firstName?.trim() ? `Hi ${args.firstName.trim()},` : "Hi,";
  const text = `${greetingText}

Your refund has been processed.

Refund amount: ${amountStr}
Status: Processed
Current plan: Free

This confirms we issued a refund to your original payment method. Your TrackMyOPT account stays active — your data was not deleted.

When to expect the credit:
Most refunds appear within 5-10 business days. Your bank may take a few extra days to post the credit.

What this means:
- Premium access has ended (Pro-only tools are paused)
- Your OPT/STEM timelines, saved resumes, and settings remain
- AI Resume Generator still available on Free (5/month)
- No further charges unless you resubscribe

Dashboard: ${dashUrl}
AI Resume Generator: ${resumeUrl}
Resubscribe: ${pricingUrl}
Billing settings: ${settingsUrl}

Questions? ${LEGAL_CONTACT.support}

© ${new Date().getFullYear()} ${COMPANY.legalName}`;

  return {
    subject: "TrackMyOPT: Refund confirmation",
    html,
    text,
  };
}

export async function sendRefundAcknowledgmentEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  amountCents: number;
  currency: string;
  stripeEventId: string;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName, amountCents, currency, stripeEventId } = args;

  const { subject, html, text } = buildRefundProcessedEmailBodies({
    firstName,
    amountCents,
    currency,
  });

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "refund_processed",
    subject,
    html,
    text,
    emailData: { amount_cents: amountCents, currency },
    dedupe: { kind: "stripe_event_alltime", stripeEventId },
  });
}

/** HTML + plain text for post-checkout Premium welcome (shared by send + preview catalog). */
export function buildPremiumWelcomeEmailBodies(firstName: string | null): {
  subject: string;
  html: string;
  text: string;
} {
  const base = getAppBaseUrl();
  const dashUrl = `${base}/dashboard`;
  const settingsUrl = `${base}/dashboard/settings`;
  const resumeUrl = `${base}/dashboard/career/resume-generator`;
  const caseStatusUrl = `${base}/dashboard/case-status`;
  const optToolsUrl = `${base}/dashboard/opt-tools/opt-apply`;
  const documentsUrl = `${base}/dashboard/documents`;
  const sponsorsUrl = `${base}/dashboard/career/h1b-sponsors`;
  const chromeExtensionUrl =
    "https://chromewebstore.google.com/detail/trackmyopt/hfljbefkccdmlnhclfojlafipjnjbajm";
  const name = firstName?.trim() || "there";
  const greeting = `Hi ${escapeHtml(name)},`;

  const html = buildTransactionalEmail({
    headerTitle: "Welcome to Premium",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("You&rsquo;re on Pro &mdash; here&rsquo;s what&rsquo;s unlocked")}
${emailTextP(greeting)}
${emailTextP(
  `Thank you for upgrading to ${emailTextStrong(`${COMPANY.productName} Premium`)}. You now have the full toolkit to stay OPT/STEM compliant, track USCIS cases automatically, and move your U.S. job search forward with confidence.`
)}
${emailInfoCallout(`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">
  <tr>
    <td style="padding:0 0 10px 0;border-bottom:1px solid ${EMAIL.infoBorder};">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Plan</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:16px;font-weight:600;color:${EMAIL.infoText} !important;">Premium (Pro)</p>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0 0 0;">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Status</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:16px;font-weight:600;color:${EMAIL.infoText} !important;">Active</p>
    </td>
  </tr>
</table>
`)}
${emailInfoCallout(`
  <p class="tmo-force-info-text" style="margin:0 0 10px 0;color:${EMAIL.infoText} !important;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">Get the most from Premium in 3 steps</p>
  ${welcomeOnboardingStepHtml(
    1,
    "Turn on daily reminders",
    `In <a href="${settingsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">Settings &rarr; Notifications</a>, confirm your email and enable daily 9&nbsp;AM ET deadline reminders.`
  )}
  ${welcomeOnboardingStepHtml(
    2,
    "Track your USCIS case automatically",
    `Add your receipt number in <a href="${caseStatusUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">Case Status Tracker</a> for daily auto-checks and instant change alerts.`
  )}
  ${welcomeOnboardingStepHtml(
    3,
    "Polish your resume with AI",
    `Open the <a href="${resumeUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">AI Resume Generator</a> &mdash; ${emailTextStrong("500 AI-built resumes/month")} plus unlimited ATS scans on Pro.`
  )}
`)}
${emailTextLead("Immigration &amp; automation")}
${emailTextList([
  "Daily 9&nbsp;AM email reminders for OPT/STEM tools",
  "Daily USCIS auto-checks and status-change email alerts",
  "Document Vault with expiry reminders for passports, EADs, and more",
], { ordered: false })}
${emailTextLead("Career &amp; job search")}
${emailTextList([
  `<strong>AI Resume Generator</strong> &mdash; ${emailTextStrong("500 generations/month")} and ${emailTextStrong("unlimited ATS resume scans")}`,
  "Unlimited job application tracker and analytics",
  "Unlimited H-1B sponsor search with approval-rate insights",
  "Chrome extension for H-1B sponsor intel while you browse",
], { ordered: false })}
${emailTextLead("Quick links")}
${emailTextList([
  `<a href="${optToolsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">OPT &amp; STEM calculators</a>`,
  `<a href="${caseStatusUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">Case Status Tracker</a>`,
  `<a href="${resumeUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">AI Resume Generator</a>`,
  `<a href="${documentsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">Document Vault</a>`,
  `<a href="${sponsorsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">H-1B sponsor search</a>`,
  `<a href="${chromeExtensionUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">Chrome extension</a>`,
], { ordered: false })}
${emailPrimaryButton(dashUrl, "Open your dashboard")}
${emailTextMuted(
  `Manage billing anytime in <a href="${settingsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Settings &rarr; Subscription</a>.`
)}
${emailTextP("We&rsquo;re glad to be part of your journey in the U.S.")}
${emailTextMuted(
  `Questions? <a href="mailto:${LEGAL_CONTACT.support}" class="tmo-force-link" style="color:${EMAIL.link} !important;">${LEGAL_CONTACT.support}</a>`
)}
${emailBodySectionClose()}`,
  });

  const greetingText = firstName?.trim() ? `Hi ${firstName.trim()},` : "Hi there,";
  const text = `${greetingText}

Thank you for upgrading to TrackMyOPT Premium (Pro). Your subscription is active.

Get the most from Premium in 3 steps:
1. Turn on daily 9 AM ET reminders: ${settingsUrl}
2. Add your USCIS case for auto-checks: ${caseStatusUrl}
3. Try AI Resume Generator (500/month + unlimited ATS scans): ${resumeUrl}

Immigration & automation:
- Daily email reminders for OPT/STEM tools
- Daily USCIS auto-checks and status alerts
- Document Vault with expiry reminders

Career & job search:
- AI Resume Generator: 500/month + unlimited ATS scans
- Unlimited job tracker
- Unlimited H-1B sponsor search with analytics
- Chrome extension for H-1B sponsor intel

Quick links:
- OPT & STEM: ${optToolsUrl}
- Case status: ${caseStatusUrl}
- Documents: ${documentsUrl}
- Sponsors: ${sponsorsUrl}
- Chrome extension: ${chromeExtensionUrl}

Dashboard: ${dashUrl}
Billing: ${settingsUrl}

We're glad to be part of your journey in the U.S.

Questions? ${LEGAL_CONTACT.support}

© ${new Date().getFullYear()} ${COMPANY.legalName}`;

  return {
    subject: "Welcome to TrackMyOPT Pro!",
    html,
    text,
  };
}

/** @deprecated Use buildPremiumWelcomeEmailBodies().html */
export function buildPremiumWelcomeEmailHtml(firstName: string): string {
  return buildPremiumWelcomeEmailBodies(firstName).html;
}

/**
 * Premium welcome after checkout — email_queue + dedupe once per user (premium_welcome).
 */
export async function sendPremiumWelcomeQueuedEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName } = args;
  const { subject, html, text } = buildPremiumWelcomeEmailBodies(firstName);

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "premium_welcome",
    subject,
    html,
    text,
    emailData: {},
    dedupe: { kind: "premium_welcome" },
  });
}

/**
 * Trial ending soon (Stripe customer.subscription.trial_will_end).
 */
/** HTML + plain text when Stripe trial is ending soon (shared by send + preview catalog). */
export function buildTrialEndingEmailBodies(args: {
  firstName: string | null;
  trialEndDate: string;
}): { subject: string; html: string; text: string } {
  const base = getAppBaseUrl();
  const settingsUrl = `${base}/dashboard/settings`;
  const dashUrl = `${base}/dashboard`;
  const resumeUrl = `${base}/dashboard/career/resume-generator`;
  const greeting = args.firstName?.trim()
    ? `Hi ${escapeHtml(args.firstName.trim())},`
    : "Hi,";
  const safeEndDate = escapeHtml(args.trialEndDate);

  const html = buildTransactionalEmail({
    headerTitle: "Your trial is ending soon",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting)}
${emailTextLead("Your Premium trial is almost over")}
${emailTextP(
  `This is a friendly heads-up: your ${emailTextStrong(`${COMPANY.productName} Premium`)} trial ends on ${emailTextStrong(safeEndDate)}. If you keep your subscription, you&rsquo;ll stay on Pro with full access. If you don&rsquo;t want to continue, cancel before that date to avoid being charged.`
)}
${emailInfoCallout(`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">
  <tr>
    <td style="padding:0 0 10px 0;border-bottom:1px solid ${EMAIL.infoBorder};">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Trial ends</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:16px;font-weight:600;color:${EMAIL.infoText} !important;">${safeEndDate}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0 0 0;">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">After the trial</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:15px;font-weight:600;color:${EMAIL.infoText} !important;">Pro continues at your checkout price unless you cancel</p>
    </td>
  </tr>
</table>
`)}
${emailTextLead("If you want to keep Premium")}
${emailTextList([
  "Confirm your payment method is up to date in billing settings",
  "Keep daily USCIS alerts, reminders, and Document Vault active",
  `Use your <a href="${resumeUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">AI Resume Generator</a> (${emailTextStrong("500 resumes/month")} on Pro) while you search`,
], { ordered: true })}
${emailTextLead("If you want to cancel")}
${emailTextList([
  `Open <a href="${settingsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">Settings &rarr; Subscription</a>`,
  "Select <strong>Manage billing</strong> to open the Stripe Customer Portal",
  `Cancel before ${safeEndDate} to avoid the first paid charge`,
], { ordered: true })}
${emailWarningNote(
  `If you do nothing, your subscription will renew automatically after the trial at the price shown when you signed up. You can cancel anytime before ${safeEndDate}.`
)}
${emailPrimaryButton(settingsUrl, "Manage billing")}
${emailTextMuted(
  `Continue using Premium features in <a href="${dashUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">your dashboard</a> until the trial ends.`
)}
${emailTextMuted(
  `Questions? Contact <a href="mailto:${LEGAL_CONTACT.support}" class="tmo-force-link" style="color:${EMAIL.link} !important;">${LEGAL_CONTACT.support}</a>`
)}
${emailBodySectionClose()}`,
  });

  const greetingText = args.firstName?.trim() ? `Hi ${args.firstName.trim()},` : "Hi,";
  const text = `${greetingText}

Your Premium trial is almost over.

Trial ends: ${args.trialEndDate}
After the trial: Pro continues at your checkout price unless you cancel.

If you want to keep Premium:
1. Confirm your payment method in billing settings
2. Keep daily USCIS alerts, reminders, and Document Vault
3. Use AI Resume Generator (500/month on Pro): ${resumeUrl}

If you want to cancel:
1. Settings → Subscription: ${settingsUrl}
2. Manage billing (Stripe Customer Portal)
3. Cancel before ${args.trialEndDate} to avoid being charged

If you do nothing, your subscription renews automatically after the trial.

Dashboard: ${dashUrl}
Questions? ${LEGAL_CONTACT.support}

© ${new Date().getFullYear()} ${COMPANY.legalName}`;

  return {
    subject: "TrackMyOPT: Your Premium trial is ending soon",
    html,
    text,
  };
}

export async function sendTrialEndingEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  trialEndDate: string;
  stripeEventId: string;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName, trialEndDate, stripeEventId } = args;

  const { subject, html, text } = buildTrialEndingEmailBodies({
    firstName,
    trialEndDate,
  });

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "trial_ending",
    subject,
    html,
    text,
    emailData: { trial_end_date: trialEndDate },
    dedupe: { kind: "stripe_event_alltime", stripeEventId },
  });
}

/** HTML + plain text when 7-day Pro trial starts (shared by send + preview catalog). */
export function buildTrialStartedEmailBodies(args: {
  firstName: string | null;
  trialEndDate: string;
}): { subject: string; html: string; text: string } {
  const base = getAppBaseUrl();
  const settingsUrl = `${base}/dashboard/settings`;
  const dashUrl = `${base}/dashboard`;
  const resumeUrl = `${base}/dashboard/career/resume-generator`;
  const caseStatusUrl = `${base}/dashboard/case-status`;
  const greeting = args.firstName?.trim()
    ? `Hi ${escapeHtml(args.firstName.trim())},`
    : "Hi,";
  const safeEndDate = escapeHtml(args.trialEndDate);

  const html = buildTransactionalEmail({
    headerTitle: "Your 7-day Pro trial has started",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting)}
${emailTextLead("Welcome to your Pro trial")}
${emailTextP(
  `Your ${emailTextStrong("7-day Premium (Pro) trial")} is now active. You have full Pro access through ${emailTextStrong(safeEndDate)} &mdash; explore everything below while your trial is running.`
)}
${emailInfoCallout(`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">
  <tr>
    <td style="padding:0 0 10px 0;border-bottom:1px solid ${EMAIL.infoBorder};">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Trial length</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:16px;font-weight:600;color:${EMAIL.infoText} !important;">7 days</p>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid ${EMAIL.infoBorder};">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Trial ends</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:16px;font-weight:600;color:${EMAIL.infoText} !important;">${safeEndDate}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0 0 0;">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Current access</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:16px;font-weight:600;color:${EMAIL.infoText} !important;">Premium (Pro) &mdash; Active</p>
    </td>
  </tr>
</table>
`)}
${emailTextLead("What&rsquo;s included during your trial")}
${emailTextList([
  "Daily 9&nbsp;AM OPT/STEM email reminders and smart timeline tracking",
  "Daily USCIS auto-checks and instant case status alerts",
  `<strong>AI Resume Generator</strong> &mdash; ${emailTextStrong("500 resumes/month")} and ${emailTextStrong("unlimited ATS scans")}`,
  "Document Vault, unlimited job tracker, and unlimited H-1B sponsor search",
], { ordered: false })}
${emailInfoCallout(`
  <p class="tmo-force-info-text" style="margin:0 0 10px 0;color:${EMAIL.infoText} !important;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">Make the most of your trial</p>
  ${welcomeOnboardingStepHtml(
    1,
    "Enable daily reminders",
    `Confirm your notification email in <a href="${settingsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">Settings</a> so you don&rsquo;t miss deadlines.`
  )}
  ${welcomeOnboardingStepHtml(
    2,
    "Add your USCIS case",
    `Set up <a href="${caseStatusUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">Case Status Tracker</a> for automatic daily checks.`
  )}
  ${welcomeOnboardingStepHtml(
    3,
    "Try the AI Resume Generator",
    `Build an ATS-ready resume in minutes at <a href="${resumeUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">AI Resume Generator</a>.`
  )}
`)}
${emailTextLead("Billing during your trial")}
${emailTextList([
  `${emailTextStrong("You will not be charged")} if you cancel before ${safeEndDate}`,
  "After the trial, Pro continues at the price shown at checkout unless you cancel",
  "Update your card or cancel anytime in billing settings",
], { ordered: false })}
${emailPrimaryButton(dashUrl, "Open your dashboard")}
${emailTextMuted(
  `Manage or cancel: <a href="${settingsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Settings &rarr; Subscription</a> &rarr; Manage billing`
)}
${emailTextMuted(
  `Questions? <a href="mailto:${LEGAL_CONTACT.support}" class="tmo-force-link" style="color:${EMAIL.link} !important;">${LEGAL_CONTACT.support}</a>`
)}
${emailBodySectionClose()}`,
  });

  const greetingText = args.firstName?.trim() ? `Hi ${args.firstName.trim()},` : "Hi,";
  const text = `${greetingText}

Your 7-day Premium (Pro) trial has started.

Trial length: 7 days
Trial ends: ${args.trialEndDate}
Current access: Premium (Pro) — Active

What's included during your trial:
- Daily OPT/STEM email reminders and smart tracking
- Daily USCIS auto-checks and case status alerts
- AI Resume Generator: 500/month + unlimited ATS scans
- Document Vault, unlimited job tracker, H-1B sponsor search

Make the most of your trial:
1. Enable daily reminders: ${settingsUrl}
2. Add your USCIS case: ${caseStatusUrl}
3. Try AI Resume Generator: ${resumeUrl}

Billing:
- You will not be charged if you cancel before ${args.trialEndDate}
- After the trial, Pro renews at checkout price unless you cancel
- Manage billing: ${settingsUrl}

Dashboard: ${dashUrl}
Questions? ${LEGAL_CONTACT.support}

© ${new Date().getFullYear()} ${COMPANY.legalName}`;

  return {
    subject: "TrackMyOPT: Your 7-day Pro trial has started",
    html,
    text,
  };
}

/**
 * Pro trial started (checkout completed with trial).
 */
export async function sendTrialStartedEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  trialEndDate: string;
  stripeEventId: string;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName, trialEndDate, stripeEventId } = args;

  const { subject, html, text } = buildTrialStartedEmailBodies({
    firstName,
    trialEndDate,
  });

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "trial_started",
    subject,
    html,
    text,
    emailData: { trial_end_date: trialEndDate },
    dedupe: { kind: "stripe_event_alltime", stripeEventId },
  });
}

/**
 * Cancellation scheduled (cancel at period end) — not the same as subscription ended.
 */
export async function sendCancellationConfirmedEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  accessThroughDate: string;
  nextChargeDate: string | null;
  stripeEventId: string;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName, accessThroughDate, nextChargeDate, stripeEventId } = args;
  const base = getAppBaseUrl();
  const settingsUrl = `${base}/dashboard/settings`;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";
  const chargeLine = nextChargeDate
    ? emailWarningNote(
        `<strong>Note:</strong> A charge may still be scheduled on ${escapeHtml(nextChargeDate)} if you cancel during a trial or billing window. Check Stripe receipts in billing settings.`
      )
    : emailTextMuted(
        `No further renewal charges are scheduled after ${escapeHtml(accessThroughDate)}.`
      );

  const html = buildTransactionalEmail({
    headerTitle: "Cancellation confirmed",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting)}
${emailTextP(
  `Your subscription is set to cancel. You keep full access until ${emailTextStrong(escapeHtml(accessThroughDate))}.`
)}
${chargeLine}
${emailPrimaryButton(settingsUrl, "View billing")}
${emailBodySectionClose()}`,
  });

  const text = `Cancellation confirmed. Access through ${accessThroughDate}. Billing: ${settingsUrl}`;

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "subscription_cancel_confirmed",
    subject: "TrackMyOPT: Subscription cancellation confirmed",
    html,
    text,
    emailData: { access_through: accessThroughDate },
    dedupe: { kind: "stripe_event_alltime", stripeEventId },
  });
}

/**
 * Subscription receipt after first paid period or immediate Dedicated charge.
 */
export async function sendSubscriptionReceiptEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  planLabel: string;
  amountFormatted: string;
  billingInterval: string;
  periodEndDate: string;
  stripeEventId: string;
}): Promise<QueueTransactionalResult> {
  const {
    supabase,
    userId,
    toEmail,
    firstName,
    planLabel,
    amountFormatted,
    billingInterval,
    periodEndDate,
    stripeEventId,
  } = args;
  const base = getAppBaseUrl();
  const settingsUrl = `${base}/dashboard/settings`;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";

  const html = buildTransactionalEmail({
    headerTitle: "Subscription receipt",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting)}
${emailTextP(`<strong>Plan:</strong> ${escapeHtml(planLabel)}`)}
${emailTextP(`<strong>Amount:</strong> ${escapeHtml(amountFormatted)} (${escapeHtml(billingInterval)})`)}
${emailTextP(`<strong>Current period ends:</strong> ${escapeHtml(periodEndDate)}`)}
${emailTextMuted(
  "This is an auto-renewing subscription. Cancel before renewal in Settings &rarr; Billing."
)}
${emailPrimaryButton(settingsUrl, "Billing settings")}
${emailBodySectionClose()}`,
  });

  const text = `Receipt: ${planLabel} ${amountFormatted} (${billingInterval}). Period ends ${periodEndDate}. ${settingsUrl}`;

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "subscription_receipt",
    subject: "TrackMyOPT: Subscription receipt",
    html,
    text,
    emailData: { plan: planLabel, amount: amountFormatted },
    dedupe: { kind: "stripe_event_alltime", stripeEventId },
  });
}

/**
 * Material change to subscription/refund/billing terms (active subscribers).
 */
export async function sendMaterialPolicyChangeEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  effectiveDate: string;
  changeSummary: string;
  policyVersion: string;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName, effectiveDate, changeSummary, policyVersion } = args;
  const base = getAppBaseUrl();
  const termsUrl = `${base}/terms`;
  const refundUrl = `${base}/refund-policy`;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";

  const html = buildTransactionalEmail({
    headerTitle: "Billing policy update",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("Important update for subscribers")}
${emailTextP(greeting)}
${emailTextP(
  `We are updating subscription billing terms effective ${emailTextStrong(escapeHtml(effectiveDate))} (version ${escapeHtml(policyVersion)}).`
)}
${emailTextP(escapeHtml(changeSummary))}
${emailTextP(
  `<a href="${termsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Terms</a> &middot; <a href="${refundUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Refund Policy</a>`
)}
${emailTextMuted(
  "If you do not agree, cancel before the effective date in Settings &rarr; Billing to avoid future renewals."
)}
${emailBodySectionClose()}`,
  });

  const text = `Billing policy update effective ${effectiveDate}. ${changeSummary} ${termsUrl}`;

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "material_policy_change",
    subject: "TrackMyOPT: Important update to subscription terms",
    html,
    text,
    emailData: { effective_date: effectiveDate, policy_version: policyVersion },
    dedupe: { kind: "material_policy", policyVersion },
  });
}

/**
 * Auto-reply to the user after contact form submit (email_queue + blocked check).
 * `userId` may be null for anonymous visitors.
 */
export async function sendContactReceivedEmail(args: {
  supabase: SupabaseClient;
  userId: string | null;
  name: string;
  toEmail: string;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, name, toEmail } = args;
  const first = name.trim().split(/\s+/)[0] || "there";
  const greeting = `Hi ${escapeHtml(first)},`;
  const base = getAppBaseUrl();
  const dashUrl = `${base}/dashboard`;

  const html = buildTransactionalEmail({
    headerTitle: "We received your message",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("TrackMyOPT Support")}
${emailTextP(greeting)}
${emailTextP(
  `Thanks for reaching out. We&rsquo;ve received your message and will get back to you within ${emailTextStrong("24&ndash;48 hours")}.`
)}
${emailTextP(
  `In the meantime, check your <a href="${dashUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:600;">dashboard</a> for updates.`
)}
${emailTextMuted(`&mdash; ${COMPANY.productName} Team`)}
${emailBodySectionClose()}`,
  });

  const text = `Hi ${first},

Thanks for reaching out. We've received your message and will get back to you within 24-48 hours.

In the meantime, check your dashboard for any updates:
${dashUrl}

— TrackMyOPT Team

© ${new Date().getFullYear()} Zyene, Inc.`;

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "contact_received",
    subject: "We received your message — TrackMyOPT Support",
    html,
    text,
    emailData: { contact_name: name.trim() },
    dedupe: { kind: "none" },
  });
}

function getStemOptDashboardBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.trackmyopt.com"
  ).replace(/\/$/, "");
}

/**
 * STEM OPT extension filing window opened (90 days before current OPT EAD end).
 * Queues stem_opt_window_open, sends via SMTP, updates email_queue.
 */
export async function sendStemOptWindowEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  optEadEndDate: string;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName, optEadEndDate } = args;
  const dashUrl = `${getStemOptDashboardBaseUrl()}/dashboard`;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";

  let eadDisplay = optEadEndDate;
  try {
    const d = new Date(optEadEndDate + (optEadEndDate.includes("T") ? "" : "T12:00:00Z"));
    if (!Number.isNaN(d.getTime())) {
      eadDisplay = d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    }
  } catch {
    // keep raw string
  }

  const html = buildTransactionalEmail({
    headerTitle: "STEM OPT extension window",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("Your 90-day filing window is open")}
${emailTextP(greeting)}
${emailTextP(emailTextStrong("Your STEM OPT extension window is now open."))}
${emailTextP(
  `Your current OPT EAD expires on ${emailTextStrong(escapeHtml(eadDisplay))}. You are within the 90-day window to apply for a 24-month STEM OPT extension &mdash; act before your EAD expires.`
)}
${emailTextLead("Here&rsquo;s what to do right now:")}
${emailTextList(
  [
    "<strong>Talk to your DSO</strong> &mdash; request a STEM OPT recommendation in SEVIS before you file.",
    "<strong>Confirm E-Verify enrollment</strong> &mdash; your employer must participate in E-Verify.",
    "<strong>File Form I-765 with USCIS</strong> &mdash; file before your EAD expires for cap-gap protection.",
    "<strong>Complete Form I-983</strong> &mdash; training plan with your employer (due within 10 days of starting).",
  ],
  { ordered: true }
)}
${emailTextP("Track your STEM OPT timeline in your dashboard.")}
${emailPrimaryButton(dashUrl, "Open my dashboard")}
${emailTextMuted(
  `Questions? Reply to this email or contact <a href="mailto:${LEGAL_CONTACT.support}" class="tmo-force-link" style="color:${EMAIL.link} !important;">${LEGAL_CONTACT.support}</a>`
)}
${emailBodySectionClose()}`,
  });

  const text = `${firstName ? `Hi ${firstName},` : "Hi,"}

Your STEM OPT extension window is now open.

Your current OPT EAD expires on ${eadDisplay}. You are now within the 90-day window to apply for a 24-month STEM OPT extension — but you must act before your EAD expires.

Here's what to do right now:

1. Talk to your DSO — request a STEM OPT recommendation in your school's system (SEVIS). This is required before you can file.

2. Confirm your employer is E-Verify enrolled — your employer must be actively participating in E-Verify. Check with your HR team.

3. File Form I-765 with USCIS — file before your current EAD expires. If filed on time, you get an automatic 180-day cap-gap extension.

4. Complete Form I-983 with your employer — training plan required for STEM OPT. Due within 10 days of starting.

Track your STEM OPT application timeline in your TrackMyOPT dashboard:
${dashUrl}

Questions? Reply to this email or contact support@trackmyopt.com

© ${new Date().getFullYear()} Zyene, Inc.`;

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "stem_opt_window_open",
    subject: "Your STEM OPT extension window is now open — here's what to do",
    html,
    text,
    emailData: { opt_ead_end_date: optEadEndDate },
    dedupe: { kind: "stem_opt_window" },
  });
}

function buildSupabaseContactSubmissionEditorUrl(submissionId: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let projectRef = "";
  try {
    projectRef = new URL(supabaseUrl).hostname.split(".")[0] || "";
  } catch {
    return "";
  }
  if (!projectRef) return "";
  return `https://supabase.com/dashboard/project/${projectRef}/editor/public.contact_submissions?filter=id%3Deq.${encodeURIComponent(submissionId)}`;
}

/**
 * Internal alert to support — direct SMTP (no email_queue), best-effort.
 */
export async function sendInternalContactFormNotification(args: {
  submissionId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAtIso: string;
  userId: string | null;
}): Promise<void> {
  try {
    const rowLink = buildSupabaseContactSubmissionEditorUrl(args.submissionId);
    const to = "support@trackmyopt.com";
    const subj = `New contact form submission from ${args.name.slice(0, 80)}`;
    const safeMsg = escapeHtml(args.message);
    const html = buildInternalAlertEmail(
      "New contact form",
      `
${emailTextP(`<strong>Submission ID:</strong> ${escapeHtml(args.submissionId)}`)}
${emailTextP(`<strong>Time (UTC):</strong> ${escapeHtml(args.createdAtIso)}`)}
${emailTextP(`<strong>User ID:</strong> ${args.userId ? escapeHtml(args.userId) : "(anonymous)"}`)}
<hr style="border:none;border-top:1px solid ${EMAIL.border};margin:16px 0"/>
${emailTextP(`<strong>Name:</strong> ${escapeHtml(args.name)}`)}
${emailTextP(`<strong>Email:</strong> ${escapeHtml(args.email)}`)}
${emailTextP(`<strong>Subject:</strong> ${escapeHtml(args.subject)}`)}
${emailTextLead("Message")}
<div class="tmo-force-surface" style="background:${EMAIL.borderLight};border-radius:8px;padding:16px;white-space:pre-wrap;word-break:break-word;color:${EMAIL.textSecondary} !important;font-size:15px;line-height:1.6;">${safeMsg}</div>
${rowLink ? emailTextP(`<a href="${escapeHtml(rowLink)}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Open row in Supabase Table Editor</a>`) : ""}
`
    );
    const text = [
      `New contact form submission`,
      `Submission ID: ${args.submissionId}`,
      `Time (UTC): ${args.createdAtIso}`,
      `User ID: ${args.userId ?? "(anonymous)"}`,
      ``,
      `Name: ${args.name}`,
      `Email: ${args.email}`,
      `Subject: ${args.subject}`,
      ``,
      `Message:`,
      args.message,
      rowLink ? `\n\nSupabase: ${rowLink}` : "",
    ].join("\n");

    await sendMailWithRetry({
      from: getFromHeader(),
      to,
      subject: subj,
      text,
      html,
    });
  } catch (e) {
    console.error("sendInternalContactFormNotification:", e);
  }
}

/** Resolve profile + login email for Stripe-driven emails */
export async function resolveUserForStripeCustomer(
  supabase: SupabaseClient,
  stripeCustomerId: string
): Promise<{ userId: string; email: string; firstName: string | null } | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, email, first_name")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Stripe customer profile lookup failed: ${profileError.message}`);
  }
  if (!profile?.user_id) return null;

  let email = profile.email?.trim() || "";
  const firstName = profile.first_name;

  if (!email) {
    const { data: userData, error } = await supabase.auth.admin.getUserById(profile.user_id);
    if (!error && userData?.user?.email) {
      email = userData.user.email;
    }
  }

  if (!email) return null;

  return { userId: profile.user_id, email, firstName };
}

/** Resolve profile + email for a Supabase user id (PaymentIntent metadata path). */
export async function resolveUserById(
  supabase: SupabaseClient,
  userId: string
): Promise<{ userId: string; email: string; firstName: string | null } | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, email, first_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Billing profile lookup failed: ${profileError.message}`);
  }
  if (!profile?.user_id) return null;

  let email = profile.email?.trim() || "";
  if (!email) {
    const { data: userData, error } = await supabase.auth.admin.getUserById(userId);
    if (!error && userData?.user?.email) {
      email = userData.user.email;
    }
  }

  if (!email) return null;

  return { userId: profile.user_id, email, firstName: profile.first_name };
}

/**
 * Internal alert to support for B2B Partnership Inquiries.
 */
export async function sendInternalPartnershipNotification(args: {
  submissionId: string;
  name: string;
  email: string;
  university: string;
  role: string;
  message: string;
  createdAtIso: string;
}): Promise<void> {
  try {
    const to = "support@trackmyopt.com";
    const subj = `New Partnership Inquiry from ${args.university.slice(0, 80)}`;
    const safeMsg = escapeHtml(args.message);
    const html = buildInternalAlertEmail(
      "Partnership inquiry",
      `
${emailTextP(`<strong>Submission ID:</strong> ${escapeHtml(args.submissionId)}`)}
${emailTextP(`<strong>Time (UTC):</strong> ${escapeHtml(args.createdAtIso)}`)}
<hr style="border:none;border-top:1px solid ${EMAIL.border};margin:16px 0"/>
${emailTextP(`<strong>Name:</strong> ${escapeHtml(args.name)}`)}
${emailTextP(`<strong>Email:</strong> ${escapeHtml(args.email)}`)}
${emailTextP(`<strong>University/Institution:</strong> ${escapeHtml(args.university)}`)}
${emailTextP(`<strong>Role:</strong> ${escapeHtml(args.role)}`)}
${emailTextLead("Message")}
<div class="tmo-force-surface" style="background:${EMAIL.borderLight};border-radius:8px;padding:16px;white-space:pre-wrap;word-break:break-word;color:${EMAIL.textSecondary} !important;font-size:15px;line-height:1.6;">${safeMsg}</div>
`
    );
    const text = [
      "New Partnership Inquiry",
      `Submission ID: ${args.submissionId}`,
      `Time (UTC): ${args.createdAtIso}`,
      "",
      `Name: ${args.name}`,
      `Email: ${args.email}`,
      `University: ${args.university}`,
      `Role: ${args.role}`,
      "",
      "Message:",
      args.message,
    ].join("\n");

    await sendMailWithRetry({
      from: getFromHeader(),
      to,
      subject: subj,
      text,
      html,
    });
  } catch (e) {
    console.error("sendInternalPartnershipNotification:", e);
  }
}

export type EmailPreviewItem = {
  id: string;
  category: string;
  subject: string;
  html: string;
};

/** Sample HTML for all queued transactional templates (preview / QA only). */
export function getTransactionalEmailPreviews(firstName = "Alex"): EmailPreviewItem[] {
  const base = getAppBaseUrl();
  const settingsUrl = `${base}/dashboard/settings`;
  const dashUrl = `${base}/dashboard`;
  const termsUrl = `${base}/terms`;
  const refundUrl = `${base}/refund-policy`;
  const greeting = `Hi ${escapeHtml(firstName)},`;
  const trialEnd = "June 15, 2026";
  const accessEnd = "May 31, 2026";

  const welcomeFree = buildWelcomeFreeEmailBodies(firstName);

  return [
    {
      id: "payment_failed",
      category: "Billing",
      ...buildPaymentFailedEmailBodies({
        firstName,
        planLabel: "TrackMyOPT Pro",
        amountCents: 1900,
        currency: "usd",
      }),
    },
    {
      id: "subscription_ended",
      category: "Billing",
      ...buildSubscriptionEndedEmailBodies({
        firstName,
        accessEndedDate: accessEnd,
      }),
    },
    {
      id: "welcome_free",
      category: "Onboarding",
      subject: welcomeFree.subject,
      html: welcomeFree.html,
    },
    {
      id: "refund_processed",
      category: "Billing",
      ...buildRefundProcessedEmailBodies({
        firstName,
        amountCents: 1900,
        currency: "usd",
      }),
    },
    {
      id: "premium_welcome",
      category: "Onboarding",
      ...buildPremiumWelcomeEmailBodies(firstName),
    },
    {
      id: "trial_ending",
      category: "Billing",
      ...buildTrialEndingEmailBodies({
        firstName,
        trialEndDate: trialEnd,
      }),
    },
    {
      id: "trial_started",
      category: "Billing",
      ...buildTrialStartedEmailBodies({
        firstName,
        trialEndDate: trialEnd,
      }),
    },
    {
      id: "subscription_cancel_confirmed",
      category: "Billing",
      subject: "TrackMyOPT: Subscription cancellation confirmed",
      html: buildTransactionalEmail({
        headerTitle: "Cancellation confirmed",
        bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting)}
${emailTextP(
  `Your subscription is set to cancel. You keep full access until ${emailTextStrong(accessEnd)}.`
)}
${emailPrimaryButton(settingsUrl, "View billing")}
${emailBodySectionClose()}`,
      }),
    },
    {
      id: "subscription_receipt",
      category: "Billing",
      subject: "TrackMyOPT: Subscription receipt",
      html: buildTransactionalEmail({
        headerTitle: "Subscription receipt",
        bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting)}
${emailTextP("<strong>Plan:</strong> TrackMyOPT Pro")}
${emailTextP("<strong>Amount:</strong> $19.00 (monthly)")}
${emailTextP(`<strong>Current period ends:</strong> ${accessEnd}`)}
${emailPrimaryButton(settingsUrl, "Billing settings")}
${emailBodySectionClose()}`,
      }),
    },
    {
      id: "material_policy_change",
      category: "Billing",
      subject: "TrackMyOPT: Important update to subscription terms",
      html: buildTransactionalEmail({
        headerTitle: "Billing policy update",
        bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("Important update for subscribers")}
${emailTextP(greeting)}
${emailTextP(
  `We are updating subscription billing terms effective ${emailTextStrong("July 1, 2026")} (version sample-preview).`
)}
${emailTextP("Sample summary: renewal and refund terms clarified.")}
${emailTextP(
  `<a href="${termsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Terms</a> &middot; <a href="${refundUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Refund Policy</a>`
)}
${emailBodySectionClose()}`,
      }),
    },
    {
      id: "contact_received",
      category: "Support",
      subject: "We received your message — TrackMyOPT Support",
      html: buildTransactionalEmail({
        headerTitle: "We received your message",
        bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("TrackMyOPT Support")}
${emailTextP(`Hi ${escapeHtml(firstName)},`)}
${emailTextP(
  `Thanks for reaching out. We&rsquo;ve received your message and will get back to you within ${emailTextStrong("24&ndash;48 hours")}.`
)}
${emailPrimaryButton(dashUrl, "Open dashboard")}
${emailBodySectionClose()}`,
      }),
    },
    {
      id: "stem_opt_window_open",
      category: "Cron",
      subject: "Your STEM OPT extension window is now open — here's what to do",
      html: buildTransactionalEmail({
        headerTitle: "STEM OPT extension window",
        bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("Your 90-day filing window is open")}
${emailTextP(greeting)}
${emailTextP(emailTextStrong("Your STEM OPT extension window is now open."))}
${emailTextP(
  `Your current OPT EAD expires on ${emailTextStrong("August 15, 2026")}. You are within the 90-day window to apply for a 24-month STEM OPT extension.`
)}
${emailPrimaryButton(dashUrl, "Open my dashboard")}
${emailBodySectionClose()}`,
      }),
    },
    {
      id: "internal_contact_form",
      category: "Internal (to support)",
      subject: `New contact form submission from ${firstName}`,
      html: buildInternalAlertEmail(
        "New contact form",
        `
${emailTextP("<strong>Submission ID:</strong> preview-0001")}
${emailTextP(`<strong>Name:</strong> ${escapeHtml(firstName)}`)}
${emailTextP("<strong>Email:</strong> student@example.com")}
${emailTextP("<strong>Subject:</strong> Preview sample")}
${emailTextLead("Message")}
<div class="tmo-force-surface" style="background:${EMAIL.borderLight};border-radius:8px;padding:16px;">Sample contact message for preview.</div>`
      ),
    },
    {
      id: "internal_partnership",
      category: "Internal (to support)",
      subject: "New Partnership Inquiry from Sample University",
      html: buildInternalAlertEmail(
        "Partnership inquiry",
        `
${emailTextP(`<strong>Name:</strong> ${escapeHtml(firstName)}`)}
${emailTextP("<strong>University:</strong> Sample University")}
${emailTextLead("Message")}
<div class="tmo-force-surface" style="background:${EMAIL.borderLight};border-radius:8px;padding:16px;">Sample partnership inquiry.</div>`
      ),
    },
  ];
}
