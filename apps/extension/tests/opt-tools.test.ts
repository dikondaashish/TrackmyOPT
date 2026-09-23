import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  addDays,
  calculateFilingWindow,
  calculateStemFilingWindow,
  formatDate,
  parseDate,
  validateDateInput,
} from '../src/pages/opt-apply-date-helpers';
import {
  parseVerifiedUnemploymentClockResponse,
  summarizeUnemploymentClock,
} from '../src/unemployment-clock-contract';

function date(value: string): Date {
  const parsed = parseDate(value);
  if (!parsed) throw new Error(`Expected valid date: ${value}`);
  return parsed;
}

test('OPT/STEM date rules cover calendar validity and filing windows', () => {
  assert.equal(formatDate(date('02/29/2024')), '02/29/2024');
  assert.equal(parseDate('02/29/2025'), null);
  assert.equal(parseDate('04/31/2025'), null);
  assert.equal(parseDate('2/09/2025'), null);
  assert.equal(parseDate('02/09/25'), null);

  assert.equal(validateDateInput('a02/31/2025xyz'), '02/31/2025');
  assert.equal(validateDateInput('02292024'), '02/29/2024');
  assert.equal(validateDateInput('13/01/2025'), '13/01/2025');

  assert.equal(formatDate(addDays(date('03/01/2024'), -1)), '02/29/2024');
  assert.equal(formatDate(addDays(date('01/01/2025'), -1)), '12/31/2024');
  assert.equal(formatDate(addDays(date('12/31/2025'), 1)), '01/01/2026');

  const broadWindow = calculateFilingWindow(date('05/15/2025'), null);
  assert.equal(formatDate(broadWindow.earliestStart), '02/14/2025');
  assert.equal(formatDate(broadWindow.latestEnd), '07/14/2025');
  assert.equal(broadWindow.uscisDeadline, null);
  assert.equal(formatDate(broadWindow.filingDeadline), '07/14/2025');

  const earlyDsoWindow = calculateFilingWindow(date('05/15/2025'), date('04/01/2025'));
  assert.equal(formatDate(earlyDsoWindow.uscisDeadline!), '05/01/2025');
  assert.equal(formatDate(earlyDsoWindow.filingDeadline), '05/01/2025');

  const lateDsoWindow = calculateFilingWindow(date('05/15/2025'), date('06/20/2025'));
  assert.equal(formatDate(lateDsoWindow.uscisDeadline!), '07/20/2025');
  assert.equal(formatDate(lateDsoWindow.filingDeadline), '07/14/2025');

  const stemWindow = calculateStemFilingWindow(date('07/14/2025'));
  assert.equal(formatDate(stemWindow.earliestStart), '04/15/2025');
  assert.equal(formatDate(stemWindow.latestEnd), '07/14/2025');
});

test('verified unemployment clock contract accepts consistent payloads', () => {
  const clock = parseVerifiedUnemploymentClockResponse({
    data: {
      unemployment_clock: {
        active: true,
        used: 20,
        max: 90,
        remaining: 70,
        phase: 'initial',
      },
    },
  });
  assert.notEqual(clock, null);
  assert.deepEqual(summarizeUnemploymentClock(clock!), {
    headline: '70 days remaining',
    usage: '20 / 90 unemployment days used',
    phaseLabel: 'Initial OPT limit',
  });

  const stemClock = parseVerifiedUnemploymentClockResponse({
    data: {
      unemployment_clock: {
        active: true,
        used: 90,
        max: 150,
        remaining: 60,
        phase: 'stem',
      },
    },
  });
  assert.deepEqual(summarizeUnemploymentClock(stemClock!), {
    headline: '60 days remaining',
    usage: '90 / 150 cumulative unemployment days used',
    phaseLabel: 'STEM OPT cumulative limit',
  });

  assert.notEqual(parseVerifiedUnemploymentClockResponse({
    data: {
      unemployment_clock: {
        active: true,
        used: 150,
        max: 150,
        remaining: 0,
        phase: 'stem',
      },
    },
  }), null);
});

test('verified unemployment clock contract rejects impossible numbers', () => {
  assert.equal(parseVerifiedUnemploymentClockResponse({
    data: {
      unemployment_clock: {
        active: true,
        used: -1,
        max: 90,
        remaining: 91,
        phase: 'initial',
      },
    },
  }), null);

  assert.equal(parseVerifiedUnemploymentClockResponse({
    data: {
      unemployment_clock: {
        active: true,
        used: 20,
        max: 90,
        remaining: 130,
        phase: 'stem',
      },
    },
  }), null);
});

test('all four date-entry tools reject silent calendar clamping', () => {
  const datePages = [
    'src/pages/opt-apply-date-helpers.ts',
    'src/pages/clock.ts',
    'src/pages/stem-apply.ts',
    'src/pages/stem-clock.ts',
  ];

  for (const page of datePages) {
    const source = readFileSync(page, 'utf8');
    assert.doesNotMatch(source, /day > maxDay/);
    assert.match(source, /year < 1/);
  }
});
