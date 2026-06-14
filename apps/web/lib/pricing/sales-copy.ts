/**
 * Conversion copy for Pro & Dedicated — single source for pricing surfaces.
 */

export const PRICING_SOCIAL_PROOF =
  "Join 2,500+ international students who trust TrackMyOPT";

export const PRICING_VALUE_ANCHOR =
  "Pro costs less than one lunch per month. A single missed USCIS deadline or unemployment miscount can end your work authorization.";

export const PRICING_MODAL = {
  badge: "Protect your OPT status",
  title: "Choose the plan that fits your journey",
  subtitle: PRICING_SOCIAL_PROOF,
  valueAnchor: PRICING_VALUE_ANCHOR,
} as const;

export const PRICING_VALUE_PILLARS = [
  {
    title: "Daily USCIS monitoring",
    description: "Auto-checks + email when status changes",
  },
  {
    title: "Unemployment alerts",
    description: "Warnings before you hit the 90/150-day limits",
  },
  {
    title: "Document vault",
    description: "EAD, I-20, passport — with expiry reminders",
  },
] as const;

export type PaidPlanId = "pro" | "dedicated";

export const PLAN_SALES_META: Record<
  PaidPlanId,
  {
    tagline: string;
    bestFor: string;
    highlights: string[];
    badge?: string;
    guarantee?: string;
    ctaDefault: string;
    ctaNoTrial: string;
  }
> = {
  pro: {
    tagline: "Automated OPT compliance — deadlines, unemployment & USCIS",
    bestFor: "Most OPT & STEM OPT students",
    highlights: [
      "Daily USCIS auto-checks + status alerts",
      "9AM email reminders & unemployment tracking",
      "Unlimited jobs, resumes & document vault",
    ],
    badge: "Most Popular",
    ctaDefault: "Start 7-Day Free Trial",
    ctaNoTrial: "Subscribe to Pro",
  },
  dedicated: {
    tagline: "Everything in Pro + attorney access & white-glove support",
    bestFor: "RFEs, complex cases, or H-1B/STEM planning",
    highlights: [
      "1 hr/month with licensed immigration attorney",
      "Application completeness review",
      "24/7 dedicated + priority support",
    ],
    badge: "Attorney-Backed",
    guarantee: "3-day money-back on your first paid month",
    ctaDefault: "Get Dedicated Support",
    ctaNoTrial: "Get Dedicated Support",
  },
};

export const PLAN_PICKER_GUIDE = {
  title: "Not sure which plan?",
  proLine:
    "Choose Pro if you want automated USCIS monitoring, unemployment alerts, and career tools — most students start here.",
  dedicatedLine:
    "Choose Dedicated if you want monthly attorney access, hands-on application review, or priority support for a complex case.",
} as const;

export const LANDING_PLAN_COPY = {
  free: {
    description: "Core OPT timelines & calculators — always free.",
    users: "Forever free",
    buttonLabel: "Create Free Account",
  },
  pro: {
    description: "Never miss a USCIS deadline or unemployment day again.",
    users: "7-day free trial · cancel anytime",
    buttonLabel: "Start 7-Day Free Trial",
  },
  dedicated: {
    description: "Pro + monthly attorney session for complex immigration questions.",
    users: "1-hr attorney session included monthly",
    buttonLabel: "Get Dedicated Support",
  },
} as const;
