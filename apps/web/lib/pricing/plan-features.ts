import { FREE_H1B_SPONSOR_LIMIT } from "@/lib/career/h1b/constants";

/**
 * Free/Pro ATS scan display caps — must match FREE_ATS_SCAN_LIMIT and
 * PRO_ATS_SCAN_LIMIT in usage-limit.ts. Do not import usage-limit here
 * (server-only cookies); keep these numbers in sync via test.
 *
 * Pro is a real 10,000/mo cap, not unlimited — no plan surface should say
 * "Unlimited" for it. See plan-features.test.ts.
 */
export const FREE_ATS_SCAN_LIMIT_DISPLAY = 3;
export const PRO_ATS_SCAN_LIMIT_DISPLAY = 10_000;
export const FREE_SCREENING_DRAFT_LIMIT_DISPLAY = 5;
export const FREE_COVER_LETTER_LIMIT_DISPLAY = 1;

function formatMonthlyLimit(limit: number): string {
  return `${limit.toLocaleString("en-US")}/mo`;
}

/**
 * Single source of truth for Free / Pro / Dedicated plan features.
 * Used by pricing modal, settings, landing page, and comparison tables.
 */

export type PlanFeatureValue = boolean | string;

export type ComparisonFeatureRow = {
  name: string;
  free: PlanFeatureValue;
  pro: PlanFeatureValue;
  dedicated: PlanFeatureValue;
};

export type ComparisonCategory = {
  category: string;
  features: ComparisonFeatureRow[];
};

export type PlanCardFeature = {
  text: string;
  included: boolean;
  isHeader: boolean;
};

/** Full comparison grid (PricingData / PricingDetailedComparison). */
export const PLAN_COMPARISON_FEATURES: ComparisonCategory[] = [
  {
    category: "Immigration & OPT Tools",
    features: [
      { name: "OPT Filing Window Calculator", free: true, pro: true, dedicated: true },
      { name: "OPT 90-Day Unemployment Tracker", free: true, pro: true, dedicated: true },
      { name: "STEM Extension Calculator", free: true, pro: true, dedicated: true },
      { name: "Cumulative STEM Unemployment Tracker", free: true, pro: true, dedicated: true },
      { name: "OPT Dates & Timeline Dashboard", free: true, pro: true, dedicated: true },
      { name: "Employment Span Tracking", free: true, pro: true, dedicated: true },
      { name: "Daily 9AM Email Reminders (OPT tools)", free: false, pro: true, dedicated: true },
    ],
  },
  {
    category: "USCIS Case Tracking",
    features: [
      { name: "Manual Case Status Check", free: true, pro: true, dedicated: true },
      { name: "Track Multiple USCIS Cases", free: "1 case", pro: "Up to 8", dedicated: "Up to 8" },
      { name: "Browser Push Case Alerts", free: false, pro: true, dedicated: true },
      { name: "OPT Approval Community Stats", free: true, pro: true, dedicated: true },
      { name: "Daily USCIS Auto-Checks", free: false, pro: true, dedicated: true },
      { name: "Daily Status Change Alerts", free: false, pro: true, dedicated: true },
    ],
  },
  {
    category: "H-1B Sponsor Data",
    features: [
      {
        name: `Browse ${FREE_H1B_SPONSOR_LIMIT} Companies`,
        free: true,
        pro: true,
        dedicated: true,
      },
      { name: "Unlimited Company Access", free: false, pro: true, dedicated: true },
      { name: "Approval Rate & Sponsor Analytics", free: false, pro: true, dedicated: true },
    ],
  },
  {
    category: "Career Tools",
    features: [
      { name: "Job Application Tracker", free: true, pro: true, dedicated: true },
      {
        name: "Chrome Application Prefill",
        free: "Step-by-step",
        pro: "Continuous",
        dedicated: "Continuous",
      },
      { name: "Skills & Work-History Prefill", free: true, pro: true, dedicated: true },
      {
        name: "Guided Autopilot (Never Submits)",
        free: false,
        pro: true,
        dedicated: true,
      },
      {
        name: "AI Screening-Question Drafts",
        free: `${FREE_SCREENING_DRAFT_LIMIT_DISPLAY}/mo`,
        pro: "Shared AI limit: 25/day",
        dedicated: "Shared AI limit: 25/day",
      },
      {
        name: "AI Cover Letters",
        free: `${FREE_COVER_LETTER_LIMIT_DISPLAY}/mo`,
        pro: "Shared AI limit: 25/day",
        dedicated: "Shared AI limit: 25/day",
      },
      { name: "AI Resume Generator", free: "5/mo", pro: "500/mo", dedicated: "1000/mo" },
      {
        name: "ATS Resume Scanner",
        free: `${FREE_ATS_SCAN_LIMIT_DISPLAY}/mo`,
        pro: formatMonthlyLimit(PRO_ATS_SCAN_LIMIT_DISPLAY),
        dedicated: formatMonthlyLimit(PRO_ATS_SCAN_LIMIT_DISPLAY),
      },
      { name: "Saved Resumes Library", free: true, pro: true, dedicated: true },
    ],
  },
  {
    category: "Documents & Reminders",
    features: [
      { name: "Basic In-App Notifications", free: true, pro: true, dedicated: true },
      { name: "Secure Document Vault", free: false, pro: true, dedicated: true },
      { name: "Document Expiry Reminders", free: false, pro: true, dedicated: true },
    ],
  },
  {
    category: "Platform & Partners",
    features: [
      { name: "Full Dashboard Access", free: true, pro: true, dedicated: true },
      { name: "Chrome Extension", free: true, pro: true, dedicated: true },
      { name: "Health Insurance Finder", free: true, pro: true, dedicated: true },
      { name: "Tax Filing Resources", free: true, pro: true, dedicated: true },
      { name: "Sprintax Partner Coupon ($20 value)", free: true, pro: true, dedicated: true },
    ],
  },
  {
    category: "Dedicated Support",
    features: [
      { name: "Higher resume quota (1000/mo)", free: false, pro: false, dedicated: true },
      { name: "Priority email support", free: false, pro: false, dedicated: true },
      { name: "Personalized support plan", free: false, pro: false, dedicated: true },
      // Scheduling help only. TrackMyOPT is not a law firm and gives no legal
      // advice — /disclaimer §8 describes the arrangement in full. Keep this
      // wording narrow; plan-features.test.ts blocks stronger claims.
      {
        name: "Immigration attorney consultation scheduling",
        free: false,
        pro: false,
        dedicated: true,
      },
    ],
  },
];

/** Compact feature list for pricing modal plan cards. */
export const FREE_PLAN_CARD_FEATURES: PlanCardFeature[] = [
  { text: "Immigration & OPT tools", included: true, isHeader: true },
  { text: "OPT Filing Window Calculator", included: true, isHeader: false },
  { text: "OPT 90-Day Unemployment Tracker", included: true, isHeader: false },
  { text: "STEM Extension Calculator", included: true, isHeader: false },
  { text: "Cumulative STEM Unemployment Tracker", included: true, isHeader: false },
  { text: "OPT Dates & Timeline Dashboard", included: true, isHeader: false },
  { text: "Tracking & career", included: true, isHeader: true },
  { text: "USCIS Case Status (Manual)", included: true, isHeader: false },
  { text: "OPT Approval Community Stats", included: true, isHeader: false },
  {
    text: `H-1B Sponsors (${FREE_H1B_SPONSOR_LIMIT} Companies)`,
    included: true,
    isHeader: false,
  },
  { text: "Job Application Tracker", included: true, isHeader: false },
  { text: "Chrome Prefill (Step-by-step + Skills)", included: true, isHeader: false },
  {
    text: `AI Screening Drafts (${FREE_SCREENING_DRAFT_LIMIT_DISPLAY}/mo)`,
    included: true,
    isHeader: false,
  },
  {
    text: `AI Cover Letter (${FREE_COVER_LETTER_LIMIT_DISPLAY}/mo)`,
    included: true,
    isHeader: false,
  },
  { text: "Resume Generator (5/mo)", included: true, isHeader: false },
  {
    text: `ATS Resume Scanner (${FREE_ATS_SCAN_LIMIT_DISPLAY}/mo)`,
    included: true,
    isHeader: false,
  },
  { text: "Platform & partners", included: true, isHeader: true },
  { text: "Full Dashboard + Chrome Extension", included: true, isHeader: false },
  { text: "Health Insurance & Tax Resources", included: true, isHeader: false },
  { text: "Sprintax Partner Coupon ($20)", included: true, isHeader: false },
];

export const PRO_PLAN_CARD_FEATURES: PlanCardFeature[] = [
  { text: "Everything in Free, plus:", included: true, isHeader: true },
  { text: "Automation & reminders", included: true, isHeader: true },
  { text: "Daily 9AM Email Reminders", included: true, isHeader: false },
  { text: "USCIS monitoring", included: true, isHeader: true },
  { text: "Daily USCIS Auto-Checks", included: true, isHeader: false },
  { text: "Daily Status Change Alerts", included: true, isHeader: false },
  { text: "Career & documents", included: true, isHeader: true },
  { text: "Continuous Chrome Prefill", included: true, isHeader: false },
  { text: "Guided Autopilot (Never Submits)", included: true, isHeader: false },
  { text: "Higher Daily AI Draft + Cover-Letter Access", included: true, isHeader: false },
  { text: "H-1B Sponsors (Unlimited + Analytics)", included: true, isHeader: false },
  { text: "Resume Generator (500/mo)", included: true, isHeader: false },
  { text: `ATS Scanner (${formatMonthlyLimit(PRO_ATS_SCAN_LIMIT_DISPLAY)})`, included: true, isHeader: false },
  { text: "Document Vault + Expiry Reminders", included: true, isHeader: false },
];

export const DEDICATED_PLAN_CARD_FEATURES: PlanCardFeature[] = [
  { text: "Everything in Pro, plus:", included: true, isHeader: true },
  { text: "Resume Generator (1000/mo)", included: true, isHeader: false },
  { text: "Priority email support", included: true, isHeader: false },
  { text: "Personalized support plan", included: true, isHeader: false },
];

/** Settings subscription page plan card bullets. */
export const FREE_PLAN_BULLETS: string[] = FREE_PLAN_CARD_FEATURES.filter(
  (f) => !f.isHeader
).map((f) => f.text);

export const PRO_PLAN_BULLETS: string[] = [
  "Everything in Free",
  ...PRO_PLAN_CARD_FEATURES.filter((f) => !f.isHeader && !f.text.startsWith("Everything")).map(
    (f) => f.text
  ),
];

export const DEDICATED_PLAN_BULLETS: string[] = [
  "Everything in Pro",
  ...DEDICATED_PLAN_CARD_FEATURES.filter(
    (f) => !f.isHeader && !f.text.startsWith("Everything")
  ).map((f) => f.text),
];

export type LandingPlanFeature = {
  label: string;
  included: boolean;
  isHeader?: boolean;
  tooltip?: string;
};

export const LANDING_FREE_FEATURES: LandingPlanFeature[] = [
  { label: "Core Immigration Tools", included: true, isHeader: true },
  { label: "OPT Filing Window Calculator", included: true, tooltip: "Calculate your I-765 filing window" },
  { label: "OPT 90-Day Unemployment Tracker", included: true, tooltip: "Track your 90-day unemployment limit" },
  { label: "STEM Extension Calculator", included: true, tooltip: "Calculate your STEM extension filing window" },
  { label: "Cumulative STEM Unemployment Tracker", included: true, tooltip: "Track the 150-day aggregate limit across initial OPT and STEM OPT" },
  { label: "OPT Dates & Timeline Dashboard", included: true },
  { label: "Tracking & Insights", included: true, isHeader: true },
  { label: "OPT Approval Community Stats", included: true, tooltip: "Community-driven approval trends" },
  { label: "USCIS Case Status (Manual Check)", included: true },
  {
    label: `H-1B Sponsor Data (${FREE_H1B_SPONSOR_LIMIT} Companies)`,
    included: true,
  },
  { label: "Career Tools", included: true, isHeader: true },
  { label: "Job Application Tracker", included: true },
  { label: "Chrome Prefill (Step-by-step + Skills)", included: true },
  {
    label: `AI Screening Drafts (${FREE_SCREENING_DRAFT_LIMIT_DISPLAY}/mo)`,
    included: true,
  },
  {
    label: `AI Cover Letter (${FREE_COVER_LETTER_LIMIT_DISPLAY}/mo)`,
    included: true,
  },
  { label: "Resume Generator (5/mo)", included: true },
  {
    label: `ATS Resume Scanner (${FREE_ATS_SCAN_LIMIT_DISPLAY}/mo)`,
    included: true,
  },
  { label: "Saved Resumes Library", included: true },
  { label: "Platform Access", included: true, isHeader: true },
  { label: "Full Dashboard Access", included: true },
  { label: "Chrome Extension", included: true },
  { label: "Basic In-App Notifications", included: true },
  { label: "Extras", included: true, isHeader: true },
  { label: "Health Insurance Finder", included: true },
  { label: "Tax Filing Resources", included: true },
  { label: "Sprintax Partner Coupon ($20 value)", included: true },
];

export const LANDING_PRO_FEATURES: LandingPlanFeature[] = [
  { label: "Everything in Free, plus:", included: true },
  { label: "Smart Automation", included: true, isHeader: true },
  { label: "Daily 9AM Email Reminders", included: true, tooltip: "OPT & STEM tools with scheduled email updates" },
  { label: "USCIS Case Tracker", included: true, isHeader: true },
  { label: "Daily Auto-Checks", included: true, tooltip: "Scheduled daily case status checks" },
  { label: "Daily Status Change Alerts", included: true, tooltip: "Email when we detect changes on scheduled checks" },
  { label: "Enhanced Insights", included: true, isHeader: true },
  { label: "H-1B Sponsor Data (Unlimited)", included: true },
  { label: "Approval Rate & Sponsor Analytics", included: true },
  { label: "Secure Storage", included: true, isHeader: true },
  { label: "Document Vault", included: true, tooltip: "Secure document storage with passcode" },
  { label: "Document Expiry Reminders", included: true, tooltip: "Alerts before document expiration" },
  { label: "Career Tools", included: true, isHeader: true },
  { label: "Continuous Chrome Prefill", included: true },
  { label: "Guided Autopilot (Never Submits)", included: true },
  { label: "Higher Daily AI Draft + Cover-Letter Access", included: true },
  { label: "Resume Generator (500/mo)", included: true },
  { label: `ATS Scanner (${formatMonthlyLimit(PRO_ATS_SCAN_LIMIT_DISPLAY)})`, included: true },
];

export const LANDING_DEDICATED_FEATURES: LandingPlanFeature[] = [
  { label: "Everything in Pro", included: true },
  { label: "Resume Generator (1000/mo)", included: true },
  { label: "Priority email support", included: true },
  { label: "Personalized support plan", included: true, tooltip: "Tailored product support for your OPT workflow" },
];

export function getPlanCardFeatures(planId: "free" | "pro" | "dedicated"): PlanCardFeature[] {
  switch (planId) {
    case "pro":
      return PRO_PLAN_CARD_FEATURES;
    case "dedicated":
      return DEDICATED_PLAN_CARD_FEATURES;
    default:
      return FREE_PLAN_CARD_FEATURES;
  }
}

export function getPlanBullets(planId: "free" | "pro" | "dedicated"): string[] {
  switch (planId) {
    case "pro":
      return PRO_PLAN_BULLETS;
    case "dedicated":
      return DEDICATED_PLAN_BULLETS;
    default:
      return FREE_PLAN_BULLETS;
  }
}
