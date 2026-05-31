/**
 * TrackMyOPT email design system — aligns with web app (primary blue / indigo, slate neutrals).
 * All transactional HTML should use these helpers for consistent light rendering in dark-mode clients.
 */

import { COMPANY, LEGAL_CONTACT } from "@/lib/legal/legal-config";

export const EMAIL = {
  fontStack: `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif`,
  bgPage: "#F4F6F8",
  bgCard: "#FFFFFF",
  text: "#111827",
  textSecondary: "#374151",
  textMuted: "#6B7280",
  textSubtle: "#9CA3AF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  indigo: "#4338CA",
  cta: "#2563EB",
  ctaText: "#FFFFFF",
  link: "#2563EB",
  headerGradient: "linear-gradient(135deg, #1E3A8A 0%, #312E81 100%)",
  headerGradientSuccess: "linear-gradient(135deg, #0F766E 0%, #115E59 100%)",
  headerGradientDanger: "linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%)",
  infoBg: "#EFF6FF",
  infoBorder: "#BFDBFE",
  infoText: "#1E3A8A",
  warningText: "#B45309",
  accent: {
    optApply: "#2563EB",
    optClock: "#B45309",
    stemApply: "#047857",
    stemClock: "#5B21B6",
    documents: "#4338CA",
    caseStatus: "#3730A3",
    default: "#2563EB",
  },
} as const;

export type EmailHeaderVariant = "brand" | "success" | "danger";

const DARK_MODE_FORCE_CSS = `
    @media (prefers-color-scheme: dark) {
      .tmo-force-page { background:${EMAIL.bgPage} !important; color:${EMAIL.textSecondary} !important; }
      .tmo-force-card { background:${EMAIL.bgCard} !important; border-color:${EMAIL.border} !important; }
      .tmo-force-surface { background:${EMAIL.borderLight} !important; border-color:${EMAIL.border} !important; }
      .tmo-force-footer { background:${EMAIL.borderLight} !important; border-color:${EMAIL.border} !important; }
      .tmo-force-dark { background:#1E3A8A !important; }
      .tmo-force-dark-text { color:#FFFFFF !important; }
      .tmo-force-light-text { color:${EMAIL.textSecondary} !important; }
      .tmo-force-text { color:${EMAIL.text} !important; }
      .tmo-force-muted { color:${EMAIL.textMuted} !important; }
      .tmo-force-subtle { color:${EMAIL.textSubtle} !important; }
      .tmo-force-link { color:${EMAIL.link} !important; }
      .tmo-force-info-box { background:${EMAIL.infoBg} !important; border-color:${EMAIL.infoBorder} !important; }
      .tmo-force-info-text { color:${EMAIL.infoText} !important; }
      .tmo-force-warning-text { color:${EMAIL.warningText} !important; }
      .tmo-force-cta { background:${EMAIL.cta} !important; color:${EMAIL.ctaText} !important; }
      .tmo-force-badge { background:${EMAIL.primary} !important; color:${EMAIL.ctaText} !important; }
      .tmo-force-card p, .tmo-force-card li, .tmo-force-card td, .tmo-force-card span, .tmo-force-card ul, .tmo-force-card ol { color:${EMAIL.textSecondary} !important; }
      .tmo-force-card h2, .tmo-force-card h3, .tmo-force-card strong { color:${EMAIL.text} !important; }
    }
    [data-ogsc] .tmo-force-page { background:${EMAIL.bgPage} !important; color:${EMAIL.textSecondary} !important; }
    [data-ogsc] .tmo-force-card { background:${EMAIL.bgCard} !important; border-color:${EMAIL.border} !important; }
    [data-ogsc] .tmo-force-surface { background:${EMAIL.borderLight} !important; border-color:${EMAIL.border} !important; }
    [data-ogsc] .tmo-force-footer { background:${EMAIL.borderLight} !important; border-color:${EMAIL.border} !important; }
    [data-ogsc] .tmo-force-dark { background:#1E3A8A !important; }
    [data-ogsc] .tmo-force-dark-text { color:#FFFFFF !important; }
    [data-ogsc] .tmo-force-light-text { color:${EMAIL.textSecondary} !important; }
    [data-ogsc] .tmo-force-text { color:${EMAIL.text} !important; }
    [data-ogsc] .tmo-force-muted { color:${EMAIL.textMuted} !important; }
    [data-ogsc] .tmo-force-subtle { color:${EMAIL.textSubtle} !important; }
    [data-ogsc] .tmo-force-link { color:${EMAIL.link} !important; }
    [data-ogsc] .tmo-force-info-box { background:${EMAIL.infoBg} !important; border-color:${EMAIL.infoBorder} !important; }
    [data-ogsc] .tmo-force-info-text { color:${EMAIL.infoText} !important; }
    [data-ogsc] .tmo-force-warning-text { color:${EMAIL.warningText} !important; }
    [data-ogsc] .tmo-force-cta { background:${EMAIL.cta} !important; color:${EMAIL.ctaText} !important; }
    [data-ogsc] .tmo-force-badge { background:${EMAIL.primary} !important; color:${EMAIL.ctaText} !important; }
    [data-ogsc] .tmo-force-card p, [data-ogsc] .tmo-force-card li, [data-ogsc] .tmo-force-card td, [data-ogsc] .tmo-force-card span, [data-ogsc] .tmo-force-card ul, [data-ogsc] .tmo-force-card ol { color:${EMAIL.textSecondary} !important; }
    [data-ogsc] .tmo-force-card h2, [data-ogsc] .tmo-force-card h3, [data-ogsc] .tmo-force-card strong { color:${EMAIL.text} !important; }
`;

export function emailOuterOpen(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <style>
    :root { color-scheme: light only; supported-color-schemes: light; }
    body { margin:0; padding:0; background:${EMAIL.bgPage}; color:${EMAIL.textSecondary}; }
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: inherit !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
    ${DARK_MODE_FORCE_CSS}
  </style>
</head>
<body class="tmo-force-page" style="margin:0;padding:0;font-family:${EMAIL.fontStack};background-color:${EMAIL.bgPage};color:${EMAIL.textSecondary};">
  <div class="tmo-force-page" style="max-width:600px;margin:0 auto;padding:24px 16px;">`;
}

export function emailOuterClose(): string {
  return `  </div>
</body>
</html>`;
}

export function emailCardOpen(opts: { headerHtml?: string }): string {
  if (opts.headerHtml) {
    return `<div class="tmo-force-card" style="background:${EMAIL.bgCard};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);border:1px solid ${EMAIL.border};">
${opts.headerHtml}`;
  }
  return `<div class="tmo-force-card" style="background:${EMAIL.bgCard};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);border:1px solid ${EMAIL.border};">`;
}

export function emailCardClose(): string {
  return `</div>`;
}

export function emailBodySectionOpen(): string {
  return `<div class="tmo-force-card" style="padding:28px 24px;font-family:${EMAIL.fontStack};background:${EMAIL.bgCard};">`;
}

export function emailBodySectionClose(): string {
  return `</div>`;
}

export function emailTextP(content: string, opts?: { muted?: boolean; last?: boolean }): string {
  const cls = opts?.muted ? "tmo-force-muted" : "tmo-force-light-text";
  const color = opts?.muted ? EMAIL.textMuted : EMAIL.textSecondary;
  const margin = opts?.last ? "0" : "0 0 16px 0";
  return `<p class="${cls}" style="margin:${margin};color:${color} !important;font-size:15px;line-height:1.6;font-family:${EMAIL.fontStack};">${content}</p>`;
}

export function emailTextMuted(content: string): string {
  return emailTextP(content, { muted: true });
}

export function emailTextLead(content: string): string {
  return `<p class="tmo-force-light-text" style="margin:0 0 16px 0;color:${EMAIL.textSecondary} !important;font-size:14px;line-height:1.5;font-weight:600;font-family:${EMAIL.fontStack};">${content}</p>`;
}

export function emailTextStrong(content: string): string {
  return `<strong class="tmo-force-text" style="color:${EMAIL.text} !important;font-weight:600;">${content}</strong>`;
}

export function emailTextList(
  items: string[],
  opts?: { ordered?: boolean }
): string {
  const tag = opts?.ordered ? "ol" : "ul";
  const lis = items
    .map(
      (item) =>
        `<li class="tmo-force-light-text" style="margin-bottom:8px;color:${EMAIL.textSecondary} !important;font-size:15px;line-height:1.6;">${item}</li>`
    )
    .join("");
  return `<${tag} class="tmo-force-light-text" style="margin:0 0 20px 0;padding-left:20px;color:${EMAIL.textSecondary} !important;font-size:15px;line-height:1.6;">${lis}</${tag}>`;
}

/** @deprecated Prefer emailBrandHeaderWithLogo — subtitle belongs in body (dark-mode safe). */
export function emailBrandHeader(opts: { title: string; subtitle?: string; accentBottom?: string }): string {
  const lead = opts.subtitle
    ? emailTextLead(opts.subtitle)
    : "";
  return `${emailBrandHeaderWithLogo({ title: opts.title, accentBottom: opts.accentBottom })}${lead ? `<div style="padding:16px 24px 0 24px;background:${EMAIL.bgCard};">${lead}</div>` : ""}`;
}

export function getEmailLogoUrl(): string {
  return (
    process.env.EMAIL_LOGO_URL ||
    process.env.NEXT_PUBLIC_EMAIL_LOGO_URL ||
    "https://www.trackmyopt.com/TrackMyOPT%20Logo/logo.gif"
  );
}

function headerGradientForVariant(variant: EmailHeaderVariant): string {
  if (variant === "success") return EMAIL.headerGradientSuccess;
  if (variant === "danger") return EMAIL.headerGradientDanger;
  return EMAIL.headerGradient;
}

export function emailBrandHeaderWithLogo(opts: {
  title: string;
  variant?: EmailHeaderVariant;
  accentBottom?: string;
}): string {
  const logoUrl = getEmailLogoUrl();
  const variant = opts.variant ?? "brand";
  const gradient = headerGradientForVariant(variant);
  const border =
    opts.accentBottom != null
      ? `border-bottom:4px solid ${opts.accentBottom};`
      : "";

  return `<div class="tmo-force-dark" style="background:${gradient};${border}padding:28px 24px;text-align:center;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 16px auto;">
    <tr>
      <td style="vertical-align:middle;padding-right:10px;">
        <img src="${logoUrl}" alt="${COMPANY.productName}" width="44" height="44" style="display:block;width:44px;height:44px;border-radius:10px;" />
      </td>
      <td style="vertical-align:middle;text-align:left;">
        <p class="tmo-force-dark-text" style="margin:0;color:#FFFFFF !important;font-size:22px;font-weight:700;letter-spacing:-0.02em;font-family:${EMAIL.fontStack};">${COMPANY.productName}</p>
      </td>
    </tr>
  </table>
  <h1 class="tmo-force-dark-text" style="margin:0;color:#FFFFFF !important;font-size:20px;font-weight:600;line-height:1.35;font-family:${EMAIL.fontStack};">${opts.title}</h1>
</div>`;
}

export function emailFooter(): string {
  return `<div class="tmo-force-footer" style="padding:20px;text-align:center;border-top:1px solid ${EMAIL.border};background:${EMAIL.borderLight};font-size:12px;color:${EMAIL.textMuted};font-family:${EMAIL.fontStack};">
  <p class="tmo-force-light-text" style="margin:0;font-weight:600;color:${EMAIL.textSecondary} !important;">${COMPANY.productName} Team</p>
  <p class="tmo-force-muted" style="margin:6px 0 0 0;color:${EMAIL.textMuted} !important;">© ${new Date().getFullYear()} ${COMPANY.legalName}</p>
  <p class="tmo-force-muted" style="margin:4px 0 0 0;color:${EMAIL.textMuted} !important;">${COMPANY.headquarters}</p>
  <p class="tmo-force-muted" style="margin:8px 0 0 0;color:${EMAIL.textMuted} !important;"><a href="mailto:${LEGAL_CONTACT.support}" class="tmo-force-link" style="color:${EMAIL.link} !important;text-decoration:none;">${LEGAL_CONTACT.support}</a></p>
</div>`;
}

export function emailPrimaryButton(href: string, label: string): string {
  return `<div style="text-align:center;margin:24px 0;">
  <a href="${href}" class="tmo-force-cta" style="display:inline-block;background:${EMAIL.cta};color:${EMAIL.ctaText} !important;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;font-family:${EMAIL.fontStack};">${label}</a>
</div>`;
}
