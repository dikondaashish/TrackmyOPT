import { EMAIL, emailBrandHeader, emailFooter, emailOuterClose, emailOuterOpen } from '../email-brand';
import type { EmailReminderData } from '../email-service';
import { generateToolSection } from './partials/tool-section';

export function getDailyReminderSubject(tools: EmailReminderData['tools']): string {
  const minDays = Math.min(...tools.map(t => t.daysLeft));

  if (minDays <= 7) {
    return `TrackMyOPT: ${minDays} ${minDays === 1 ? 'day' : 'days'} left — action needed`;
  } else if (minDays <= 14) {
    return `TrackMyOPT: ${minDays} days remaining`;
  } else if (minDays <= 30) {
    return `TrackMyOPT: ${minDays} days left on your timeline`;
  } else {
    return `TrackMyOPT daily update — ${minDays} days remaining`;
  }
}

export function renderDailyReminderEmailHtml(data: EmailReminderData): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate tool-specific sections
  const toolSectionsHTML = data.tools.map(tool => generateToolSection(tool)).join('');

  return `
    ${emailOuterOpen()}
      <div style="background:${EMAIL.bgCard};border-radius:12px;overflow:hidden;border:1px solid ${EMAIL.border};box-shadow:0 1px 3px rgba(15,23,42,0.08);">
        ${emailBrandHeader({
          title: "Daily OPT summary",
          subtitle: "Your timeline and tool reminders",
          accentBottom: EMAIL.accent.optApply,
        })}
        <div style="padding:24px 24px 8px 24px;border-bottom:1px solid ${EMAIL.border};">
          <p style="margin:0 0 4px 0;color:${EMAIL.textMuted};font-size:13px;">${currentDate}</p>
          <h2 style="margin:0;color:${EMAIL.text};font-size:20px;font-weight:700;">Hi ${data.firstName}</h2>
        </div>
        <div style="background:${EMAIL.bgCard};padding:0;">
          ${toolSectionsHTML}
          <div style="padding:16px 24px;background:${EMAIL.infoBg};border-top:1px solid ${EMAIL.infoBorder};">
            <p style="margin:0 0 4px 0;color:${EMAIL.infoText};font-size:13px;font-weight:600;">Daily reminders</p>
            <p style="margin:0;color:${EMAIL.textSecondary};font-size:13px;line-height:1.5;">
              We send these updates at 9:00 AM ET when your tools are active. Adjust alerts in Settings if needed.
            </p>
          </div>
          <div style="padding:20px 24px;text-align:center;border-top:1px solid ${EMAIL.border};">
            <a href="https://www.trackmyopt.com/dashboard/opt-tools/opt-apply"
               style="display:inline-block;background:${EMAIL.cta};color:${EMAIL.ctaText}!important;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;font-size:14px;">
              Open dashboard
            </a>
          </div>
        </div>
        ${emailFooter()}
      </div>
    ${emailOuterClose()}
  `;
}
