import assert from 'node:assert/strict';
import {
  DEFAULT_AUTOFILL_PREFERENCES,
  normalizeAutofillPreferences,
} from '../src/autofill-preferences';
import { resolveAutofillFeatureFlags } from '../src/autofill-feature-flags';
import { resolveAutofillPlanEntitlements } from '../src/autofill-plan-entitlements';

assert.deepEqual(DEFAULT_AUTOFILL_PREFERENCES, {
  mode: 'step_by_step',
  autofillSkills: false,
  guidedAutopilot: false,
});

assert.deepEqual(normalizeAutofillPreferences(undefined), DEFAULT_AUTOFILL_PREFERENCES);
assert.deepEqual(normalizeAutofillPreferences({ mode: 'continuous', autofillSkills: true }), {
  mode: 'step_by_step',
  autofillSkills: true,
  guidedAutopilot: false,
});
assert.deepEqual(
  normalizeAutofillPreferences(
    { mode: 'continuous', autofillSkills: true, guidedAutopilot: true },
    resolveAutofillFeatureFlags({
      continuousMode: true,
      skills: true,
      guidedAutopilot: true,
    }),
    resolveAutofillPlanEntitlements('pro'),
  ),
  {
  mode: 'continuous',
  autofillSkills: true,
  guidedAutopilot: true,
  }
);
assert.deepEqual(
  normalizeAutofillPreferences(
    { mode: 'continuous', autofillSkills: true, guidedAutopilot: true },
    resolveAutofillFeatureFlags({
      continuousMode: true,
      skills: true,
      guidedAutopilot: true,
    }),
    resolveAutofillPlanEntitlements('free'),
  ),
  {
    mode: 'step_by_step',
    autofillSkills: true,
    guidedAutopilot: false,
  },
);
assert.deepEqual(normalizeAutofillPreferences({ mode: 'always', autofillSkills: 'yes' }), {
  mode: 'step_by_step',
  autofillSkills: false,
  guidedAutopilot: false,
});

console.log('autofill-preferences: safe defaults and strict normalization passed');
