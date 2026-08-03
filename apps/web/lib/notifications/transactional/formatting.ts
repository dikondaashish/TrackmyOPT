/**
 * Presentation helpers shared by every transactional email template.
 */

import { EMAIL } from "../email-brand";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatMoney(amountCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${currency}`;
  }
}

export function welcomeOnboardingStepHtml(num: number, title: string, description: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px 0;">
    <tr>
      <td width="40" valign="top" style="padding-top:2px;">
        <div class="tmo-force-badge" style="width:32px;height:32px;line-height:32px;text-align:center;background:${EMAIL.primary};color:${EMAIL.ctaText} !important;border-radius:50%;font-size:15px;font-weight:700;font-family:${EMAIL.fontStack};">${num}</div>
      </td>
      <td valign="top" style="padding-left:12px;">
        <p class="tmo-force-text" style="margin:0 0 4px 0;font-weight:600;color:${EMAIL.text} !important;font-size:15px;font-family:${EMAIL.fontStack};">${title}</p>
        <p class="tmo-force-muted" style="margin:0;color:${EMAIL.textMuted} !important;font-size:14px;line-height:1.55;font-family:${EMAIL.fontStack};">${description}</p>
      </td>
    </tr>
  </table>`;
}
