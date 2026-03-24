/**
 * Transactional emails (billing, onboarding, refunds) — all sends go through
 * email_queue (pending → sent/failed), blocked_emails check, HTML + text, SMTP via sendMailWithRetry.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "@/types/supabase";
import { sendMailWithRetry } from "./email-smtp";
import { EMAIL } from "./email-brand";

export function getAppBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://www.trackmyopt.com").replace(/\/$/, "");
}

function getFromHeader(): string {
  return getTransactionalEmailFromHeader();
}

/** From header for SMTP — exported for retry cron + tests */
export function getTransactionalEmailFromHeader(): string {
  return `${process.env.EMAIL_FROM_NAME || "TrackMyOPT"} <${process.env.SMTP_FROM_EMAIL || "no-reply@trackmyopt.com"}>`;
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

export type QueueTransactionalResult =
  | { ok: true; skipped: "blocked" | "deduped" }
  | { ok: true; skipped: false; queueId: string }
  | { ok: false; error: string };

type DedupeMode =
  | { kind: "payment_failed"; stripeEventId: string; stripeInvoiceId?: string | null }
  | { kind: "stripe_event_alltime"; stripeEventId: string }
  | { kind: "welcome_free" }
  | { kind: "premium_welcome" }
  | { kind: "stem_opt_window" }
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
  } else if (dedupe.kind === "stem_opt_window") {
    if (!userId) {
      return { ok: false, error: "user_id required for stem_opt_window" };
    }
    if (await shouldSkipStemOptWindowWithin60Days(supabase, userId)) {
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
  } = args;
  const base = getAppBaseUrl();
  const settingsUrl = `${base}/dashboard/settings`;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";
  const amountStr = formatMoney(amountCents, currency);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F3F4F6;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background:${EMAIL.headerGradientDanger};padding:28px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Payment didn’t go through</h1>
      </div>
      <div style="padding:28px 24px;color:#374151;font-size:15px;line-height:1.6;">
        <p style="margin:0 0 16px 0;">${greeting}</p>
        <p style="margin:0 0 16px 0;">We couldn’t charge your card for <strong>${escapeHtml(planLabel)}</strong> (${amountStr}). Stripe will automatically retry the payment. To avoid losing Premium access, please update your payment method.</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${settingsUrl}" style="display:inline-block;background:${EMAIL.cta};color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">Open billing settings</a>
        </div>
        <p style="margin:0;color:#6B7280;font-size:13px;">From Settings → Subscription, use <strong>Manage billing</strong> to open the Stripe Customer Portal and update your card.</p>
      </div>
      <div style="background:#F9FAFB;padding:20px;text-align:center;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280;">
        <p style="margin:0;">© ${new Date().getFullYear()} Zyene, Inc. All rights reserved.</p>
        <p style="margin:8px 0 0 0;"><a href="mailto:support@trackmyopt.com" style="color:#6B7280;">support@trackmyopt.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `${firstName ? `Hi ${firstName},` : "Hi,"}

We couldn't charge your card for ${planLabel} (${amountStr}). Stripe will retry automatically.

Update your payment method: ${settingsUrl}
(Settings → Subscription → Manage billing → Stripe Customer Portal)

© ${new Date().getFullYear()} Zyene, Inc.
support@trackmyopt.com`;

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "payment_failed",
    subject: "TrackMyOPT: Payment failed — update your card",
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

export async function sendSubscriptionEndedEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  accessEndedDate: string;
  stripeEventId: string;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName, accessEndedDate, stripeEventId } = args;
  const base = getAppBaseUrl();
  const checkoutUrl = `${base}/premium/checkout`;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F3F4F6;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background:${EMAIL.headerGradient};padding:28px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Your Premium access has ended</h1>
      </div>
      <div style="padding:28px 24px;color:#374151;font-size:15px;line-height:1.6;">
        <p style="margin:0 0 16px 0;">${greeting}</p>
        <p style="margin:0 0 16px 0;">Your subscription ended on <strong>${escapeHtml(accessEndedDate)}</strong>. You’re now on the free plan.</p>
        <p style="margin:0 0 12px 0;font-weight:600;color:#1F2937;">What’s locked now:</p>
        <ul style="margin:0 0 20px 0;padding-left:20px;color:#4B5563;">
          <li>Advanced Premium dashboards &amp; alerts</li>
          <li>Unlimited AI resume scans &amp; priority tools</li>
          <li>Premium-only tracker and analytics features</li>
        </ul>
        <div style="text-align:center;margin:28px 0;">
          <a href="${checkoutUrl}" style="display:inline-block;background:${EMAIL.cta};color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">Resubscribe to Premium</a>
        </div>
      </div>
      <div style="background:#F9FAFB;padding:20px;text-align:center;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280;">
        <p style="margin:0;">© ${new Date().getFullYear()} Zyene, Inc. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `${firstName ? `Hi ${firstName},` : "Hi,"}

Your subscription ended on ${accessEndedDate}. Premium features are no longer available.

Resubscribe: ${checkoutUrl}

© ${new Date().getFullYear()} Zyene, Inc.`;

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "subscription_ended",
    subject: "TrackMyOPT: Your Premium subscription has ended",
    html,
    text,
    emailData: { access_ended_date: accessEndedDate },
    dedupe: { kind: "stripe_event_alltime", stripeEventId },
  });
}

/** HTML + text + subject for free welcome — used by retry cron when body columns were empty */
export function buildWelcomeFreeEmailBodies(firstName: string | null): {
  subject: string;
  html: string;
  text: string;
} {
  const base = getAppBaseUrl();
  const dashUrl = `${base}/dashboard`;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F3F4F6;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background:${EMAIL.headerGradient};padding:28px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Welcome to TrackMyOPT</h1>
      </div>
      <div style="padding:28px 24px;color:#374151;font-size:15px;line-height:1.6;">
        <p style="margin:0 0 16px 0;">${greeting}</p>
        <p style="margin:0 0 16px 0;">TrackMyOPT helps you stay on top of OPT &amp; STEM deadlines, unemployment days, and case status — so you can focus on your career.</p>
        <p style="margin:0 0 12px 0;font-weight:600;color:#1F2937;">Get started in 3 steps:</p>
        <ol style="margin:0 0 24px 0;padding-left:20px;color:#4B5563;">
          <li style="margin-bottom:8px;">Set your OPT / STEM key dates</li>
          <li style="margin-bottom:8px;">Add your notification email for reminders</li>
          <li style="margin-bottom:8px;">Enable reminders in Settings</li>
        </ol>
        <div style="text-align:center;">
          <a href="${dashUrl}" style="display:inline-block;background:${EMAIL.cta};color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">Go to dashboard</a>
        </div>
      </div>
      <div style="background:#F9FAFB;padding:20px;text-align:center;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280;">
        <p style="margin:0;">© ${new Date().getFullYear()} Zyene, Inc. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `${firstName ? `Hi ${firstName},` : "Hi,"}

Welcome to TrackMyOPT — OPT & STEM deadlines, unemployment tracking, and case tools in one place.

Next steps:
1) Set your OPT / STEM dates
2) Add your notification email
3) Enable reminders in Settings

Open your dashboard: ${dashUrl}

© ${new Date().getFullYear()} Zyene, Inc.`;

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
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";
  const amountStr = formatMoney(amountCents, currency);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F3F4F6;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background:${EMAIL.headerGradientSuccess};padding:28px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Refund processed</h1>
      </div>
      <div style="padding:28px 24px;color:#374151;font-size:15px;line-height:1.6;">
        <p style="margin:0 0 16px 0;">${greeting}</p>
        <p style="margin:0 0 16px 0;">We’ve received your refund of <strong>${amountStr}</strong>. Your Premium access has ended.</p>
        <p style="margin:0 0 16px 0;">Refunds typically post to your original payment method in <strong>5–10 business days</strong> (your bank may take longer).</p>
        <p style="margin:0;color:#6B7280;font-size:14px;">Questions? Reply to this email or write to <a href="mailto:support@trackmyopt.com" style="color:${EMAIL.link};">support@trackmyopt.com</a>.</p>
      </div>
      <div style="background:#F9FAFB;padding:20px;text-align:center;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280;">
        <p style="margin:0;">© ${new Date().getFullYear()} Zyene, Inc. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `${firstName ? `Hi ${firstName},` : "Hi,"}

We've processed your refund of ${amountStr}. Premium access has ended.

Please allow 5-10 business days for the refund to appear on your statement.

support@trackmyopt.com`;

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "refund_processed",
    subject: "TrackMyOPT: Refund confirmation",
    html,
    text,
    emailData: { amount_cents: amountCents, currency },
    dedupe: { kind: "stripe_event_alltime", stripeEventId },
  });
}

function premiumWelcomeHtml(firstName: string): string {
  const year = new Date().getFullYear();
  const base = getAppBaseUrl();
  const dashUrl = `${base}/dashboard`;
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Premium</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F3F4F6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background:${EMAIL.headerGradient};padding:32px 24px;text-align:center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Premium! 🎉</h1>
          </div>
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 16px;">
              Hi ${escapeHtml(firstName)},
            </p>
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
              Thank you for upgrading to <strong>TrackMyOPT Premium</strong>! You&apos;ve unlocked powerful tools to help you secure and maintain your status.
            </p>
            <div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px 0; color: #1F2937; font-size: 16px;">🚀 Your new features:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #4B5563; font-size: 15px; line-height: 1.6;">
                <li>Unlimited AI Resume Scans</li>
                <li>Advanced Job Tracker &amp; Analytics</li>
                <li>Priority Alerts &amp; Reminders</li>
                <li>Exclusive Sponsor Data Access</li>
              </ul>
            </div>
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 32px;">
              We&apos;re excited to be part of your career journey in the US.
            </p>
            <div style="text-align: center;">
              <a href="${dashUrl}" style="display:inline-block;background:${EMAIL.cta};color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
                Go to Dashboard
              </a>
            </div>
          </div>
          <div style="background: #F9FAFB; padding: 24px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="font-size: 12px; color: #6B7280; margin: 0;">
              © ${year} Zyene, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
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
  const name = firstName?.trim() || "Student";
  const html = premiumWelcomeHtml(name);
  const base = getAppBaseUrl();
  const text = `Hi ${name},

Thank you for upgrading to TrackMyOPT Premium!

Open your dashboard: ${base}/dashboard

© ${new Date().getFullYear()} Zyene, Inc.`;

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "premium_welcome",
    subject: "Welcome to TrackMyOPT Premium! 🚀",
    html,
    text,
    emailData: {},
    dedupe: { kind: "premium_welcome" },
  });
}

/**
 * Trial ending soon (Stripe customer.subscription.trial_will_end).
 */
export async function sendTrialEndingEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  trialEndDate: string;
  stripeEventId: string;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName, trialEndDate, stripeEventId } = args;
  const base = getAppBaseUrl();
  const settingsUrl = `${base}/dashboard/settings`;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F3F4F6;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background:${EMAIL.headerGradient};padding:28px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Your trial is ending soon</h1>
      </div>
      <div style="padding:28px 24px;color:#374151;font-size:15px;line-height:1.6;">
        <p style="margin:0 0 16px 0;">${greeting}</p>
        <p style="margin:0 0 16px 0;">Your TrackMyOPT Premium trial ends on <strong>${escapeHtml(trialEndDate)}</strong>. After that, your subscription will continue per your plan unless you cancel.</p>
        <p style="margin:0 0 24px 0;color:#6B7280;font-size:14px;">Review billing or cancel anytime from Settings.</p>
        <div style="text-align:center;">
          <a href="${settingsUrl}" style="display:inline-block;background:${EMAIL.cta};color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">Open billing settings</a>
        </div>
      </div>
      <div style="background:#F9FAFB;padding:20px;text-align:center;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280;">
        <p style="margin:0;">© ${new Date().getFullYear()} Zyene, Inc. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `${firstName ? `Hi ${firstName},` : "Hi,"}

Your Premium trial ends on ${trialEndDate}. Manage billing: ${settingsUrl}

© ${new Date().getFullYear()} Zyene, Inc.`;

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "trial_ending",
    subject: "TrackMyOPT: Your Premium trial is ending soon",
    html,
    text,
    emailData: { trial_end_date: trialEndDate },
    dedupe: { kind: "stripe_event_alltime", stripeEventId },
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

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F3F4F6;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background:${EMAIL.headerGradient};padding:24px 24px;text-align:center;">
        <p style="margin:0;color:#fff;font-size:18px;font-weight:600;">TrackMyOPT Support</p>
      </div>
      <div style="padding:28px 24px;">
        <p style="margin:0 0 16px 0;color:#374151;font-size:15px;line-height:1.6;">${greeting}</p>
        <p style="margin:0 0 16px 0;color:#374151;font-size:15px;line-height:1.6;">Thanks for reaching out. We&apos;ve received your message and will get back to you within <strong>24–48 hours</strong>.</p>
        <p style="margin:0 0 24px 0;color:#374151;font-size:15px;line-height:1.6;">In the meantime, check your <a href="${dashUrl}" style="color:${EMAIL.link};font-weight:600;">dashboard</a> for any updates.</p>
        <p style="margin:0;color:#6B7280;font-size:14px;">— TrackMyOPT Team</p>
      </div>
      <div style="background:#F9FAFB;padding:16px;text-align:center;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280;">
        <p style="margin:0;">© ${new Date().getFullYear()} Zyene, Inc. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

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

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F3F4F6;color:#374151;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background:${EMAIL.headerGradient};padding:24px;text-align:center;">
        <p style="margin:0;color:#fff;font-size:18px;font-weight:600;">TrackMyOPT</p>
        <p style="margin:8px 0 0 0;color:rgba(255,255,255,0.95);font-size:14px;">STEM OPT extension</p>
      </div>
      <div style="padding:28px 24px;">
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;">${greeting}</p>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;"><strong>Your STEM OPT extension window is now open.</strong></p>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;">Your current OPT EAD expires on <strong>${escapeHtml(eadDisplay)}</strong>. You are now within the 90-day window to apply for a 24-month STEM OPT extension — but you must act before your EAD expires.</p>
        <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#111827;">Here's what to do right now:</p>
        <ol style="margin:0 0 20px 0;padding-left:20px;font-size:15px;line-height:1.65;color:#374151;">
          <li style="margin-bottom:10px;"><strong>Talk to your DSO</strong> — request a STEM OPT recommendation in your school's system (SEVIS). This is required before you can file.</li>
          <li style="margin-bottom:10px;"><strong>Confirm your employer is E-Verify enrolled</strong> — your employer must be actively participating in E-Verify. Check with your HR team.</li>
          <li style="margin-bottom:10px;"><strong>File Form I-765 with USCIS</strong> — file before your current EAD expires. If filed on time, you get an automatic 180-day cap-gap extension.</li>
          <li style="margin-bottom:10px;"><strong>Complete Form I-983 with your employer</strong> — training plan required for STEM OPT. Due within 10 days of starting.</li>
        </ol>
        <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;">Track your STEM OPT application timeline in your TrackMyOPT dashboard.</p>
        <div style="text-align:center;margin:0 0 28px 0;">
          <a href="${escapeHtml(dashUrl)}" style="display:inline-block;background:${EMAIL.cta};color:#fff !important;text-decoration:none;font-weight:600;font-size:16px;padding:14px 28px;border-radius:10px;">Open My Dashboard →</a>
        </div>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#6B7280;">Questions? Reply to this email or contact <a href="mailto:support@trackmyopt.com" style="color:${EMAIL.link};">support@trackmyopt.com</a></p>
      </div>
      <div style="background:#F9FAFB;padding:16px;text-align:center;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280;">
        <p style="margin:0;">© ${new Date().getFullYear()} Zyene, Inc. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

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
    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;color:#374151;line-height:1.6;background:#F3F4F6;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <h1 style="margin:0 0 16px 0;font-size:20px;color:#111827;">New contact form submission</h1>
    <p style="margin:0 0 8px 0;"><strong>Submission ID:</strong> ${escapeHtml(args.submissionId)}</p>
    <p style="margin:0 0 8px 0;"><strong>Time (UTC):</strong> ${escapeHtml(args.createdAtIso)}</p>
    <p style="margin:0 0 16px 0;"><strong>User ID:</strong> ${args.userId ? escapeHtml(args.userId) : "(anonymous)"}</p>
    <hr style="border:none;border-top:1px solid #E5E7EB;margin:16px 0"/>
    <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${escapeHtml(args.name)}</p>
    <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${escapeHtml(args.email)}</p>
    <p style="margin:0 0 16px 0;"><strong>Subject:</strong> ${escapeHtml(args.subject)}</p>
    <p style="margin:0 0 8px 0;font-weight:600;">Message</p>
    <div style="background:#F9FAFB;border-radius:8px;padding:16px;white-space:pre-wrap;word-break:break-word;">${safeMsg}</div>
    ${rowLink ? `<p style="margin-top:20px;"><a href="${escapeHtml(rowLink)}" style="color:${EMAIL.link};">Open row in Supabase Table Editor</a></p>` : ""}
  </div>
</body>
</html>`;
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
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, email, first_name")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (!profile?.user_id) return null;

  let email = profile.email?.trim() || "";
  let firstName = profile.first_name;

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
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, email, first_name")
    .eq("user_id", userId)
    .maybeSingle();

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
    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;color:#374151;line-height:1.6;background:#F3F4F6;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <h1 style="margin:0 0 16px 0;font-size:20px;color:#111827;">New Partnership Inquiry</h1>
    <p style="margin:0 0 8px 0;"><strong>Submission ID:</strong> ${escapeHtml(args.submissionId)}</p>
    <p style="margin:0 0 8px 0;"><strong>Time (UTC):</strong> ${escapeHtml(args.createdAtIso)}</p>
    <hr style="border:none;border-top:1px solid #E5E7EB;margin:16px 0"/>
    <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${escapeHtml(args.name)}</p>
    <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${escapeHtml(args.email)}</p>
    <p style="margin:0 0 8px 0;"><strong>University/Institution:</strong> ${escapeHtml(args.university)}</p>
    <p style="margin:0 0 16px 0;"><strong>Role:</strong> ${escapeHtml(args.role)}</p>
    <p style="margin:0 0 8px 0;font-weight:600;">Message</p>
    <div style="background:#F9FAFB;border-radius:8px;padding:16px;white-space:pre-wrap;word-break:break-word;">${safeMsg}</div>
  </div>
</body>
</html>`;
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
