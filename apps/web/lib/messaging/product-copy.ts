/**
 * Shared product messaging — CTAs, upsells, disclaimers.
 * User-facing strings only. Plan tier in code may still use `isPremium`.
 */

export const PRODUCT_CTAS = {
  startTrial: "Start Pro for $0.99 for 7 days",
  comparePlans: "Compare Plans",
  upgradeToPro: "Upgrade to Pro",
  tryProFree: "Start Pro for $0.99",
  subscribeToPro: "Subscribe to Pro",
} as const;

export const PRODUCT_VALUE_PROP = {
  main: "Track every OPT deadline before it becomes a problem.",
  headline: "Never miss an OPT deadline",
  subhead:
    "Know your filing window, unemployment days, and STEM deadlines in one place.",
} as const;

export const PLAN_DISPLAY_NAMES = {
  free: "Free",
  pro: "Pro",
  dedicated: "Dedicated",
  proMember: "Pro Member",
} as const;

export const REMINDER_MESSAGING = {
  panelHeadline: "Get daily reminders before OPT deadlines become urgent",
  panelSubhead:
    "Every morning at 9:00 AM ET, TrackMyOPT emails you the dates, clocks, and actions that need attention.",
  sampleEmailSubject: "TrackMyOPT — unemployment alert",
  sampleEmailBody:
    "You have 28 unemployment days remaining on OPT. Log your job or update employment to stay organized.",
  toolUpsellHeadline: "Daily reminders at 9:00 AM ET (Pro)",
  toolUpsellSubhead:
    "Get email and browser alerts for this tracker — filing windows, unemployment days, and STEM deadlines.",
  footerNote:
    "$0.99 for 7 days for eligible accounts · cancel anytime · reminders for all four trackers with Pro",
} as const;

export const CASE_STATUS_MESSAGING = {
  headline: "Track your USCIS case status in one place",
  subhead:
    "Add your receipt number — Free includes manual refresh; Pro adds daily auto-checks and email alerts.",
  /** Canonical Free → Pro one-liner for paywalls */
  freeProCanonical:
    "Free: track 1 case and refresh anytime. Pro: we check USCIS every day and email you when anything changes.",
  proFeatureTitle: "Pro: Daily auto-checks + email when status changes",
  proFeatureBody:
    "We check USCIS every day and email you when your status changes — so you do not have to refresh manually.",
  howItWorksNotify: "Get notified by email when your status changes (Pro)",
  upgradeForAutoChecks: "Get Pro for daily auto-checks",
  autoMonitorOffHint: "Manual refresh only — daily auto-check is Pro",
  packagingChangeNotice:
    "Free includes manual refresh. Daily USCIS auto-checks and status-change emails are on Pro.",
  statusChangeHeadline: "Your case status changed. Alerts + daily auto-checks are on Pro.",
  statusChangeBody:
    "Free: track 1 case and refresh anytime. Pro: we check USCIS every day and email you when anything changes.",
  receiptAddedNotice:
    "We'll watch this case daily on Pro. Manual refresh stays free.",
  staleStatusNotice:
    "Status may be outdated. Auto-check daily with Pro.",
  trialCtaStrip:
    'Stop refreshing. Pro checks USCIS daily and emails you when your status changes.',
  caseInsightHeadline: 'Stop wondering where your case stands.',
  caseInsightBody:
    'Unlock a likely decision window from comparable community cases, plus daily USCIS checks and status-change emails.',
  caseInsightInlineTitle: 'The typical wait is only the headline',
  caseInsightInlineBody:
    'Unlock your likely decision window, see cases filed near yours, and let Pro watch USCIS every day.',
  caseInsightCta: 'Unlock my case insights',
  disclaimer:
    "Status data comes from USCIS. Processing times vary — check with your DSO or attorney for official guidance.",
} as const;

export const COMMUNITY_REPORTS_MESSAGING = {
  sectionTitle: "Latest community processing reports",
  sectionSubhead:
    "Recent self-reported OPT/STEM timelines from the community. Use as a planning reference — not an official USCIS estimate.",
  sourceNote:
    "Community-reported timelines · not affiliated with USCIS · not a guarantee",
} as const;

export const PLAN_OUTCOME_COPY = {
  free: "Basic tracking for one OPT timeline — calculators and clocks always free.",
  pro: "Daily reminders, deadline alerts, OPT/STEM trackers, and case monitoring in one place.",
  dedicated:
    "Everything in Pro plus higher career-tool limits, priority support, and one complimentary 60-minute initial attorney consultation per account after 7 continuous days on Dedicated.",
} as const;

export const PRO_TIPS = [
  "File early inside your eligible I-765 filing window",
  "Keep copies of your I-765, I-20, EAD, and receipt notice",
  "Report employment changes to your DSO on time",
  "Track unemployment days from your EAD start date",
] as const;
