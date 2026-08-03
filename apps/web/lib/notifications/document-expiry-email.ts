/**
 * Branded HTML for document vault expiry reminder emails (cron).
 */

import { EMAIL } from "./email-brand";
import {
  buildTransactionalEmail,
  emailBodySectionClose,
  emailBodySectionOpen,
  emailPrimaryButton,
  emailTextLead,
  emailTextMuted,
  emailTextP,
  emailWarningNote,
} from "./email-layout";

interface DocumentExpiryReminderInput {
  filename: string;
  expiry_date: string;
  document_type: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getDocumentRenewalTips(documentType: string): string {
  const type = documentType.toLowerCase();
  const box = (title: string, items: string[]) => `
<div class="tmo-force-surface" style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:16px 20px;margin:20px 0;">
  <p class="tmo-force-warning-text" style="margin:0 0 12px 0;color:#92400E !important;font-weight:600;font-size:14px;">${title}</p>
  <ul class="tmo-force-light-text" style="margin:0;padding:0 0 0 20px;color:#78350F !important;font-size:13px;line-height:1.8;">
    ${items.map((item) => `<li style="margin-bottom:6px;">${item}</li>`).join("")}
  </ul>
</div>`;

  if (type.includes("passport")) {
    return box("Passport renewal tips", [
      "Start renewal <strong>3&ndash;4 months</strong> before expiry for international travel",
      "Many countries require <strong>6 months validity</strong> beyond travel dates",
      "You may need to update your visa if your passport number changes",
      "Expedited processing is available for urgent travel",
    ]);
  }
  if (type.includes("visa") || type.includes("i-94")) {
    return box("Visa / immigration document tips", [
      "Consult your DSO or immigration attorney before expiry",
      "Check USCIS processing times for extensions",
      "Maintain valid status &mdash; do not let documents lapse without a plan",
      "Keep copies of all immigration documents",
    ]);
  }
  if (type.includes("ead") || type.includes("employment") || type.includes("work")) {
    return box("EAD / work authorization tips", [
      "Apply for renewal <strong>up to 180 days</strong> before expiration",
      "You may qualify for automatic extension while renewal is pending",
      "Notify your employer about upcoming expiration",
      "Update the SEVP Portal with employment changes",
    ]);
  }
  if (type.includes("driver") || type.includes("license") || type.includes("driving")) {
    return box("Driver&rsquo;s license tips", [
      "Check your state DMV for online renewal options",
      "Bring valid immigration documents for REAL ID compliance",
      "License expiration may be tied to immigration status",
      "Schedule DMV appointments early",
    ]);
  }
  if (type.includes("i-20")) {
    return box("I-20 tips", [
      "Contact your DSO for I-20 extension if still in program",
      "Request a travel signature before international travel",
      "Keep all previous I-20s for your immigration history",
      "Ensure your SEVIS record is active",
    ]);
  }
  if (type.includes("insurance") || type.includes("health")) {
    return box("Insurance document tips", [
      "Review coverage options before renewal",
      "Check open enrollment periods",
      "Compare plans for adequate coverage",
      "Avoid coverage lapses",
    ]);
  }
  return box("Renewal tips", [
    "Start renewal well before the expiry date",
    "Gather required supporting documents",
    "Check for changes in renewal requirements",
    "Keep a copy of the expired document for your records",
  ]);
}

export function buildDocumentExpiryReminderEmail(doc: DocumentExpiryReminderInput): string {
  const expiryDate = new Date(doc.expiry_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const today = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const daysUntilExpiry = Math.ceil(
    (new Date(doc.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const documentType = doc.document_type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const safeFilename = escapeHtml(doc.filename);
  const safeType = escapeHtml(documentType);

  let urgencyColor: string;
  let urgencyBg: string;
  let urgencyLabel: string;
  let actionMessage: string;
  let headerVariant: "brand" | "danger" = "brand";

  if (daysUntilExpiry <= 0) {
    urgencyColor = "#dc2626";
    urgencyBg = "#FEF2F2";
    urgencyLabel = "EXPIRES TODAY";
    actionMessage =
      "Your document has expired or expires today. Take immediate action to renew it.";
    headerVariant = "danger";
  } else if (daysUntilExpiry <= 3) {
    urgencyColor = "#dc2626";
    urgencyBg = "#FEF2F2";
    urgencyLabel = "CRITICAL &mdash; EXPIRING VERY SOON";
    actionMessage =
      "This is your final reminder. Renew this document immediately to avoid issues.";
    headerVariant = "danger";
  } else if (daysUntilExpiry <= 5) {
    urgencyColor = "#dc2626";
    urgencyBg = "#FEF2F2";
    urgencyLabel = "CRITICAL";
    actionMessage = "Time is running out. Schedule your renewal appointment today.";
    headerVariant = "danger";
  } else if (daysUntilExpiry <= 10) {
    urgencyColor = "#ea580c";
    urgencyBg = "#FFF7ED";
    urgencyLabel = "URGENT";
    actionMessage =
      "Your document expires soon. Start the renewal process now to avoid a last-minute rush.";
    headerVariant = "danger";
  } else if (daysUntilExpiry <= 20) {
    urgencyColor = "#d97706";
    urgencyBg = "#FFFBEB";
    urgencyLabel = "IMPORTANT";
    actionMessage = "Plan ahead. Begin gathering required documents for renewal.";
  } else if (daysUntilExpiry <= 30) {
    urgencyColor = "#ca8a04";
    urgencyBg = "#FEFCE8";
    urgencyLabel = "ATTENTION";
    actionMessage = "You have about a month left. Good time to check renewal requirements.";
  } else if (daysUntilExpiry <= 45) {
    urgencyColor = "#0891b2";
    urgencyBg = "#ECFEFF";
    urgencyLabel = "UPCOMING";
    actionMessage = "Still plenty of time, but plan ahead for renewal.";
  } else {
    urgencyColor = EMAIL.primary;
    urgencyBg = EMAIL.infoBg;
    urgencyLabel = "ADVANCE NOTICE";
    actionMessage = "Early reminder &mdash; mark your calendar for the renewal date.";
  }

  const daysText =
    daysUntilExpiry <= 0 ? "TODAY" : daysUntilExpiry === 1 ? "1 day" : `${daysUntilExpiry} days`;
  const headline =
    daysUntilExpiry <= 0
      ? `Your ${safeType} expires today`
      : `Your ${safeType} expires in ${daysText}`;
  const dashUrl = "https://www.trackmyopt.com/dashboard/documents";
  const settingsUrl = "https://www.trackmyopt.com/dashboard/settings?tab=notifications";
  const renewalTips = getDocumentRenewalTips(documentType);

  return buildTransactionalEmail({
    headerTitle: "Document expiry alert",
    headerVariant,
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead(`${urgencyLabel} &middot; ${safeType}`)}
${emailTextP(`<span class="tmo-force-text" style="color:${EMAIL.text} !important;font-size:17px;font-weight:600;">${headline}</span>`)}
<div style="background:${urgencyBg};border:1px solid ${EMAIL.border};border-radius:12px;padding:20px;margin:0 0 20px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding-bottom:12px;border-bottom:1px solid ${EMAIL.border};">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;color:${EMAIL.textMuted} !important;">Document name</p>
      <p class="tmo-force-text" style="margin:0;font-size:16px;font-weight:600;color:${EMAIL.text} !important;">${safeFilename}</p>
    </td></tr>
    <tr><td style="padding:12px 0;border-bottom:1px solid ${EMAIL.border};">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;color:${EMAIL.textMuted} !important;">Document type</p>
      <p class="tmo-force-light-text" style="margin:0;color:${EMAIL.textSecondary} !important;">${safeType}</p>
    </td></tr>
    <tr><td style="padding:12px 0;border-bottom:1px solid ${EMAIL.border};">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;color:${EMAIL.textMuted} !important;">Expiry date</p>
      <p style="margin:0;font-size:17px;font-weight:700;color:${urgencyColor} !important;">${escapeHtml(expiryDate)}</p>
    </td></tr>
    <tr><td style="padding:12px 0;">
      <p class="tmo-force-muted" style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;color:${EMAIL.textMuted} !important;">Time remaining</p>
      <p style="margin:0;font-size:26px;font-weight:800;color:${urgencyColor} !important;">${escapeHtml(daysText)}</p>
      <p class="tmo-force-muted" style="margin:8px 0 0 0;font-size:13px;color:${EMAIL.textMuted} !important;">Today (ET): ${escapeHtml(today)}</p>
    </td></tr>
  </table>
</div>
<div style="border-left:4px solid ${urgencyColor};background:${urgencyBg};padding:14px 16px;border-radius:6px;margin:0 0 20px 0;">
  <p class="tmo-force-light-text" style="margin:0;font-size:15px;line-height:1.6;color:${EMAIL.textSecondary} !important;">${actionMessage}</p>
</div>
${renewalTips}
${emailTextP(
  `You added <strong>${safeType}</strong> to your Document Vault with expiry <strong>${escapeHtml(expiryDate)}</strong>. We remind you at 60, 45, 30, 20, 15, 10, 5, 3, 2, and 1 day before expiry.`
)}
${emailTextP(
  "<strong>Already renewed?</strong> Update the expiry date in your vault and reminders for this document will stop."
)}
${emailPrimaryButton(dashUrl, "View & update document")}
${emailTextMuted(
  `Reminder schedule: 60 &rarr; 45 &rarr; 30 &rarr; 20 &rarr; 15 &rarr; 10 &rarr; 5 &rarr; 3 &rarr; 2 &rarr; 1 day before expiry. <a href="${settingsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Manage email preferences</a>`
)}
${emailBodySectionClose()}`,
  });
}

export function buildPasscodeChangeOtpEmailHtml(otp: string, displayName: string): string {
  const safeName = escapeHtml(displayName);
  return buildTransactionalEmail({
    headerTitle: "Passcode verification",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("Verify your Document Vault passcode change")}
${emailTextP(`Hi ${safeName}, use the code below to verify your passcode change request.`)}
<div class="tmo-force-surface" style="background:${EMAIL.borderLight};border:1px solid ${EMAIL.border};border-radius:10px;padding:24px;text-align:center;margin:20px 0;">
  <span class="tmo-force-text" style="font-size:32px;font-weight:700;letter-spacing:10px;color:${EMAIL.text} !important;font-family:ui-monospace,monospace;">${otp}</span>
</div>
${emailTextMuted(
  "<strong>This code expires in 10 minutes.</strong> Do not share it with anyone. TrackMyOPT will never ask for your OTP."
)}
${emailTextMuted(
  "If you didn&rsquo;t request this change, ignore this email or contact support@trackmyopt.com."
)}
${emailBodySectionClose()}`,
  });
}

export function buildForgotVaultPasscodeResetEmail(otp: string, displayName: string): string {
  const safeName = escapeHtml(displayName);
  return buildTransactionalEmail({
    headerTitle: "Reset vault passcode",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("Document Vault passcode reset")}
${emailTextP(`Hi ${safeName}, enter this code in TrackMyOPT to set a new passcode:`)}
<div class="tmo-force-surface" style="background:${EMAIL.borderLight};border:1px solid ${EMAIL.border};border-radius:10px;padding:24px;text-align:center;margin:20px 0;">
  <span class="tmo-force-text" style="font-size:32px;font-weight:700;letter-spacing:10px;color:${EMAIL.text} !important;font-family:ui-monospace,monospace;">${otp}</span>
</div>
${emailTextMuted("This code expires in 10 minutes.")}
${emailWarningNote(
  "<strong>Important:</strong> Completing this reset will remove all documents currently in your vault. You can re-upload them after setting your new passcode."
)}
${emailTextMuted("If you did not request this, you can ignore this email.")}
${emailBodySectionClose()}`,
  });
}
