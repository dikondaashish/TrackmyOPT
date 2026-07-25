import assert from 'node:assert/strict';
import {
  formatPrefillCoverageSummary,
  summarizePrefillOutcomes,
} from '../src/prefill-coverage';

const result = summarizePrefillOutcomes([
  { filled: true, fieldGroup: 'resume' },
  { filled: true, fieldGroup: 'cover_letter' },
  { filled: true, fieldGroup: 'contact' },
  { filled: true, fieldGroup: 'contact' },
  { filled: true, fieldGroup: 'skills' },
  { needsUser: true, groupKey: 'radio:work-auth', selector: '[data-tmo-prefill-target="a"]' },
  { needsUser: true, groupKey: 'radio:work-auth', selector: '[data-tmo-prefill-target="b"]' },
  { needsUser: true, fieldGroup: 'skills', groupKey: 'field:skills', selector: '[data-tmo-prefill-target="c"]' },
  { needsUser: false, groupKey: 'field:optional' },
]);

assert.deepEqual(result, {
  filled: 5,
  skipped: 2,
  total: 7,
  groups: {
    resume: { filled: 1, skipped: 0, total: 1 },
    cover_letter: { filled: 1, skipped: 0, total: 1 },
    contact: { filled: 2, skipped: 0, total: 2 },
    skills: { filled: 1, skipped: 1, total: 2 },
    experience: { filled: 0, skipped: 0, total: 0 },
    education: { filled: 0, skipped: 0, total: 0 },
  },
  firstSkippedSelector: '[data-tmo-prefill-target="a"]',
});

assert.deepEqual(summarizePrefillOutcomes([]), {
  filled: 0,
  skipped: 0,
  total: 0,
  groups: {
    resume: { filled: 0, skipped: 0, total: 0 },
    cover_letter: { filled: 0, skipped: 0, total: 0 },
    contact: { filled: 0, skipped: 0, total: 0 },
    skills: { filled: 0, skipped: 0, total: 0 },
    experience: { filled: 0, skipped: 0, total: 0 },
    education: { filled: 0, skipped: 0, total: 0 },
  },
});

assert.equal(
  formatPrefillCoverageSummary(result),
  'Resume attached · Cover letter attached · 2 contact fields · 1 skills field filled · 2 need you',
);

const historyResult = summarizePrefillOutcomes([
  { filled: true, fieldGroup: 'experience' },
  { filled: true, fieldGroup: 'experience' },
  { filled: true, fieldGroup: 'education' },
]);
historyResult.remainingRecords = { experience: 2, education: 0 };
assert.equal(
  formatPrefillCoverageSummary(historyResult),
  '2 experience fields filled · 1 education field filled · 2 more experience entries are ready. Add another row, then click Prefill again. · ready to review',
);

console.log('prefill-coverage: grouped counts, radio dedupe, and jump target passed');
