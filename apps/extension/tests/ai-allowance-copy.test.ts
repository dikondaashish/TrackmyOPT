import assert from 'node:assert/strict';

import {
  formatAiAllowanceCopy,
  remainingAiAllowance,
} from '../src/ai-allowance-copy';

assert.equal(
  formatAiAllowanceCopy({
    quotaPeriod: 'month',
    quotaRemaining: 4,
    dailyRemaining: 25,
  }),
  '4 AI generations left this month.',
);
assert.equal(
  formatAiAllowanceCopy({
    quotaPeriod: 'day',
    quotaRemaining: 24,
    dailyRemaining: 24,
  }),
  '24 AI generations left today.',
);
assert.equal(
  remainingAiAllowance({ dailyRemaining: 3 }),
  3,
);

console.log('ai-allowance-copy: Free monthly and Pro daily copy passed');
