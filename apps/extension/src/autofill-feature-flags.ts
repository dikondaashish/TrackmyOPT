/**
 * One rollout boundary for job-scoped autofill. Defaults are deliberately
 * conservative: deterministic artifact/contact/history prefill is available,
 * while optional or unfinished behavior stays off.
 */
export interface AutofillFeatureFlags {
  artifactPrefill: boolean;
  skills: boolean;
  continuousMode: boolean;
  aiScreeningDrafts: boolean;
  coverLetter: boolean;
  historyFields: boolean;
  atsAdapters: boolean;
}

export const AUTOFILL_FEATURE_FLAGS: Readonly<AutofillFeatureFlags> =
  Object.freeze({
    artifactPrefill: true,
    skills: false,
    continuousMode: false,
    aiScreeningDrafts: false,
    coverLetter: false,
    historyFields: true,
    atsAdapters: true,
  });

/** Test/future remote-config seam; runtime callers use the safe defaults. */
export function resolveAutofillFeatureFlags(
  overrides: Partial<AutofillFeatureFlags> = {}
): Readonly<AutofillFeatureFlags> {
  const resolved = { ...AUTOFILL_FEATURE_FLAGS };
  for (const key of Object.keys(resolved) as Array<
    keyof AutofillFeatureFlags
  >) {
    if (typeof overrides[key] === 'boolean') {
      resolved[key] = overrides[key] as boolean;
    }
  }
  return Object.freeze(resolved);
}
