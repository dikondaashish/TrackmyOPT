import assert from 'node:assert/strict';
import {
  buildScoreComparison,
  formatDuplicateApplicationNotice,
  jobMemoryKey,
  normalizeOptClockNudge,
  recordSeenJob,
} from '../src/smart-flow';

assert.equal(
  jobMemoryKey({
    companyName: ' Stripe ',
    roleTitle: 'Frontend Engineer',
    jobUrl: 'https://jobs.example.com/123#details',
  }),
  'https://jobs.example.com/123|stripe|frontend engineer',
  'job memory is stable across URL fragments and casing',
);

assert.deepEqual(
  recordSeenJob(['older'], 'current', 2),
  { alreadySeen: false, keys: ['current', 'older'] },
  'new suggestions are recorded with a bounded history',
);
assert.deepEqual(
  recordSeenJob(['current', 'older'], 'current', 2),
  { alreadySeen: true, keys: ['current', 'older'] },
  'the same job is never suggested twice',
);

assert.equal(
  formatDuplicateApplicationNotice({
    roleTitle: 'Frontend Engineer',
    companyName: 'Stripe',
    appliedAt: '2026-05-03',
  }).dateLabel,
  'May 3',
  'duplicate dates use a concise stable label',
);

assert.deepEqual(
  normalizeOptClockNudge({ active: true, remaining: 42, used: 48, max: 90, phase: 'initial' }),
  { active: true, remaining: 42, used: 48, max: 90, phase: 'initial' },
  'valid active OPT clock data is accepted',
);
assert.equal(normalizeOptClockNudge({ active: false, remaining: 42 }), null);
assert.equal(normalizeOptClockNudge({ active: true, remaining: -1, used: 91, max: 90 }), null);

assert.deepEqual(
  buildScoreComparison(62.4, 88.6),
  { baseline: 62, generated: 89, delta: 27, improved: true },
  'ATS comparison normalizes both scores and reports the improvement',
);
assert.equal(buildScoreComparison(undefined, 84)?.baseline, undefined);

console.log('smart-flow: memory, duplicate, OPT nudge, and score comparison passed');
