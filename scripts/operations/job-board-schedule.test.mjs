import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  newYorkTimeToUtc,
  scheduledSlot,
  slotsBetween,
} from './job-board-schedule.mjs';

const at = (iso) => scheduledSlot(new Date(iso));

test('weekday 2 PM and 9 PM slots in daylight time (EDT, UTC-4)', () => {
  // Thursday 2026-10-15.
  assert.equal(at('2026-10-15T18:07:00Z')?.runId, 'job-board-hour-2026-10-15T18');
  // 9 PM Thursday New York is 01:00 UTC Friday.
  assert.equal(at('2026-10-16T01:07:00Z')?.runId, 'job-board-hour-2026-10-16T01');
  assert.match(at('2026-10-16T01:07:00Z').localSlot, /2026-10-15 21:00 .*\(Thu\)/);
});

test('weekday slots in standard time (EST, UTC-5)', () => {
  // Thursday 2026-11-12.
  assert.equal(at('2026-11-12T19:07:00Z')?.runId, 'job-board-hour-2026-11-12T19');
  assert.equal(at('2026-11-13T02:07:00Z')?.runId, 'job-board-hour-2026-11-13T02');
  // The EDT UTC hour is not a slot in winter.
  assert.equal(at('2026-11-12T18:07:00Z'), null);
});

test('weekends have only the 9 PM slot', () => {
  // Saturday 2026-10-17, 2 PM New York.
  assert.equal(at('2026-10-17T18:07:00Z'), null);
  // Saturday 9 PM New York = Sunday 01:00 UTC.
  assert.match(at('2026-10-18T01:07:00Z').localSlot, /\(Sat\)/);
  // Sunday 9 PM New York = Monday 01:00 UTC.
  assert.match(at('2026-10-19T01:07:00Z').localSlot, /\(Sun\)/);
  // Monday 2 PM New York is a slot again.
  assert.match(at('2026-10-19T18:07:00Z').localSlot, /\(Mon\)/);
});

test('every firing inside one slot maps to the same run ID; outside it is skipped', () => {
  const ids = ['18:00', '18:07', '18:37', '19:07', '19:29'].map(
    (time) => at(`2026-10-15T${time}:00Z`)?.runId
  );
  assert.deepEqual(new Set(ids), new Set(['job-board-hour-2026-10-15T18']));
  assert.equal(at('2026-10-15T19:30:00Z'), null);
  assert.equal(at('2026-10-15T17:59:59Z'), null);
});

test('daylight saving transitions keep slots on local wall-clock time', () => {
  // DST ends Sunday 2026-11-01: Saturday 9 PM is EDT, Sunday 9 PM is EST.
  assert.equal(newYorkTimeToUtc(2026, 10, 31, 21).toISOString(), '2026-11-01T01:00:00.000Z');
  assert.equal(newYorkTimeToUtc(2026, 11, 1, 21).toISOString(), '2026-11-02T02:00:00.000Z');
  // DST starts Sunday 2027-03-14.
  assert.equal(newYorkTimeToUtc(2027, 3, 13, 21).toISOString(), '2027-03-14T02:00:00.000Z');
  assert.equal(newYorkTimeToUtc(2027, 3, 14, 21).toISOString(), '2027-03-15T01:00:00.000Z');
  assert.equal(newYorkTimeToUtc(2027, 3, 15, 14).toISOString(), '2027-03-15T18:00:00.000Z');
});

test('slotsBetween lists 12 slots in a full week', () => {
  const slots = slotsBetween(
    new Date('2026-10-19T04:00:00Z'), // Monday 00:00 New York
    new Date('2026-10-26T03:59:59Z')
  );
  assert.equal(slots.length, 5 * 2 + 2);
  assert.equal(slots[0].toISOString(), '2026-10-19T18:00:00.000Z');
});

test('targeted recovery helpers retry only failed sources once', async () => {
  const { onlyFailedSourcesRemain, recoverFailedSources, runSummary } =
    await import('./trigger-job-board-ingestion.mjs');
  const base = { manifestAvailable: true, started: 0, runnable: 0, missing: 0 };
  assert.equal(onlyFailedSourcesRemain({ ...base, failed: 2 }), true);
  assert.equal(onlyFailedSourcesRemain({ ...base, failed: 0 }), false);
  // A still-started (possibly live) source or unaccounted source blocks recovery.
  assert.equal(onlyFailedSourcesRemain({ ...base, failed: 1, started: 1 }), false);
  assert.equal(onlyFailedSourcesRemain({ ...base, failed: 1, missing: 1 }), false);
  assert.equal(onlyFailedSourcesRemain(undefined), false);

  const calls = [];
  const result = await recoverFailedSources({
    apiUrl: 'https://api.example.test',
    apiKey: 'k',
    schedulerId: 'job-board-hour-2026-10-15T18',
    fetchImpl: async (url, init) => {
      calls.push([String(url), init.method]);
      return { ok: true, json: async () => ({ sourcesRequeued: 1 }) };
    },
  });
  assert.deepEqual(calls, [[
    'https://api.example.test/job-board/ops/ingestion-runs/job-board-hour-2026-10-15T18/recover-failed',
    'POST',
  ]]);
  assert.equal(result.sourcesRequeued, 1);
  assert.match(
    runSummary('job-board-hour-2026-10-15T18', { selected: 3, succeeded: 2, failed: 1, started: 0, missing: 0 }, result),
    /\| 3 \| 2 \| 1 \| 0 \| 0 \|[\s\S]*requeued once: 1/
  );
});
