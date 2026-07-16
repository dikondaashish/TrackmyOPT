import assert from 'node:assert/strict';
import {
  DEFAULT_AUTOFILL_PREFERENCES,
  normalizeAutofillPreferences,
} from '../src/autofill-preferences';

assert.deepEqual(DEFAULT_AUTOFILL_PREFERENCES, {
  mode: 'step_by_step',
  autofillSkills: false,
});

assert.deepEqual(normalizeAutofillPreferences(undefined), DEFAULT_AUTOFILL_PREFERENCES);
assert.deepEqual(normalizeAutofillPreferences({ mode: 'continuous', autofillSkills: true }), {
  mode: 'continuous',
  autofillSkills: true,
});
assert.deepEqual(normalizeAutofillPreferences({ mode: 'always', autofillSkills: 'yes' }), {
  mode: 'step_by_step',
  autofillSkills: false,
});

console.log('autofill-preferences: safe defaults and strict normalization passed');
