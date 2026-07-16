export const AUTOFILL_PREFERENCES_KEY = 'autofillPreferencesV1';

export interface AutofillPreferences {
  mode: 'step_by_step' | 'continuous';
  autofillSkills: boolean;
}

export const DEFAULT_AUTOFILL_PREFERENCES: Readonly<AutofillPreferences> = {
  mode: 'step_by_step',
  autofillSkills: false,
};

/** Accept only the two documented non-sensitive preferences from storage. */
export function normalizeAutofillPreferences(value: unknown): AutofillPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_AUTOFILL_PREFERENCES };
  }
  const candidate = value as Record<string, unknown>;
  return {
    mode: candidate.mode === 'continuous' ? 'continuous' : 'step_by_step',
    autofillSkills: candidate.autofillSkills === true,
  };
}
