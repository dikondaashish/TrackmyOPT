/**
 * Billing lifecycle emails: dunning, subscription end, win-back, refunds,
 * trial transitions, receipts, and the Stripe-customer resolvers they need.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { EMAIL } from "../email-brand";
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
} from "../email-layout";
import { COMPANY, LEGAL_CONTACT } from "@/lib/legal/legal-config";
import { escapeHtml, formatMoney } from "./formatting";
import {
  getAppBaseUrl,
  queueTransactionalEmailSend,
  type QueueTransactionalResult,
} from "./queue";

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
  `<strong>AI Resume Generator</strong> &mdash; ${emailTextStrong("1 AI-built resume per month")}`,
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
  `<strong>AI Resume Generator</strong> is still available on Free (${emailTextStrong("1 AI-built resume per month")})`,
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
