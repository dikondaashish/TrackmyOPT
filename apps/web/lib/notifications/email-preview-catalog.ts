/**
 * All user-facing (and internal support) email previews for QA.
 * Used by scripts/send-all-email-previews.ts — does not queue or dedupe.
 */

import { buildPolicyUpdateNoticeEmailContent } from "@/lib/compliance/policy-update-notice";
import {
  buildCaseStatusChangeEmailHtml,
  CASE_STATUS_CHANGE_SUBJECT_PREFIX,
} from "./case-status-email";
import {
  buildDocumentExpiryReminderEmail,
  buildForgotVaultPasscodeResetEmail,
  buildPasscodeChangeOtpEmailHtml,
} from "./document-expiry-email";
import { EMAIL } from "./email-brand";
import {
  buildEnrollmentEmailHtml,
  type EmailReminderData,
} from "./email-service";
import {
  buildTransactionalEmail,
  emailBodySectionClose,
  emailBodySectionOpen,
  emailOtpBox,
  emailPrimaryButton,
  emailTextLead,
  emailTextMuted,
  emailTextP,
} from "./email-layout";
import {
  getDailyReminderSubject,
  renderDailyReminderEmailHtml,
} from "./templates/daily-reminder-html";
import {
  getTransactionalEmailPreviews,
  type EmailPreviewItem,
} from "./transactional-emails";

export type { EmailPreviewItem };

const SAMPLE_FIRST = "Alex";
const SAMPLE_EMAIL = "support@trackmyopt.com";

function adminBulkHtml(
  subject: string,
  bodyInner: string
): { subject: string; html: string } {
  const html = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
${bodyInner.replace(/\{\{firstName\}\}/g, SAMPLE_FIRST)}
<p>Best regards,<br/>The TrackMyOPT Team<br/>Zyene, Inc.</p>
</body></html>`;
  return { subject, html };
}

const ENROLLMENT_TOOLS = [
  "opt-apply",
  "opt-clock",
  "stem-apply",
  "stem-clock",
  "documents",
  "case-status",
  "default",
] as const;

export function getAllEmailPreviews(firstName = SAMPLE_FIRST): EmailPreviewItem[] {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const dailyData: EmailReminderData = {
    userId: "preview-user",
    userEmail: SAMPLE_EMAIL,
    firstName,
    tools: [
      {
        name: "OPT Apply Dates",
        toolType: "opt-apply",
        daysLeft: 5,
        totalDays: 365,
        startDate: "2025-08-01",
        endDate: "2026-08-01",
        urgency: "urgent",
        message: "STEM extension window approaching — review your timeline.",
      },
      {
        name: "OPT Unemployment Clock",
        toolType: "opt-clock",
        daysLeft: 45,
        totalDays: 90,
        startDate: "2025-06-01",
        endDate: "2026-06-01",
        urgency: "moderate",
        message: "You have unemployment days remaining on your OPT period.",
      },
    ],
  };

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 5);

  const policyFree = buildPolicyUpdateNoticeEmailContent(firstName, {
    showBillingUnchangedNotice: false,
  });
  const policyPro = buildPolicyUpdateNoticeEmailContent(firstName, {
    showBillingUnchangedNotice: true,
  });

  const dashSettings =
    "https://www.trackmyopt.com/dashboard/settings?tab=notifications";

  const enrollmentPreviews: EmailPreviewItem[] = ENROLLMENT_TOOLS.map((tool) => {
    const { subject, html } = buildEnrollmentEmailHtml(firstName, tool);
    return {
      id: `enrollment_${tool}`,
      category: "Enrollment",
      subject,
      html,
    };
  });

  const adminPolicy = adminBulkHtml(
    "Important: TrackMyOPT Privacy Policy Update",
    `<h1>Privacy Policy Update</h1><p>Hi {{firstName}},</p><p>We've updated our Privacy Policy.</p><p><a href="https://www.trackmyopt.com/privacy">Read the full Privacy Policy</a></p>`
  );
  const adminOwnership = adminBulkHtml(
    "Important Notice: TrackMyOPT Ownership Change",
    `<h1>Ownership Transfer Notice</h1><p>Hi {{firstName}},</p><p>TrackMyOPT ownership transfer notice (admin bulk template).</p>`
  );
  const adminBreach = adminBulkHtml(
    "🚨 Security Notice: TrackMyOPT Data Incident",
    `<h1 style="color:#DC2626;">Security Incident Notification</h1><p>Hi {{firstName}},</p><p>Security incident notice (admin bulk template).</p>`
  );

  return [
    ...getTransactionalEmailPreviews(firstName),
    {
      id: "daily_reminder",
      category: "Cron",
      subject: getDailyReminderSubject(dailyData.tools),
      html: renderDailyReminderEmailHtml(dailyData),
    },
    {
      id: "document_expiry",
      category: "Cron",
      subject: "⏰ Document Expiring Soon: Passport",
      html: buildDocumentExpiryReminderEmail({
        filename: "passport-scan.pdf",
        expiry_date: expiry.toISOString().slice(0, 10),
        document_type: "passport",
      }),
    },
    {
      id: "export_otp",
      category: "Settings",
      subject: "Your TrackMyOPT data export verification code",
      html: buildTransactionalEmail({
        headerTitle: "Data export verification",
        bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("Use the code below to finish your export")}
${emailTextP(`Hi ${firstName}, you requested an export of your data. Enter this code to continue:`)}
${emailOtpBox("847291")}
${emailTextMuted("Expires in 10 minutes.")}
${emailBodySectionClose()}`,
      }),
    },
    ...enrollmentPreviews,
    {
      id: "notification_email_saved",
      category: "Settings",
      subject: "Your TrackMyOPT notification email is saved",
      html: buildTransactionalEmail({
        headerTitle: "Notification email saved",
        bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(`Hi <strong>${esc(firstName)}</strong>,`)}
${emailTextP("We saved this address for your <strong>notification email</strong>:")}
${emailTextP(`<span style="color:${EMAIL.link};font-weight:600;">${SAMPLE_EMAIL}</span>`)}
${emailPrimaryButton(dashSettings, "Notification settings")}
${emailBodySectionClose()}`,
      }),
    },
    {
      id: "email_address_updated",
      category: "Settings",
      subject: "Your email address was updated",
      html: buildTransactionalEmail({
        headerTitle: "Email address updated",
        bodyHtml: `
${emailBodySectionOpen()}
${emailTextP("Hello,")}
${emailTextP("Your email address for TrackMyOPT was recently updated to this address.")}
${emailTextMuted("&mdash; TrackMyOPT Team")}
${emailBodySectionClose()}`,
      }),
    },
    {
      id: "case_status_change",
      category: "Case status",
      subject: `${CASE_STATUS_CHANGE_SUBJECT_PREFIX}MSC2190123456`,
      html: buildCaseStatusChangeEmailHtml({
        name: firstName,
        receipt_number: "MSC2190123456",
        old_status: "Case Was Received",
        new_status: "Card Was Mailed",
      }),
    },
    {
      id: "passcode_change_otp",
      category: "Document vault",
      subject: "🔐 Your OTP for Passcode Change - TrackMyOPT",
      html: buildPasscodeChangeOtpEmailHtml("582104", firstName),
    },
    {
      id: "passcode_forgot_reset",
      category: "Document vault",
      subject: "🔑 Reset your Document Vault passcode",
      html: buildForgotVaultPasscodeResetEmail("582104", firstName),
    },
    {
      id: "policy_update_notice_free",
      category: "Compliance",
      subject: policyFree.subject,
      html: policyFree.html,
    },
    {
      id: "policy_update_notice_pro",
      category: "Compliance",
      subject: `${policyPro.subject} (Pro billing line)`,
      html: policyPro.html,
    },
    {
      id: "admin_bulk_policy",
      category: "Admin bulk",
      subject: adminPolicy.subject,
      html: adminPolicy.html,
    },
    {
      id: "admin_bulk_ownership",
      category: "Admin bulk",
      subject: adminOwnership.subject,
      html: adminOwnership.html,
    },
    {
      id: "admin_bulk_security",
      category: "Admin bulk",
      subject: adminBreach.subject,
      html: adminBreach.html,
    },
  ];
}

export const DEFAULT_PREVIEW_RECIPIENT = SAMPLE_EMAIL;
