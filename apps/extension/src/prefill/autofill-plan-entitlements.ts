export type AutofillPlanTier = 'free' | 'pro' | 'dedicated';

export const FREE_SCREENING_DRAFTS_MONTHLY_LIMIT = 5;
export const FREE_COVER_LETTERS_MONTHLY_LIMIT = 1;

export interface AutofillPlanEntitlements {
  planTier: AutofillPlanTier;
  manualPrefill: true;
  skills: true;
  privateAnswerReview: true;
  continuousMode: boolean;
  guidedAutopilot: boolean;
  screeningDraftsMonthlyLimit: number | null;
  coverLettersMonthlyLimit: number | null;
}

export interface PremiumStatusLike {
  isPremium?: boolean;
  planName?: string | null;
}

export function resolveAutofillPlanTier(
  status: PremiumStatusLike | null | undefined,
): AutofillPlanTier {
  if (status?.isPremium !== true) return 'free';
  return String(status.planName || '').toLowerCase() === 'dedicated'
    ? 'dedicated'
    : 'pro';
}

export function resolveAutofillPlanEntitlements(
  planTier: AutofillPlanTier,
): Readonly<AutofillPlanEntitlements> {
  const premium = planTier === 'pro' || planTier === 'dedicated';
  return Object.freeze({
    planTier,
    manualPrefill: true,
    skills: true,
    privateAnswerReview: true,
    continuousMode: premium,
    guidedAutopilot: premium,
    screeningDraftsMonthlyLimit: premium
      ? null
      : FREE_SCREENING_DRAFTS_MONTHLY_LIMIT,
    coverLettersMonthlyLimit: premium
      ? null
      : FREE_COVER_LETTERS_MONTHLY_LIMIT,
  });
}

export const FREE_AUTOFILL_PLAN_ENTITLEMENTS =
  resolveAutofillPlanEntitlements('free');
