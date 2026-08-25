/**
 * Commercial source of truth for TrackMyOPT plans.
 *
 * Keep this module data-only so server routes, client pricing surfaces, legal
 * disclosures, usage enforcement, and lifecycle emails can all import it.
 * Stripe Price IDs remain environment-specific; their amounts must match these
 * values before a pricing release is deployed.
 */

export const PLAN_PRICES = {
  free: { month: 0, year: 0 },
  pro: { month: 4.99, year: 69 },
  dedicated: { month: 14.99, year: 149.99 },
} as const;

export const PRO_PAID_INTRO = {
  price: 0.99,
  durationDays: 7,
  usesPerAccount: 1,
} as const;

export const PLAN_LIMITS = {
  free: {
    resumesPerMonth: 1,
    atsScansPerMonth: 1,
    screeningDraftsPerMonth: 2,
    coverLettersPerMonth: 1,
  },
  pro: {
    resumesPerMonth: 50,
    atsScansPerMonth: 100,
    aiWritingActionsPerMonth: 100,
  },
  dedicated: {
    resumesPerMonth: 100,
    atsScansPerMonth: 250,
    aiWritingActionsPerMonth: 100,
  },
} as const;

export const DEDICATED_ATTORNEY_BENEFIT = {
  durationMinutes: 60,
  consultationsPerAccount: 1,
  isComplimentary: true,
  minimumContinuousPlanDays: 7,
} as const;

export function annualSavingsPercent(planId: "pro" | "dedicated"): number {
  const price = PLAN_PRICES[planId];
  return Math.round((1 - price.year / (price.month * 12)) * 100);
}

export function formatPlanLimit(limit: number): string {
  return limit.toLocaleString("en-US");
}
