import { EMAIL } from "./email-brand";
import {
  buildTransactionalEmail,
  emailBodySectionClose,
  emailBodySectionOpen,
  emailPrimaryButton,
  emailTextMuted,
  emailTextP,
} from "./email-layout";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildCaseStatusChangeEmailHtml(args: {
  name: string;
  receipt_number: string;
  old_status: string | null;
  new_status: string;
}): string {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.trackmyopt.com"
  ).replace(/\/$/, "");
  const dashUrl = `${base}/dashboard/case-status`;
  const safeName = escapeHtml(args.name);
  const safeReceipt = escapeHtml(args.receipt_number);
  const safeOld = args.old_status ? escapeHtml(args.old_status) : null;
  const safeNew = escapeHtml(args.new_status);
  const oldStatusBlock = safeOld
    ? `${emailTextMuted(`<strong>Previous status:</strong> ${safeOld}`)}`
    : "";

  return buildTransactionalEmail({
    headerTitle: "Case status update",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(`Hi ${safeName},`)}
${emailTextP("Your USCIS case status has been updated:")}
<div class="tmo-force-surface" style="background:${EMAIL.borderLight};border-radius:8px;padding:20px;margin:0 0 20px 0;">
  <p class="tmo-force-muted" style="margin:0 0 8px 0;color:${EMAIL.textMuted} !important;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Receipt number</p>
  <p class="tmo-force-text" style="margin:0;color:${EMAIL.text} !important;font-size:18px;font-weight:700;font-family:ui-monospace,monospace;">${safeReceipt}</p>
</div>
<div class="tmo-force-info-box" style="border-left:4px solid #10B981;background:#F0FDF4;padding:20px;border-radius:8px;margin:0 0 20px 0;">
  ${oldStatusBlock}
  <p class="tmo-force-info-text" style="margin:0 0 8px 0;color:#047857 !important;font-size:14px;font-weight:600;">New status</p>
  <p class="tmo-force-text" style="margin:0;color:${EMAIL.text} !important;font-size:17px;font-weight:600;">${safeNew}</p>
</div>
${emailPrimaryButton(dashUrl, "View full status")}
${emailTextMuted("We&rsquo;ll keep monitoring your case and notify you of future changes.")}
${emailTextMuted(
  `<a href="${dashUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Manage notifications</a>`
)}
${emailBodySectionClose()}`,
  });
}

export const CASE_STATUS_CHANGE_SUBJECT_PREFIX =
  "🔔 Your USCIS Case Status Has Changed - ";
