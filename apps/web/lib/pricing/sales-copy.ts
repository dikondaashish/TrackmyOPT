/**
 * Conversion copy for Pro & Dedicated — single source for pricing surfaces.
 */

import { PRO_TRIAL_DAYS } from "@/lib/legal/legal-config";
import { isDedicatedOpenForNewPurchases } from "@/lib/pricing/dedicated-availability";

export const PRICING_SOCIAL_PROOF =
  "Join 2,500+ international students who trust TrackMyOPT";

export const PRICING_VALUE_ANCHOR =
  "Pro costs less than one lunch per month. Daily reminders and trackers help you stay organized before OPT deadlines sneak up.";

export const PRICING_MODAL = {
  badge: "Stay on top of OPT deadlines",
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
    tagline: "Daily reminders, deadline alerts, OPT/STEM trackers, and case monitoring",
    bestFor: "Most OPT & STEM OPT students",
    highlights: [
      "9:00 AM ET email reminders for all four trackers",
      "Daily USCIS status checks + change alerts",
      "Document vault + higher resume / ATS limits",
    ],
    badge: "Most Popular",
    ctaDefault: `Start ${PRO_TRIAL_DAYS}-Day Free Trial`,
    ctaNoTrial: "Subscribe to Pro",
  },
  dedicated: {
    tagline: "Everything in Pro + higher quotas & priority support",
    bestFor: "Students who want more resume capacity and faster email support",
    highlights: [
      "Resume generator up to 1000/mo",
      "Priority email support",
      "Personalized support plan",
    ],
    badge: "Priority Support",
    guarantee: "3-day money-back on your first paid month",
    ctaDefault: "Get Dedicated Support",
    ctaNoTrial: "Get Dedicated Support",
  },
};

export const PLAN_PICKER_GUIDE = {
  title: "Not sure which plan?",
  proLine:
    "Choose Pro if you want automated USCIS monitoring, unemployment alerts, and career tools — most students start here.",
  /** Shown only while Dedicated is open for new purchases. */
  dedicatedLine:
    "Choose Dedicated if you want higher resume quotas and priority email support on top of Pro.",
} as const;

export const LANDING_PLAN_COPY = {
  free: {
    description: "Basic tracking for one OPT timeline — calculators and clocks always free.",
    users: "Forever free",
    buttonLabel: "Create Free Account",
  },
  pro: {
    description: "Daily reminders, unemployment alerts, and USCIS status monitoring in one place.",
    users: `${PRO_TRIAL_DAYS}-day free trial · cancel anytime`,
    buttonLabel: `Start ${PRO_TRIAL_DAYS}-Day Free Trial`,
  },
  dedicated: {
    // Attorney wording stays narrow: we schedule the consultation, the
    // attorney advises. See /disclaimer §8 and plan-features.test.ts.
    description:
      "Pro + higher resume quota, priority email support, and help scheduling an immigration attorney consultation.",
    users: "Priority support · 3-day money-back",
    buttonLabel: "Get Dedicated Support",
  },
} as const;

/** Public pricing surfaces should omit Dedicated when closed for new sales. */
export function shouldShowDedicatedPlanForSale(): boolean {
  return isDedicatedOpenForNewPurchases();
}
