/**
 * Transactional emails (billing, onboarding, refunds) — all sends go through
 * email_queue (pending → sent/failed), blocked_emails check, HTML + text, SMTP via sendMailWithRetry.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "@/types/supabase";
import { sendMailWithRetry } from "./email-smtp";

export function getAppBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://www.trackmyopt.com").replace(/\/$/, "");
}

function getFromHeader(): string {
  return `${process.env.EMAIL_FROM_NAME || "Zyene Inc"} <${process.env.SMTP_USER || "no-reply@trackmyopt.com"}>`;
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

export type QueueTransactionalResult =
  | { ok: true; skipped: "blocked" | "deduped" }
  | { ok: true; skipped: false; queueId: string }
  | { ok: false; error: string };

type DedupeMode =
  | { kind: "payment_failed"; stripeEventId: string; stripeInvoiceId?: string | null }
  | { kind: "stripe_event_alltime"; stripeEventId: string }
  | { kind: "welcome_free" }
  | { kind: "none" };

/**
 * Insert pending → send SMTP → update sent/failed. Updates provider_message_id with SMTP Message-ID.
 */
export async function queueTransactionalEmailSend(args: {
  supabase: SupabaseClient;
  userId: string;
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
    if (await shouldSkipWelcomeFree(supabase, userId)) {
      return { ok: true, skipped: "deduped" };
    }
  } else if (dedupe.kind === "payment_failed") {
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
      <div style="background:linear-gradient(135deg,#DC2626,#B91C1C);padding:28px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Payment didn’t go through</h1>
      </div>
      <div style="padding:28px 24px;color:#374151;font-size:15px;line-height:1.6;">
        <p style="margin:0 0 16px 0;">${greeting}</p>
        <p style="margin:0 0 16px 0;">We couldn’t charge your card for <strong>${escapeHtml(planLabel)}</strong> (${amountStr}). Stripe will automatically retry the payment. To avoid losing Premium access, please update your payment method.</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${settingsUrl}" style="display:inline-block;background:#007AFF;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">Open billing settings</a>
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
      <div style="background:linear-gradient(135deg,#007AFF,#5856D6);padding:28px 24px;text-align:center;">
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
          <a href="${checkoutUrl}" style="display:inline-block;background:#007AFF;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">Resubscribe to Premium</a>
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

export async function sendFreeWelcomeEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName } = args;
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
      <div style="background:linear-gradient(135deg,#007AFF,#5856D6);padding:28px 24px;text-align:center;">
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
          <a href="${dashUrl}" style="display:inline-block;background:#007AFF;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">Go to dashboard</a>
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

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "welcome_free",
    subject: "Welcome to TrackMyOPT — here’s how to get started",
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
      <div style="background:linear-gradient(135deg,#059669,#047857);padding:28px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Refund processed</h1>
      </div>
      <div style="padding:28px 24px;color:#374151;font-size:15px;line-height:1.6;">
        <p style="margin:0 0 16px 0;">${greeting}</p>
        <p style="margin:0 0 16px 0;">We’ve received your refund of <strong>${amountStr}</strong>. Your Premium access has ended.</p>
        <p style="margin:0 0 16px 0;">Refunds typically post to your original payment method in <strong>5–10 business days</strong> (your bank may take longer).</p>
        <p style="margin:0;color:#6B7280;font-size:14px;">Questions? Reply to this email or write to <a href="mailto:support@trackmyopt.com" style="color:#007AFF;">support@trackmyopt.com</a>.</p>
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

export async function sendContactReceivedEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName } = args;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F3F4F6;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#fff;border-radius:16px;padding:28px 24px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <p style="margin:0 0 16px 0;color:#374151;font-size:15px;line-height:1.6;">${greeting}</p>
      <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">We got your message — our team will respond within <strong>24–48 hours</strong>.</p>
      <p style="margin:24px 0 0 0;color:#6B7280;font-size:13px;">— TrackMyOPT Support</p>
    </div>
    <p style="text-align:center;margin:16px 0 0 0;font-size:12px;color:#9CA3AF;">© ${new Date().getFullYear()} Zyene, Inc.</p>
  </div>
</body>
</html>`;

  const text = `${firstName ? `Hi ${firstName},` : "Hi,"}

We got your message. We'll respond within 24-48 hours.

— TrackMyOPT Support`;

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "contact_received",
    subject: "We received your message — TrackMyOPT",
    html,
    text,
    emailData: {},
    dedupe: { kind: "none" },
  });
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
