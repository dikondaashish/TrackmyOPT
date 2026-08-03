/**
 * Compliance notices, support auto-replies, and internal alerts sent to the
 * TrackMyOPT team rather than to a user.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendMailWithRetry } from "../email-smtp";
import { EMAIL } from "../email-brand";
import {
  buildTransactionalEmail,
  emailBodySectionClose,
  emailBodySectionOpen,
  emailTextLead,
  emailTextMuted,
  emailTextP,
  emailTextStrong,
  buildInternalAlertEmail,
} from "../email-layout";
import { COMPANY } from "@/lib/legal/legal-config";
import { escapeHtml } from "./formatting";
import {
  getAppBaseUrl,
  getFromHeader,
  queueTransactionalEmailSend,
  type QueueTransactionalResult,
} from "./queue";

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
