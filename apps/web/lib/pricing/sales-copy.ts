/**
 * Conversion copy for Pro & Dedicated — single source for pricing surfaces.
 */

import {
  DEDICATED_CONSULTATION_MINUTES,
  DEDICATED_CONSULTATION_WAIT_DAYS,
  PRO_PAID_INTRO_PRICE,
  PRO_TRIAL_DAYS,
} from '@/lib/legal/legal-config';
import { isDedicatedOpenForNewPurchases } from '@/lib/pricing/dedicated-availability';

const PRICING_SOCIAL_PROOF =
  'Built for international students navigating OPT and STEM OPT';

export const PRICING_VALUE_ANCHOR =
  'Limited-time prices are applied automatically at checkout. Daily reminders and trackers help you stay organized before OPT deadlines sneak up.';

export const PRICING_MODAL = {
  badge: 'Stay on top of OPT deadlines',
  title: 'Choose the plan that fits your journey',
  subtitle: PRICING_SOCIAL_PROOF,
  valueAnchor: PRICING_VALUE_ANCHOR,
} as const;

export const PRICING_VALUE_PILLARS = [
  {
    title: 'Daily USCIS monitoring',
    description: 'Auto-checks + email when status changes',
  },
  {
    title: 'Unemployment alerts',
    description: 'Warnings before you hit the 90/150-day limits',
  },
  {
    title: 'Document vault',
    description: 'EAD, I-20, passport — with expiry reminders',
  },
] as const;

export type PaidPlanId = 'pro' | 'dedicated';

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
    tagline:
      'Daily reminders, deadline alerts, OPT/STEM trackers, and case monitoring',
    bestFor: 'Most OPT & STEM OPT students',
    highlights: [
      '9:00 AM ET email reminders for all four trackers',
      'Daily USCIS status checks + change alerts',
      'Document vault + higher resume / ATS limits',
    ],
    badge: 'Most Popular',
    guarantee: `$${PRO_PAID_INTRO_PRICE.toFixed(2)} for the first ${PRO_TRIAL_DAYS} days for eligible accounts`,
    ctaDefault: `Start ${PRO_TRIAL_DAYS} Days for $${PRO_PAID_INTRO_PRICE.toFixed(2)}`,
    ctaNoTrial: 'Get Pro',
  },
  dedicated: {
    tagline: `Everything in Pro + a complimentary ${DEDICATED_CONSULTATION_MINUTES}-minute attorney consultation`,
    bestFor:
      'Students who want priority support and access to a partnered immigration attorney',
    highlights: [
      `One complimentary ${DEDICATED_CONSULTATION_MINUTES}-minute initial attorney consultation after ${DEDICATED_CONSULTATION_WAIT_DAYS} continuous days`,
      'Higher resume and ATS capacity',
      'Priority email support',
    ],
    badge: 'Priority Support',
    guarantee: '3-day money-back on your first Dedicated charge',
    ctaDefault: 'Get Dedicated Support',
    ctaNoTrial: 'Get Dedicated Support',
  },
};

export const PLAN_PICKER_GUIDE = {
  title: 'Not sure which plan?',
  proLine:
    'Choose Pro if you want automated USCIS monitoring, unemployment alerts, and career tools — most students start here.',
  /** Shown only while Dedicated is open for new purchases. */
  dedicatedLine: `Choose Dedicated for priority support, higher career-tool capacity, and one complimentary ${DEDICATED_CONSULTATION_MINUTES}-minute initial attorney consultation per account.`,
} as const;

export const LANDING_PLAN_COPY = {
  free: {
    description:
      'Basic tracking for one OPT timeline — calculators and clocks always free.',
    users: 'Forever free',
    buttonLabel: 'Create Free Account',
  },
  pro: {
    description:
      'Daily reminders, unemployment alerts, and USCIS status monitoring in one place.',
    users: `$${PRO_PAID_INTRO_PRICE.toFixed(2)} for ${PRO_TRIAL_DAYS} days, then the limited-time subscription price · eligible accounts`,
    buttonLabel: `Start for $${PRO_PAID_INTRO_PRICE.toFixed(2)}`,
  },
  dedicated: {
    // Attorney wording stays narrow: we schedule the consultation, the
    // attorney advises. See /disclaimer §8 and plan-features.test.ts.
    description: `Pro + priority support and one complimentary ${DEDICATED_CONSULTATION_MINUTES}-minute initial consultation with a partnered immigration attorney.`,
    users: 'Priority support · 3-day money-back',
    buttonLabel: 'Get Dedicated Support',
  },
} as const;

/** Public pricing surfaces should omit Dedicated when closed for new sales. */
export function shouldShowDedicatedPlanForSale(): boolean {
  return isDedicatedOpenForNewPurchases();
}
