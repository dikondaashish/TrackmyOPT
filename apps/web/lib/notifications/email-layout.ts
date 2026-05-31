/**
 * Standard transactional email layout — logo header, body, footer, dark-mode-safe typography.
 */

import {
  EMAIL,
  emailBodySectionClose,
  emailBodySectionOpen,
  emailBrandHeaderWithLogo,
  emailCardClose,
  emailCardOpen,
  emailFooter,
  emailOuterClose,
  emailOuterOpen,
  emailPrimaryButton,
  emailTextLead,
  emailTextList,
  emailTextMuted,
  emailTextP,
  emailTextStrong,
  type EmailHeaderVariant,
} from "./email-brand";

export {
  emailTextP,
  emailTextMuted,
  emailTextLead,
  emailTextStrong,
  emailTextList,
  emailBodySectionOpen,
  emailBodySectionClose,
  emailPrimaryButton,
  EMAIL,
};

export type { EmailHeaderVariant };

export function buildTransactionalEmail(opts: {
  headerTitle: string;
  headerVariant?: EmailHeaderVariant;
  bodyHtml: string;
}): string {
  return `${emailOuterOpen()}
${emailCardOpen({
  headerHtml: emailBrandHeaderWithLogo({
    title: opts.headerTitle,
    variant: opts.headerVariant ?? "brand",
  }),
})}
${opts.bodyHtml}
${emailFooter()}
${emailCardClose()}
${emailOuterClose()}`;
}

export function emailGreetingHtml(firstName: string | null): string {
  const trimmed = firstName?.trim();
  return trimmed ? `Hi ${trimmed},` : "Hi,";
}

export function emailInfoCallout(innerHtml: string): string {
  return `<div class="tmo-force-info-box" style="margin:0 0 20px 0;padding:16px 18px;background:${EMAIL.infoBg};border:1px solid ${EMAIL.infoBorder};border-radius:10px;">
${innerHtml}
</div>`;
}

export function emailOtpBox(code: string): string {
  return `<div class="tmo-force-surface" style="background:${EMAIL.borderLight};border:1px solid ${EMAIL.border};border-radius:10px;padding:24px;text-align:center;margin:24px 0;">
  <span class="tmo-force-text" style="font-size:32px;font-weight:700;letter-spacing:10px;color:${EMAIL.text} !important;font-family:ui-monospace,monospace;">${code}</span>
</div>`;
}

export function emailWarningNote(html: string): string {
  return `<p class="tmo-force-warning-text" style="margin:0 0 16px 0;color:#B45309 !important;font-size:14px;line-height:1.55;font-family:${EMAIL.fontStack};">${html}</p>`;
}

/** Internal support alerts (contact form, partnerships). */
export function buildInternalAlertEmail(title: string, bodyHtml: string): string {
  return buildTransactionalEmail({
    headerTitle: title,
    bodyHtml: `${emailBodySectionOpen()}${bodyHtml}${emailBodySectionClose()}`,
  });
}
