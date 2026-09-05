/**
 * Welcome emails for users who just arrived — free signup and post-checkout
 * Premium welcome.
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
} from "../email-layout";
import { COMPANY, LEGAL_CONTACT } from "@/lib/legal/legal-config";
import { escapeHtml, welcomeOnboardingStepHtml } from "./formatting";
import {
  getAppBaseUrl,
  queueTransactionalEmailSend,
  type QueueTransactionalResult,
} from "./queue";

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
  const optToolsUrl = `${base}/tools/opt-apply`;
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
    Turn a rough draft or old CV into a polished, job-ready resume in minutes. Start free with ${emailTextStrong("1 AI resume per month")} &mdash; upgrade anytime for higher resume and ATS limits.
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
- Free plan: 1 AI resume per month
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
  const optToolsUrl = `${base}/tools/opt-apply`;
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
    `Open the <a href="${resumeUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">AI Resume Generator</a> &mdash; ${emailTextStrong("50 AI-built resumes/month")} plus 100 ATS scans/month on Pro.`
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
  `<strong>AI Resume Generator</strong> &mdash; ${emailTextStrong("50 resumes/month")} and ${emailTextStrong("100 ATS resume scans/month")}`,
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
3. Try AI Resume Generator (50 resumes/month + 100 ATS scans/month): ${resumeUrl}

Immigration & automation:
- Daily email reminders for OPT/STEM tools
- Daily USCIS auto-checks and status alerts
- Document Vault with expiry reminders

Career & job search:
- AI Resume Generator: 50 resumes/month + 100 ATS scans/month
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
