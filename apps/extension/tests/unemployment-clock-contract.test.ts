import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { summarizeUnemploymentClock } from '../src/unemployment-clock-contract';

assert.deepEqual(
  summarizeUnemploymentClock({
    active: true,
    used: 90,
    max: 150,
    remaining: 60,
    phase: 'stem',
  }),
  {
    headline: '60 days remaining',
    usage: '90 / 150 cumulative unemployment days used',
    phaseLabel: 'STEM OPT cumulative limit',
  },
);

assert.deepEqual(
  summarizeUnemploymentClock({
    active: true,
    used: 12,
    max: 90,
    remaining: 78,
    phase: 'initial',
  }),
  {
    headline: '78 days remaining',
    usage: '12 / 90 unemployment days used',
    phaseLabel: 'Initial OPT limit',
  },
);

const optTracker = readFileSync('src/pages/clock-tracker.ts', 'utf8');
const stemTracker = readFileSync('src/pages/stem-clock-tracker.ts', 'utf8');
assert.doesNotMatch(optTracker, /setDate\(endDate\.getDate\(\) \+ 90\)/);
assert.doesNotMatch(stemTracker, /setDate\(endDate\.getDate\(\) \+ 60\)/);

console.log('unemployment-clock-contract: verified cumulative server data only');
