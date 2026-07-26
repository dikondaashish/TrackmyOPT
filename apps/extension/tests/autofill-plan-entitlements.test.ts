import assert from 'node:assert/strict';

import {
  FREE_COVER_LETTERS_MONTHLY_LIMIT,
  FREE_SCREENING_DRAFTS_MONTHLY_LIMIT,
  resolveAutofillPlanEntitlements,
  resolveAutofillPlanTier,
} from '../src/autofill-plan-entitlements';

const free = resolveAutofillPlanEntitlements('free');
assert.equal(free.manualPrefill, true);
assert.equal(free.skills, true);
assert.equal(free.privateAnswerReview, true);
assert.equal(free.continuousMode, false);
assert.equal(free.guidedAutopilot, false);
assert.equal(
  free.screeningDraftsMonthlyLimit,
  FREE_SCREENING_DRAFTS_MONTHLY_LIMIT,
);
assert.equal(
  free.coverLettersMonthlyLimit,
  FREE_COVER_LETTERS_MONTHLY_LIMIT,
);

const pro = resolveAutofillPlanEntitlements('pro');
assert.equal(pro.manualPrefill, true);
assert.equal(pro.skills, true);
assert.equal(pro.continuousMode, true);
assert.equal(pro.guidedAutopilot, true);
assert.equal(pro.screeningDraftsMonthlyLimit, null);
assert.equal(pro.coverLettersMonthlyLimit, null);

assert.equal(
  resolveAutofillPlanTier({ isPremium: false, planName: 'pro' }),
  'free',
);
assert.equal(
  resolveAutofillPlanTier({ isPremium: true, planName: 'dedicated' }),
  'dedicated',
);
assert.equal(
  resolveAutofillPlanTier({ isPremium: true, planName: 'unknown' }),
  'pro',
);

console.log(
  'autofill-plan-entitlements: Free manual value and Pro automation boundaries passed',
);
