/**
 * TrackMyOPT email design system — aligns with web app (primary blue / indigo, slate neutrals).
 * Use these tokens in all HTML emails for consistent, professional rendering across clients.
 */

export const EMAIL = {
  fontStack: `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif`,
  /** Page background */
  bgPage: "#F4F6F8",
  bgCard: "#FFFFFF",
  text: "#111827",
  textSecondary: "#374151",
  textMuted: "#6B7280",
  textSubtle: "#9CA3AF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  /** Primary brand — matches pricing / dashboard CTAs (blue-600) */
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  indigo: "#4338CA",
  /** Solid CTA (no loud gradient) */
  cta: "#2563EB",
  ctaText: "#FFFFFF",
  link: "#2563EB",
  /** Header — navy → indigo (restrained, readable) */
  headerGradient: "linear-gradient(135deg, #1E3A8A 0%, #312E81 100%)",
  /** Optional secondary stripe (premium / success confirmations) */
  headerGradientSuccess: "linear-gradient(135deg, #0F766E 0%, #115E59 100%)",
  /** Payment / error headers */
  headerGradientDanger: "linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%)",
  /** Info callout background */
  infoBg: "#EFF6FF",
  infoBorder: "#BFDBFE",
  infoText: "#1E3A8A",
  /** Tool accent underlines (match dashboard tool families) */
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

export function emailOuterOpen(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:${EMAIL.fontStack};background-color:${EMAIL.bgPage};color:${EMAIL.textSecondary};">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">`;
}

export function emailOuterClose(): string {
  return `  </div>
</body>
</html>`;
}

/** Standard card shell: white card + optional top header strip */
export function emailCardOpen(opts: {
  headerHtml?: string;
}): string {
  const top = opts.headerHtml
    ? `<div style="background:${EMAIL.bgCard};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);border:1px solid ${EMAIL.border};">
${opts.headerHtml}`
    : `<div style="background:${EMAIL.bgCard};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);border:1px solid ${EMAIL.border};">`;
  return top;
}

export function emailBrandHeader(opts: { title: string; subtitle?: string; accentBottom?: string }): string {
  const border =
    opts.accentBottom != null
      ? `border-bottom:4px solid ${opts.accentBottom};`
      : "";
  return `<div style="background:${EMAIL.headerGradient};${border}padding:26px 24px;text-align:center;">
  <p style="margin:0 0 4px 0;color:rgba(255,255,255,0.88);font-size:11px;letter-spacing:0.06em;text-transform:uppercase;font-weight:600;">TrackMyOPT</p>
  <h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:700;line-height:1.3;">${opts.title}</h1>
  ${opts.subtitle ? `<p style="margin:10px 0 0 0;color:rgba(255,255,255,0.88);font-size:14px;line-height:1.45;">${opts.subtitle}</p>` : ""}
</div>`;
}

export function emailFooter(): string {
  return `<div style="padding:20px;text-align:center;border-top:1px solid ${EMAIL.border};background:${EMAIL.borderLight};font-size:12px;color:${EMAIL.textMuted};">
  <p style="margin:0;">© ${new Date().getFullYear()} Zyene, Inc.</p>
  <p style="margin:8px 0 0 0;"><a href="mailto:support@trackmyopt.com" style="color:${EMAIL.link};text-decoration:none;">support@trackmyopt.com</a></p>
</div>`;
}

export function emailPrimaryButton(href: string, label: string): string {
  return `<div style="text-align:center;margin:24px 0;">
  <a href="${href}" style="display:inline-block;background:${EMAIL.cta};color:${EMAIL.ctaText}!important;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">${label}</a>
</div>`;
}
