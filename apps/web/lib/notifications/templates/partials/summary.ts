import {
  EMAIL,
  emailTextList,
  emailTextMuted,
  emailTextP,
} from '../../email-brand';
import { escapeHtml } from '../../transactional/formatting';

/** Stacked values stay readable without media queries or flexbox support. */
export function emailSummaryRows(rows: [string, string][]): string {
  return rows
    .map(([label, value]) =>
      emailTextP(
        `<strong>${escapeHtml(label)}</strong><br>${escapeHtml(value || 'Not saved')}`
      )
    )
    .join('');
}

export function emailToolSummary(
  title: string,
  rows: [string, string][],
  message: string,
  steps: string[],
  href: string
): string {
  return `<div class="tmo-email-body" style="padding:24px;border-bottom:1px solid ${EMAIL.border};">
<h2 class="tmo-force-text" style="margin:0 0 20px;color:${EMAIL.text};font-size:20px;line-height:1.4;">${escapeHtml(title)}</h2>
${emailSummaryRows(rows)}
${emailTextP(escapeHtml(message))}
${emailTextList(steps)}
${emailTextP(`<a class="tmo-force-link" href="${href}" style="color:${EMAIL.link};text-decoration:underline;">Review ${escapeHtml(title)}</a>`)}
${emailTextMuted('These reminders use your saved records. Confirm requirements and deadlines with your DSO and official notices.')}
</div>`;
}
