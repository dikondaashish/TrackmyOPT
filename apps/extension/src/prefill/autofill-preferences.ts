import {
  AUTOFILL_FEATURE_FLAGS,
  type AutofillFeatureFlags,
} from './autofill-feature-flags';
import {
  FREE_AUTOFILL_PLAN_ENTITLEMENTS,
  type AutofillPlanEntitlements,
} from './autofill-plan-entitlements';

export const AUTOFILL_PREFERENCES_KEY = 'autofillPreferencesV1';

export interface AutofillPreferences {
  mode: 'step_by_step' | 'continuous';
  autofillSkills: boolean;
  guidedAutopilot: boolean;
}

export const DEFAULT_AUTOFILL_PREFERENCES: Readonly<AutofillPreferences> = {
  mode: 'step_by_step',
  autofillSkills: false,
  guidedAutopilot: false,
};

/** Accept only the two documented non-sensitive preferences from storage. */
export function normalizeAutofillPreferences(
  value: unknown,
  featureFlags: Readonly<AutofillFeatureFlags> = AUTOFILL_FEATURE_FLAGS,
  planEntitlements: Readonly<AutofillPlanEntitlements> =
    FREE_AUTOFILL_PLAN_ENTITLEMENTS,
): AutofillPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_AUTOFILL_PREFERENCES };
  }
  const candidate = value as Record<string, unknown>;
  const mode =
    featureFlags.continuousMode &&
    planEntitlements.continuousMode &&
    candidate.mode === 'continuous'
      ? 'continuous'
      : 'step_by_step';
  return {
    mode,
    autofillSkills: featureFlags.skills && candidate.autofillSkills === true,
    guidedAutopilot:
      featureFlags.guidedAutopilot &&
      planEntitlements.guidedAutopilot &&
      featureFlags.continuousMode &&
      mode === 'continuous' &&
      candidate.guidedAutopilot === true,
  };
}
