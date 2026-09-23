import { daysBetween, getStemFilingWindow } from '@/lib/immigration/opt-calculations';
import { escapeHtml } from './transactional/formatting';

export function formatStemDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

/** Email presentation only; filing rules live in the shared immigration calculator. */
export function getStemFilingEmailDetails(ead: string, recommendation?: string | null) {
  const window = getStemFilingWindow(ead, recommendation);
  const today = new Date().toISOString().slice(0, 10);
  const deadlinePassed = today > window.hardDeadline;
  const notYetOpen = today < window.earliestFile;
  const deadlineIsEstimate = !window.recommendationDeadline;
  let message: string;
  if (deadlinePassed) {
    message = 'Your STEM OPT filing deadline has passed based on the saved dates. Contact your DSO immediately to review your options; remaining time on your EAD does not extend the recommendation deadline.';
  } else if (deadlineIsEstimate) {
    message = 'Your STEM DSO recommendation date is missing. This is an EAD-based estimate, not a confirmed filing deadline. Add the date your DSO entered the STEM recommendation in SEVIS and confirm it with your DSO before filing.';
  } else if (today === window.hardDeadline) {
    message = 'Your effective STEM OPT filing deadline is today. Contact your DSO immediately and confirm timely filing requirements with USCIS.';
  } else {
    message = 'File within 60 days of your STEM DSO recommendation and before your current OPT EAD expires. The earlier deadline controls; confirm your eligibility and documents with your DSO.';
  }
  if (notYetOpen && !deadlinePassed) {
    message = `Your STEM OPT filing window opens on ${formatStemDate(window.earliestFile)}. Do not file before that date. ${message}`;
  }
  return {
    ...window,
    eadExpirationDate: ead,
    recommendationDate: recommendation ?? null,
    deadlineIsEstimate,
    deadlinePassed,
    notYetOpen,
    daysLeft: Math.max(0, daysBetween(today, window.hardDeadline)),
    totalDays: Math.max(0, daysBetween(window.earliestFile, window.hardDeadline)),
    message,
  };
}

export type StemFilingEmailDetails = ReturnType<typeof getStemFilingEmailDetails>;

export function renderStemFilingTimeline(details?: StemFilingEmailDetails): string {
  if (!details) {
    return '<p>STEM filing dates are unavailable. Add your OPT EAD expiration and STEM DSO recommendation date in your dashboard to calculate your deadline.</p>';
  }
  const rows = [
    ['Earliest filing date', formatStemDate(details.earliestFile)],
    ['OPT EAD expiration', formatStemDate(details.eadExpirationDate)],
    ['STEM DSO recommendation date', details.recommendationDate ? formatStemDate(details.recommendationDate) : 'Not saved'],
    ['DSO recommendation deadline (60 days)', details.recommendationDeadline ? formatStemDate(details.recommendationDeadline) : 'Unknown'],
    [details.deadlineIsEstimate ? 'Estimated filing deadline (EAD only)' : 'Effective filing deadline', formatStemDate(details.hardDeadline)],
  ];
  return `<div style="padding:20px;background:#F5F3FF;border:1px solid #DDD6FE;">
    <table style="width:100%;font-size:14px;">${rows.map(([label, value]) => `<tr><td style="padding:8px 0;">${label}</td><td style="padding:8px 0;text-align:right;">${escapeHtml(value)}</td></tr>`).join('')}</table>
    <p style="font-size:14px;line-height:1.6;">${escapeHtml(details.message)}</p>
  </div>`;
}
