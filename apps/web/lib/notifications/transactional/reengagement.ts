/**
 * Win-back and activation nudges for users who signed up but drifted:
 * abandoned checkout, saved-receipt upsell, inactivity, and the day-1 nudge.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { EMAIL } from "../email-brand";
import {
  buildTransactionalEmail,
  emailBodySectionClose,
  emailBodySectionOpen,
  emailPrimaryButton,
  emailTextLead,
  emailTextList,
  emailTextMuted,
  emailTextP,
} from "../email-layout";
import { COMPANY } from "@/lib/legal/legal-config";
import { escapeHtml } from "./formatting";
import {
  getAppBaseUrl,
  queueTransactionalEmailSend,
  type QueueTransactionalResult,
} from "./queue";

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
  "You already saved a receipt. On Free, open Case Status and refresh anytime. Pro adds daily USCIS auto-checks and emails you when status changes."
)}
${emailTextList(
  [
    "Open Case Status and run a manual refresh (Free)",
    "Start Pro for $0.99 for 7 days for daily auto-checks",
    "Get email when your USCIS status changes",
  ],
  { ordered: true }
)}
${emailPrimaryButton(trialUrl, "Get Pro")}
${emailTextMuted(
  `<a href="${caseStatusUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">View your case status</a> and refresh anytime on Free.`
)}
${emailBodySectionClose()}`,
  });

  const text = `${greetingText}

You already saved a receipt. On Free, open Case Status and refresh anytime. Pro adds daily USCIS auto-checks and emails you when status changes.

1. Open Case Status and run a manual refresh (Free)
2. Start Pro for $0.99 for 7 days for daily auto-checks
3. Get email when your USCIS status changes

Get Pro: ${trialUrl}
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
    ? "Open Case Status to refresh anytime on Free — or start Pro for $0.99 for 7 days for daily auto-checks and email alerts."
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
    "Start Pro for $0.99 for 7 days for daily auto-checks + alerts",
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
    "3. Start Pro for $0.99 for 7 days for daily auto-checks + alerts",
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
