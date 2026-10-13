/**
 * Shared product messaging — CTAs, upsells, disclaimers.
 * User-facing strings only. Plan tier in code may still use `isPremium`.
 */

export const PRODUCT_CTAS = {
  startTrial: 'Start Pro for $0.99 for 7 days',
  comparePlans: 'Compare Plans',
  upgradeToPro: 'Upgrade to Pro',
  tryProFree: 'Start Pro for $0.99',
  subscribeToPro: 'Subscribe to Pro',
} as const;

export const PRODUCT_VALUE_PROP = {
  main: 'Your OPT career companion — deadlines, case status, resumes, and sponsors.',
  headline: 'Never miss an OPT deadline — or a career move',
  subhead:
    'Track filing windows and unemployment days, see your USCIS decision window, build AI resumes, store documents, and find H-1B sponsors — in one place.',
} as const;

export const PLAN_DISPLAY_NAMES = {
  free: 'Free',
  pro: 'Pro',
  dedicated: 'Dedicated',
  proMember: 'Pro Member',
} as const;

export const REMINDER_MESSAGING = {
  panelHeadline: 'Get daily reminders before OPT deadlines become urgent',
  panelSubhead:
    'Every morning at 9:00 AM ET, TrackMyOPT emails you the dates, clocks, and actions that need attention.',
  sampleEmailSubject: 'TrackMyOPT — unemployment alert',
  sampleEmailBody:
    'You have 28 unemployment days remaining on OPT. Log your job or update employment to stay organized.',
  toolUpsellHeadline: 'Daily reminders at 9:00 AM ET (Pro)',
  toolUpsellSubhead:
    'Get email and browser alerts for this tracker — filing windows, unemployment days, and STEM deadlines.',
  footerNote:
    '$0.99 for 7 days for eligible accounts · cancel anytime · reminders for all four trackers with Pro',
} as const;

export const CASE_STATUS_MESSAGING = {
  headline: 'Know where your USCIS case stands',
  subhead:
    'Stop refreshing. Add your receipt once — see status, wait day, and your decision window. Pro alerts you when it moves.',
  /** Canonical Free → Pro one-liner for paywalls */
  freeProCanonical:
    'Free: track 1 case and reveal updates manually. Pro: daily updates appear automatically, with status-change emails.',
  proFeatureTitle: 'Pro: Daily auto-checks + email when status changes',
  proFeatureBody:
    'We check USCIS every day and email you when your status changes — so you do not have to refresh manually.',
  howItWorksNotify: 'Get notified by email when your status changes (Pro)',
  upgradeForAutoChecks: 'Get Pro for automatic daily updates',
  autoMonitorOffHint: 'Refresh to reveal updates — automatic display is Pro',
  packagingChangeNotice:
    'We sync saved cases daily. Free users reveal updates manually; Pro includes automatic display, email alerts, and metrics.',
  statusChangeHeadline:
    'Your case status changed. Automatic updates and email alerts are on Pro.',
  statusChangeBody:
    'Free: track 1 case and reveal updates manually. Pro: daily updates appear automatically, with status-change emails.',
  receiptAddedNotice:
    'Pro displays daily updates automatically. Manual refresh stays free.',
  staleStatusNotice:
    'Displayed status may be outdated. Reveal updates manually or get automatic display with Pro.',
  trialCtaStrip:
    'Get Pro for automatic daily updates and email alerts when your status changes.',
  caseInsightHeadline: 'See daily updates automatically with Pro.',
  caseInsightBody:
    'Get daily USCIS checks and email when a scheduled check detects a status change. Manual checks stay free.',
  caseInsightInlineTitle: 'Let Pro watch for changes',
  caseInsightInlineBody:
    'Pro checks USCIS daily and emails you when your status changes. Community estimates remain planning guidance, not promised dates.',
  caseInsightCta: 'See daily monitoring options',
  disclaimer:
    'Status data comes from USCIS. Processing times vary — check with your DSO or attorney for official guidance.',
} as const;

export const COMMUNITY_REPORTS_MESSAGING = {
  sectionTitle: 'Latest community processing reports',
  sectionSubhead:
    'Recent self-reported OPT/STEM timelines from the community. Use as a planning reference — not an official USCIS estimate.',
  sourceNote:
    'Community-reported timelines · not affiliated with USCIS · not a guarantee',
} as const;

export const PLAN_OUTCOME_COPY = {
  free: 'Basic tracking for one OPT timeline — calculators and clocks always free.',
  pro: 'Daily reminders, deadline alerts, OPT/STEM trackers, and case monitoring in one place.',
  dedicated:
    'Everything in Pro plus higher career-tool limits, priority support, and one complimentary 60-minute initial attorney consultation per account after 7 continuous days on Dedicated.',
} as const;

export const PRO_TIPS = [
  'File early inside your eligible I-765 filing window',
  'Keep copies of your I-765, I-20, EAD, and receipt notice',
  'Report employment changes to your DSO on time',
  'Track unemployment days from your EAD start date',
] as const;
