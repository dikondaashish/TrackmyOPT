/**
 * Shared product messaging — CTAs, upsells, disclaimers.
 * User-facing strings only. Plan tier in code may still use `isPremium`.
 */

export const PRODUCT_CTAS = {
  startTrial: "Start 7-Day Free Trial",
  comparePlans: "Compare Plans",
  upgradeToPro: "Upgrade to Pro",
  tryProFree: "Try Pro Free",
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
    "7-day free trial · cancel anytime · reminders for all four trackers with Pro",
} as const;

export const CASE_STATUS_MESSAGING = {
  headline: "Track your USCIS case status in one place",
  subhead:
    "Add your receipt number and we'll help you monitor status changes with daily checks (Pro).",
  proFeatureTitle: "Pro: Email when your status changes",
  proFeatureBody:
    "Get an email when USCIS posts a new status on your case — so you can review updates and talk to your DSO if needed.",
  howItWorksNotify: "Get notified by email when your status changes (Pro)",
  upgradeForAutoChecks: "Upgrade to Pro for daily auto-checks",
  disclaimer:
    "Status data comes from USCIS. Processing times vary — check with your DSO or attorney for official guidance.",
} as const;

export const COMMUNITY_REPORTS_MESSAGING = {
  sectionTitle: "Latest community processing reports",
  sectionSubhead:
    "Recent self-reported OPT/STEM timelines from the community. Use as a planning reference — not an official USCIS estimate.",
  sourceNote: "Self-reported community data · not a USCIS guarantee",
} as const;

export const PLAN_OUTCOME_COPY = {
  free: "Basic tracking for one OPT timeline — calculators and clocks always free.",
  pro: "Daily reminders, deadline alerts, OPT/STEM trackers, and case monitoring in one place.",
  dedicated:
    "Everything in Pro plus guided support. Legal advice, when included, comes from independent attorneys — not from TrackMyOPT.",
} as const;

export const PRO_TIPS = [
  "File early inside your eligible I-765 filing window",
  "Keep copies of your I-765, I-20, EAD, and receipt notice",
  "Report employment changes to your DSO on time",
  "Track unemployment days from your EAD start date",
] as const;
