import { renderStemFilingTimeline } from '../../stem-filing-email';
import type { ToolReminderDetail } from '../../email-service';
import { EMAIL, emailTextList, emailTextMuted } from '../../email-brand';

export function generateStemApplySection(tool: ToolReminderDetail): string {
  return `<div class="tmo-email-body" style="padding:24px;border-bottom:1px solid ${EMAIL.border};">
<h2 style="margin:0 0 20px;color:${EMAIL.text};font-size:20px;line-height:1.4;">STEM OPT Extension</h2>
${renderStemFilingTimeline(tool.stemFiling)}
${emailTextList([
  'Complete Form I-983 with your employer and confirm E-Verify participation.',
  'Request your STEM OPT recommendation from your DSO before filing Form I-765.',
  'Check <a href="https://www.uscis.gov/i-765">USCIS filing instructions</a> and the <a href="https://www.uscis.gov/g-1055">current fee schedule</a>.',
])}
${emailTextMuted('A timely and properly filed STEM OPT application may extend work authorization for up to 180 days while pending, ending sooner upon a USCIS decision. Confirm your work authorization with your DSO.')}
</div>`;
}
