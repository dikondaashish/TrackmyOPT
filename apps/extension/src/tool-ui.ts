import { icon } from './icons';

function escape(value: string): string {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export function helpTip(id: string, label: string, text: string): string {
  return `<span class="tool-help"><button type="button" class="tool-help-button" aria-label="About ${escape(label)}" aria-describedby="${id}">?</button><span id="${id}" role="tooltip" class="tool-tooltip" hidden>${escape(text)}</span></span>`;
}

export const TOOL_HELP = {
  opt: 'Apply from 90 days before your program end date through 60 days after. USCIS must receive the application within 30 days of the DSO recommendation in SEVIS.',
  stem: 'Apply up to 90 days before your current OPT EAD expires. File within 60 days of your DSO entering the STEM recommendation in SEVIS and before your OPT expires.',
  stemDso: 'Optional: use the date your DSO entered the STEM recommendation in SEVIS. Without it, the deadline is an estimate. Saved in this browser only; dashboard and email reminders do not use this date.',
  clock: 'Unemployment days are calculated from saved employment history, not just your EAD start date. Keep your employment records up to date in the dashboard.',
  reminders: 'Daily reminders are scheduled for 9:00 AM Eastern. Email reminders require a Pro plan and a saved email address.',
};

export function toolIntro(label: string, id: string, text: string): string {
  const symbol = id.includes('reminders') ? 'bell' : id.includes('clock') ? 'clock' : 'calendar';
  const visual = id === 'usage-help' ? '' : `<span class="tool-heading-icon" aria-hidden="true">${icon(symbol, 16, 'currentColor')}</span>`;
  return `<div class="tool-section-heading"><span class="tool-heading-label">${visual}${escape(label)}</span>${helpTip(id, label, text)}</div>`;
}

export function dateField(id: string, label: string, help: string, pickerId?: string, optional = false): string {
  return `<div class="tool-field">
    <div class="tool-field-heading"><label for="${id}">${escape(label)}</label>${optional ? '<span class="tool-optional">Optional</span>' : ''}${helpTip(`${id}-help`, label, help)}</div>
    <div class="tool-input-wrap" style="position: relative">
      <input class="tool-date-input" id="${id}" type="text" inputmode="numeric" placeholder="mm/dd/yyyy" aria-describedby="${id}-help" ${optional ? '' : 'aria-required="true"'} autocomplete="off" />
      ${pickerId ? `<button type="button" class="tool-calendar-button" id="${pickerId}" aria-label="Choose ${escape(label)}">${icon('calendar', 18, 'currentColor')}</button>` : ''}
    </div>
  </div>`;
}

export function compactDate(label: string, date: Date, emphasized = false): string {
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  return `<div class="tool-date-summary${emphasized ? ' tool-date-summary--deadline' : ''}"><span>${escape(label)}</span><strong>${month} ${date.getDate()}</strong><small>${date.getFullYear()}</small></div>`;
}

export function reminderContent(premium: boolean, subscribed: boolean, upgradeId: string): string {
  return premium ? `<div class="tool-email-row"><input type="email" id="reminder-email-input" aria-label="Reminder email" placeholder="your@email.com" /><button type="button" id="save-email-btn" class="tool-button tool-button-primary" aria-label="Save reminder email">${icon('chevronRight', 16, 'currentColor')}</button></div>${subscribed ? '<button type="button" class="tool-button tool-button-secondary tool-stop" id="stop-reminders-btn">Stop reminders</button>' : ''}`
    : `<div class="tool-upgrade-row"><span class="tool-optional">Pro feature</span><button type="button" id="${upgradeId}" class="tool-button tool-button-secondary">View Pro</button></div>`;
}

export function countdownView(start: Date, end: Date, premium: boolean, subscribed: boolean, help: string, estimated: boolean): string {
  return `<div class="tool-section-heading"><span class="tool-heading-label"><span class="tool-heading-icon" aria-hidden="true">${icon('calendar', 16, 'currentColor')}</span>Filing window</span><span class="tool-heading-end">${estimated ? '<span class="tool-optional">Estimate</span>' : ''}${helpTip('filing-window-help', 'filing window', help)}</span></div>
    <div class="tool-dates">${compactDate('Opens', start)}${compactDate('Deadline', end, true)}</div>
    <section id="countdown-container" class="tool-countdown">
      <div id="days-left-text" class="tool-countdown-title">Calculating…</div>
      <div class="tool-time-grid">${['days','hours','minutes','seconds'].map((unit, i) => `<div><strong id="countdown-${unit}">00</strong><span>${['Days','Hrs','Min','Sec'][i]}</span></div>`).join('')}</div>
      <p id="time-message" class="tool-status" role="status"></p>
    </section>
    <button type="button" id="modify-dates-btn" class="tool-button tool-button-primary">Modify dates</button>
    <section class="tool-reminders">${toolIntro('Daily reminders', 'reminders-help', TOOL_HELP.reminders)}<div id="email-reminder-content">${reminderContent(premium, subscribed, 'upgrade-premium-btn')}</div></section>`;
}

const cleanups = new WeakMap<HTMLElement, () => void>();

/** Delegation also covers async reminder/clock content without document listeners per tip. */
export function setupToolHelp(root: HTMLElement): void {
  cleanups.get(root)?.();
  let current: HTMLElement | null = null;
  let pinned = false;
  const close = () => {
    const tip = current?.querySelector<HTMLElement>('[role="tooltip"]');
    if (tip) tip.hidden = true;
    current = null;
    pinned = false;
  };
  const show = (help: HTMLElement) => {
    if (current !== help) close();
    current = help;
    const tip = help.querySelector<HTMLElement>('[role="tooltip"]')!;
    const button = help.querySelector('button')!;
    tip.hidden = false;
    const rect = button.getBoundingClientRect();
    const viewport = root.ownerDocument.defaultView!;
    tip.style.width = `${Math.min(280, viewport.innerWidth - 24)}px`;
    const bounds = tip.getBoundingClientRect();
    tip.style.left = `${Math.max(12, Math.min(rect.right - bounds.width, viewport.innerWidth - bounds.width - 12))}px`;
    // Touch the trigger so users can move onto the tip without crossing a gap.
    const top = rect.bottom + bounds.height < viewport.innerHeight - 12 ? rect.bottom : rect.top - bounds.height;
    tip.style.top = `${Math.max(8, top)}px`;
  };
  const targetHelp = (event: Event) => (event.target as HTMLElement)?.closest?.<HTMLElement>('.tool-help') ?? null;
  const over = (event: Event) => { const help = targetHelp(event); if (help && (!pinned || help === current)) show(help); };
  const out = (event: Event) => {
    const next = (event as MouseEvent).relatedTarget as Node | null;
    if (current && !pinned && !current.contains(next) && !current.contains(root.ownerDocument.activeElement)) close();
  };
  const focusOut = (event: Event) => { if (current && !current.contains((event as FocusEvent).relatedTarget as Node | null)) close(); };
  const click = (event: Event) => {
    const button = (event.target as HTMLElement)?.closest?.('.tool-help-button');
    const help = targetHelp(event);
    if (button && help) { if (current === help && pinned) close(); else { show(help); pinned = true; } }
    else if (!help) close();
  };
  const key = (event: Event) => { if ((event as KeyboardEvent).key === 'Escape') close(); };
  const outside = (event: Event) => { if (!root.contains(event.target as Node)) close(); };
  const handlers: [string, EventListener][] = [['pointerover', over], ['pointerout', out], ['focusin', over], ['focusout', focusOut], ['click', click], ['keydown', key]];
  handlers.forEach(([name, handler]) => root.addEventListener(name, handler));
  root.ownerDocument.addEventListener('scroll', close, true);
  root.ownerDocument.addEventListener('click', outside);
  cleanups.set(root, () => {
    close();
    handlers.forEach(([name, handler]) => root.removeEventListener(name, handler));
    root.ownerDocument.removeEventListener('scroll', close, true);
    root.ownerDocument.removeEventListener('click', outside);
  });
}
