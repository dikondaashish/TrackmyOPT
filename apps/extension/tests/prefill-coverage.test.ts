import assert from 'node:assert/strict';
import { summarizePrefillOutcomes } from '../src/prefill-coverage';

const result = summarizePrefillOutcomes([
  { filled: true },
  { filled: true },
  { needsUser: true, groupKey: 'radio:work-auth', selector: '[data-tmo-prefill-target="a"]' },
  { needsUser: true, groupKey: 'radio:work-auth', selector: '[data-tmo-prefill-target="b"]' },
  { needsUser: true, groupKey: 'field:cover-letter', selector: '[data-tmo-prefill-target="c"]' },
  { needsUser: false, groupKey: 'field:optional' },
]);

assert.deepEqual(result, {
  filled: 2,
  skipped: 2,
  total: 4,
  firstSkippedSelector: '[data-tmo-prefill-target="a"]',
});

assert.deepEqual(summarizePrefillOutcomes([]), {
  filled: 0,
  skipped: 0,
  total: 0,
});

console.log('prefill-coverage: counting, radio dedupe, and jump target passed');
