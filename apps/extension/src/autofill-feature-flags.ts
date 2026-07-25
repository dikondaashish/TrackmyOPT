/**
 * One rollout boundary for job-scoped autofill. These switches make completed
 * capabilities available; user preferences still keep skills, Continuous, and
 * Guided Autopilot opt-in, and every final-submit action remains prohibited.
 */
export interface AutofillFeatureFlags {
  artifactPrefill: boolean;
  skills: boolean;
  continuousMode: boolean;
  aiScreeningDrafts: boolean;
  coverLetter: boolean;
  guidedAutopilot: boolean;
  historyFields: boolean;
  atsAdapters: boolean;
}

export const AUTOFILL_FEATURE_FLAGS: Readonly<AutofillFeatureFlags> =
  Object.freeze({
    artifactPrefill: true,
    skills: true,
    continuousMode: true,
    aiScreeningDrafts: true,
    coverLetter: true,
    guidedAutopilot: true,
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
