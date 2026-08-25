/**
 * Pro trial lifecycle emails: trial started and trial ending soon.
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
import { COMPANY, LEGAL_CONTACT, PRO_PAID_INTRO_PRICE } from "@/lib/legal/legal-config";
import { escapeHtml, welcomeOnboardingStepHtml } from "./formatting";
import {
  getAppBaseUrl,
  queueTransactionalEmailSend,
  type QueueTransactionalResult,
} from "./queue";

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
    headerTitle: "Your paid introduction is ending soon",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting)}
${emailTextLead("Your paid Pro introduction is almost over")}
${emailTextP(
  `This is a friendly heads-up: your paid ${emailTextStrong(`${COMPANY.productName} Pro`)} introductory period ends on ${emailTextStrong(safeEndDate)}. If you keep your subscription, Pro renews at the recurring price accepted at checkout. Cancel before that date to avoid the regular renewal charge.`
)}
${emailInfoCallout(`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">
  <tr>
    <td style="padding:0 0 10px 0;border-bottom:1px solid ${EMAIL.infoBorder};">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Paid introduction ends</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:16px;font-weight:600;color:${EMAIL.infoText} !important;">${safeEndDate}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0 0 0;">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">After the introduction</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:15px;font-weight:600;color:${EMAIL.infoText} !important;">Pro continues at your checkout price unless you cancel</p>
    </td>
  </tr>
</table>
`)}
${emailTextLead("If you want to keep Premium")}
${emailTextList([
  "Confirm your payment method is up to date in billing settings",
  "Keep daily USCIS alerts, reminders, and Document Vault active",
  `Use your <a href="${resumeUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">AI Resume Generator</a> (${emailTextStrong("50 resumes/month")} on Pro) while you search`,
], { ordered: true })}
${emailTextLead("If you want to cancel")}
${emailTextList([
  `Open <a href="${settingsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">Settings &rarr; Subscription</a>`,
  "Select <strong>Manage billing</strong> to open the Stripe Customer Portal",
  `Cancel before ${safeEndDate} to avoid the first paid charge`,
], { ordered: true })}
${emailWarningNote(
  `If you do nothing, your subscription will renew automatically after the paid introduction at the recurring price shown at checkout. You can cancel before ${safeEndDate} to stop that renewal.`
)}
${emailPrimaryButton(settingsUrl, "Manage billing")}
${emailTextMuted(
  `Continue using Premium features in <a href="${dashUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">your dashboard</a> through the paid introductory period.`
)}
${emailTextMuted(
  `Questions? Contact <a href="mailto:${LEGAL_CONTACT.support}" class="tmo-force-link" style="color:${EMAIL.link} !important;">${LEGAL_CONTACT.support}</a>`
)}
${emailBodySectionClose()}`,
  });

  const greetingText = args.firstName?.trim() ? `Hi ${args.firstName.trim()},` : "Hi,";
  const text = `${greetingText}

Your paid Pro introduction is almost over.

Paid introduction ends: ${args.trialEndDate}
After the introduction: Pro continues at your checkout price unless you cancel.

If you want to keep Premium:
1. Confirm your payment method in billing settings
2. Keep daily USCIS alerts, reminders, and Document Vault
3. Use AI Resume Generator (50/month on Pro): ${resumeUrl}

If you want to cancel:
1. Settings → Subscription: ${settingsUrl}
2. Manage billing (Stripe Customer Portal)
3. Cancel before ${args.trialEndDate} to avoid being charged

If you do nothing, your subscription renews automatically after the paid introduction.

Dashboard: ${dashUrl}
Questions? ${LEGAL_CONTACT.support}

© ${new Date().getFullYear()} ${COMPANY.legalName}`;

  return {
    subject: "TrackMyOPT: Your paid Pro introduction is ending soon",
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

/** HTML + plain text when the 7-day paid Pro introduction starts. */
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
    headerTitle: "Your 7-day paid Pro introduction has started",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting)}
${emailTextLead("Welcome to your paid Pro introduction")}
${emailTextP(
  `Your ${emailTextStrong(`$${PRO_PAID_INTRO_PRICE.toFixed(2)}, 7-day Pro introduction`)} is now active. You have full Pro access through ${emailTextStrong(safeEndDate)}.`
)}
${emailInfoCallout(`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">
  <tr>
    <td style="padding:0 0 10px 0;border-bottom:1px solid ${EMAIL.infoBorder};">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Introductory period</p>
      <p class="tmo-force-info-text" style="margin:0;font-size:16px;font-weight:600;color:${EMAIL.infoText} !important;">7 days</p>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid ${EMAIL.infoBorder};">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL.textMuted} !important;">Introduction ends</p>
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
${emailTextLead("What&rsquo;s included during your introduction")}
${emailTextList([
  "Daily 9&nbsp;AM OPT/STEM email reminders and smart timeline tracking",
  "Daily USCIS auto-checks and instant case status alerts",
  `<strong>AI Resume Generator</strong> &mdash; ${emailTextStrong("50 resumes/month")} and ${emailTextStrong("100 ATS scans/month")}`,
  "Document Vault, unlimited job tracker, and unlimited H-1B sponsor search",
], { ordered: false })}
${emailInfoCallout(`
  <p class="tmo-force-info-text" style="margin:0 0 10px 0;color:${EMAIL.infoText} !important;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">Make the most of your introduction</p>
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
${emailTextLead("Billing during your paid introduction")}
${emailTextList([
  `${emailTextStrong(`$${PRO_PAID_INTRO_PRICE.toFixed(2)} was charged at checkout`)} and is refundable only during this 7-day introductory period`,
  "After the introduction, Pro continues at the recurring price shown at checkout unless you cancel",
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

Your $${PRO_PAID_INTRO_PRICE.toFixed(2)}, 7-day Premium (Pro) introduction has started.

Introductory period: 7 days
Introduction ends: ${args.trialEndDate}
Current access: Premium (Pro) — Active

What's included during your introduction:
- Daily OPT/STEM email reminders and smart tracking
- Daily USCIS auto-checks and case status alerts
- AI Resume Generator: 50 resumes/month + 100 ATS scans/month
- Document Vault, unlimited job tracker, H-1B sponsor search

Make the most of your introduction:
1. Enable daily reminders: ${settingsUrl}
2. Add your USCIS case: ${caseStatusUrl}
3. Try AI Resume Generator: ${resumeUrl}

Billing:
- $${PRO_PAID_INTRO_PRICE.toFixed(2)} was charged at checkout and is refundable only during this 7-day introductory period
- After the introduction, Pro renews at checkout price unless you cancel
- Manage billing: ${settingsUrl}

Dashboard: ${dashUrl}
Questions? ${LEGAL_CONTACT.support}

© ${new Date().getFullYear()} ${COMPANY.legalName}`;

  return {
    subject: "TrackMyOPT: Your 7-day paid Pro introduction has started",
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
