/**
 * Sample renders of every transactional template — preview / QA only.
 */

import { EMAIL } from "../email-brand";
import {
  buildTransactionalEmail,
  emailBodySectionClose,
  emailBodySectionOpen,
  emailPrimaryButton,
  emailTextLead,
  emailTextP,
  emailTextStrong,
  buildInternalAlertEmail,
} from "../email-layout";
import { escapeHtml } from "./formatting";
import { getAppBaseUrl } from "./queue";
import {
  buildPaymentFailedEmailBodies,
  buildRefundProcessedEmailBodies,
  buildSubscriptionEndedEmailBodies,
} from "./billing";
import {
  buildTrialEndingEmailBodies,
  buildTrialStartedEmailBodies,
} from "./trials";
import { buildPremiumWelcomeEmailBodies, buildWelcomeFreeEmailBodies } from "./onboarding";

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
