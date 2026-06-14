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
      { name: "STEM 60-Day Unemployment Tracker", free: true, pro: true, dedicated: true },
      { name: "OPT Dates & Timeline Dashboard", free: true, pro: true, dedicated: true },
      { name: "Employment Span Tracking", free: true, pro: true, dedicated: true },
      { name: "Daily 9AM Email Reminders (OPT tools)", free: false, pro: true, dedicated: true },
      { name: "Smart Suggestions & Auto-Tracking", free: false, pro: true, dedicated: true },
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
      { name: "Search 100 Companies", free: true, pro: true, dedicated: true },
      { name: "Unlimited Company Access", free: false, pro: true, dedicated: true },
      { name: "Approval Rate & Sponsor Analytics", free: false, pro: true, dedicated: true },
    ],
  },
  {
    category: "Career Tools",
    features: [
      { name: "Job Application Tracker", free: "5 jobs", pro: "Unlimited", dedicated: "Unlimited" },
      { name: "AI Resume Generator", free: "5/mo", pro: "500/mo", dedicated: "1000/mo" },
      { name: "ATS Resume Scanner", free: "5/mo", pro: "Unlimited", dedicated: "Unlimited" },
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
      { name: "Chrome Extension Priority Alerts", free: false, pro: true, dedicated: true },
      { name: "Health Insurance Finder", free: true, pro: true, dedicated: true },
      { name: "Tax Filing Resources", free: true, pro: true, dedicated: true },
      { name: "Sprintax Partner Coupon ($20 value)", free: true, pro: true, dedicated: true },
      { name: "Exclusive Partner Offers", free: false, pro: true, dedicated: true },
    ],
  },
  {
    category: "Dedicated Support & Attorney Access",
    features: [
      { name: "1-on-1 Attorney Session (1 hr/mo)", free: false, pro: false, dedicated: true },
      { name: "Application Completeness Check", free: false, pro: false, dedicated: true },
      { name: "Personalized Support Plan", free: false, pro: false, dedicated: true },
      { name: "24/7 Dedicated Support", free: false, pro: false, dedicated: true },
      { name: "Priority Support Responses", free: false, pro: false, dedicated: true },
    ],
  },
];

/** Compact feature list for pricing modal plan cards. */
export const FREE_PLAN_CARD_FEATURES: PlanCardFeature[] = [
  { text: "Immigration & OPT tools", included: true, isHeader: true },
  { text: "OPT Filing Window Calculator", included: true, isHeader: false },
  { text: "OPT 90-Day Unemployment Tracker", included: true, isHeader: false },
  { text: "STEM Extension Calculator", included: true, isHeader: false },
  { text: "STEM 60-Day Unemployment Tracker", included: true, isHeader: false },
  { text: "OPT Dates & Timeline Dashboard", included: true, isHeader: false },
  { text: "Tracking & career", included: true, isHeader: true },
  { text: "USCIS Case Status (Manual)", included: true, isHeader: false },
  { text: "OPT Approval Community Stats", included: true, isHeader: false },
  { text: "H-1B Sponsors (100 Companies)", included: true, isHeader: false },
  { text: "Job Tracker (5 Jobs)", included: true, isHeader: false },
  { text: "Resume Generator (5/mo)", included: true, isHeader: false },
  { text: "ATS Resume Scanner (5/mo)", included: true, isHeader: false },
  { text: "Platform & partners", included: true, isHeader: true },
  { text: "Full Dashboard + Chrome Extension", included: true, isHeader: false },
  { text: "Health Insurance & Tax Resources", included: true, isHeader: false },
  { text: "Sprintax Partner Coupon ($20)", included: true, isHeader: false },
];

export const PRO_PLAN_CARD_FEATURES: PlanCardFeature[] = [
  { text: "Everything in Free, plus:", included: true, isHeader: true },
  { text: "Automation & reminders", included: true, isHeader: true },
  { text: "Daily 9AM Email Reminders", included: true, isHeader: false },
  { text: "Smart Suggestions & Auto-Tracking", included: true, isHeader: false },
  { text: "USCIS monitoring", included: true, isHeader: true },
  { text: "Daily USCIS Auto-Checks", included: true, isHeader: false },
  { text: "Daily Status Change Alerts", included: true, isHeader: false },
  { text: "Career & documents", included: true, isHeader: true },
  { text: "H-1B Sponsors (Unlimited + Analytics)", included: true, isHeader: false },
  { text: "Unlimited Job Tracker", included: true, isHeader: false },
  { text: "Resume Generator (500/mo)", included: true, isHeader: false },
  { text: "ATS Scanner (Unlimited)", included: true, isHeader: false },
  { text: "Document Vault + Expiry Reminders", included: true, isHeader: false },
  { text: "Chrome Extension Priority Alerts", included: true, isHeader: false },
  { text: "Exclusive Partner Offers", included: true, isHeader: false },
];

export const DEDICATED_PLAN_CARD_FEATURES: PlanCardFeature[] = [
  { text: "Everything in Pro, plus:", included: true, isHeader: true },
  { text: "Resume Generator (1000/mo)", included: true, isHeader: false },
  { text: "Attorney & support", included: true, isHeader: true },
  { text: "1-on-1 Attorney Session (1 hr/mo)", included: true, isHeader: false },
  { text: "Application Completeness Check", included: true, isHeader: false },
  { text: "Personalized Support Plan", included: true, isHeader: false },
  { text: "24/7 Dedicated Support", included: true, isHeader: false },
  { text: "Priority Support Responses", included: true, isHeader: false },
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
  { label: "STEM 60-Day Unemployment Tracker", included: true, tooltip: "Track your 60-day unemployment limit" },
  { label: "OPT Dates & Timeline Dashboard", included: true },
  { label: "Tracking & Insights", included: true, isHeader: true },
  { label: "OPT Approval Community Stats", included: true, tooltip: "Community-driven approval trends" },
  { label: "USCIS Case Status (Manual Check)", included: true },
  { label: "H-1B Sponsor Data (100 Companies)", included: true },
  { label: "Career Tools", included: true, isHeader: true },
  { label: "Job Application Tracker (5 Jobs)", included: true },
  { label: "Resume Generator (5/mo)", included: true },
  { label: "ATS Resume Scanner (5/mo)", included: true },
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
  { label: "Smart Suggestions & Auto-Tracking", included: true },
  { label: "USCIS Case Tracker", included: true, isHeader: true },
  { label: "Daily Auto-Checks", included: true, tooltip: "Scheduled daily case status checks" },
  { label: "Daily Status Change Alerts", included: true, tooltip: "Email when we detect changes on scheduled checks" },
  { label: "Enhanced Insights", included: true, isHeader: true },
  { label: "H-1B Sponsor Data (Unlimited)", included: true },
  { label: "Approval Rate & Sponsor Analytics", included: true },
  { label: "Secure Storage", included: true, isHeader: true },
  { label: "Document Vault", included: true, tooltip: "Secure document storage with passcode" },
  { label: "Document Expiry Reminders", included: true, tooltip: "Alerts before document expiration" },
  { label: "Unlimited Career Tools", included: true, isHeader: true },
  { label: "Job Tracker (Unlimited)", included: true },
  { label: "Resume Generator (500/mo)", included: true },
  { label: "ATS Scanner (Unlimited)", included: true },
  { label: "Premium Benefits", included: true, isHeader: true },
  { label: "Chrome Extension Priority Alerts", included: true },
  { label: "Exclusive Partner Offers", included: true, tooltip: "Partner discounts and offers" },
];

export const LANDING_DEDICATED_FEATURES: LandingPlanFeature[] = [
  { label: "Everything in Pro", included: true },
  { label: "Resume Generator (1000/mo)", included: true },
  { label: "Attorney & Dedicated Support", included: true, isHeader: true },
  { label: "1-on-1 Attorney Session (1 hr/mo)", included: true, tooltip: "Independent licensed immigration attorney access" },
  { label: "Application Completeness Check", included: true },
  { label: "Personalized Support Plan", included: true, tooltip: "Tailored product support for your OPT workflow" },
  { label: "24/7 Dedicated Support", included: true },
  { label: "Priority Support Responses", included: true, tooltip: "Priority across support channels" },
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
