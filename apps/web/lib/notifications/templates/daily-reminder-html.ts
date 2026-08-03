import {
  EMAIL,
  emailBrandHeaderWithLogo,
  emailFooter,
  emailOuterClose,
  emailOuterOpen,
  emailPrimaryButton,
  emailTextLead,
} from '../email-brand';
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

  const toolSectionsHTML = data.tools.map(tool => generateToolSection(tool)).join('');

  return `
    ${emailOuterOpen()}
      <div class="tmo-force-card" style="background:${EMAIL.bgCard};border-radius:12px;overflow:hidden;border:1px solid ${EMAIL.border};box-shadow:0 1px 3px rgba(15,23,42,0.08);">
        ${emailBrandHeaderWithLogo({ title: "Daily OPT summary" })}
        <div class="tmo-force-card" style="padding:20px 24px 8px 24px;border-bottom:1px solid ${EMAIL.border};background:${EMAIL.bgCard};">
          <p class="tmo-force-muted" style="margin:0 0 4px 0;color:${EMAIL.textMuted} !important;font-size:13px;">${currentDate}</p>
          <h2 class="tmo-force-text" style="margin:0;color:${EMAIL.text} !important;font-size:20px;font-weight:700;">Hi ${data.firstName}</h2>
          ${emailTextLead("Your timeline and tool reminders")}
        </div>
        <div class="tmo-force-card" style="background:${EMAIL.bgCard};padding:0;">
          ${toolSectionsHTML}
          <div class="tmo-force-info-box" style="padding:16px 24px;background:${EMAIL.infoBg};border-top:1px solid ${EMAIL.infoBorder};">
            <p class="tmo-force-info-text" style="margin:0 0 4px 0;color:${EMAIL.infoText} !important;font-size:13px;font-weight:600;">Daily reminders</p>
            <p class="tmo-force-light-text" style="margin:0;color:${EMAIL.textSecondary} !important;font-size:13px;line-height:1.5;">
              We send these updates at 9:00 AM ET when your tools are active. Adjust alerts in Settings if needed.
            </p>
          </div>
          <div style="padding:20px 24px;text-align:center;border-top:1px solid ${EMAIL.border};">
            ${emailPrimaryButton('https://www.trackmyopt.com/dashboard/opt-tools/opt-apply', 'Open dashboard')}
          </div>
        </div>
        ${emailFooter()}
      </div>
    ${emailOuterClose()}
  `;
}
