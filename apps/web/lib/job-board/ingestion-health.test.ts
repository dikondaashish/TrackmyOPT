import { describe, expect, it } from 'vitest';
import {
  evaluateIngestionHealth,
  newYorkTimeToUtc,
  parseScheduleStart,
  scheduledSlot,
  scheduledSlotsBetween,
  slotRunId,
  type AuditRow,
} from './ingestion-health';

describe('ingestion schedule', () => {
  it('lists weekday 2 PM / 9 PM and weekend 9 PM New York slots', () => {
    const slots = scheduledSlotsBetween(
      new Date('2026-10-19T04:00:00Z'), // Monday 00:00 New York (EDT)
      new Date('2026-10-26T03:59:59Z')
    );
    expect(slots).toHaveLength(12);
    expect(slotRunId(slots[0])).toBe('job-board-hour-2026-10-19T18');
    expect(slotRunId(slots[1])).toBe('job-board-hour-2026-10-20T01');
  });

  it('follows daylight saving time', () => {
    expect(newYorkTimeToUtc(2026, 10, 31, 21).toISOString()).toBe(
      '2026-11-01T01:00:00.000Z'
    );
    expect(newYorkTimeToUtc(2026, 11, 1, 21).toISOString()).toBe(
      '2026-11-02T02:00:00.000Z'
    );
    expect(newYorkTimeToUtc(2027, 3, 15, 14).toISOString()).toBe(
      '2027-03-15T18:00:00.000Z'
    );
  });
});

describe('evaluateIngestionHealth', () => {
  // Friday 2026-10-16 12:00 New York: Thursday's 14:00 and 21:00 slots are due.
  const now = new Date('2026-10-16T16:00:00Z');
  const audit = (over: Partial<AuditRow>): AuditRow => ({
    source_id: 's1',
    scheduler_run_id: 'job-board-hour-2026-10-15T18',
    status: 'succeeded',
    error_message: null,
    run_at: '2026-10-15T18:10:00Z',
    ...over,
  });

  const runs = [
    { scheduler_run_id: 'job-board-hour-2026-10-15T18', dispatch_status: 'queued' },
    { scheduler_run_id: 'job-board-hour-2026-10-16T01', dispatch_status: 'failed' },
  ];

  it('flags slots with no queued dispatch after the schedule start', () => {
    const health = evaluateIngestionHealth(
      now,
      runs,
      [],
      parseScheduleStart('2026-10-15T00:00:00Z')
    );
    expect(health.missingRuns).toEqual(['job-board-hour-2026-10-16T01']);
  });

  it('ignores slots before the schedule start, and all slots when it is unset', () => {
    // Started after Thursday 2 PM: only the 9 PM slot is expected.
    expect(
      evaluateIngestionHealth(now, [], [], parseScheduleStart('2026-10-15T19:00:00Z'))
        .missingRuns
    ).toEqual(['job-board-hour-2026-10-16T01']);
    expect(
      evaluateIngestionHealth(now, [], [], parseScheduleStart('2026-10-16T02:00:00Z'))
        .missingRuns
    ).toEqual([]);
    expect(evaluateIngestionHealth(now, [], []).missingRuns).toEqual([]);
    expect(parseScheduleStart('not-a-date')).toBeNull();
  });

  it('counts failed, Oracle and stalled sources from the latest audit only', () => {
    const health = evaluateIngestionHealth(
      now,
      [],
      [
        audit({ source_id: 'a', status: 'failed', error_message: 'ORA-00054: resource busy' }),
        audit({ source_id: 'b', status: 'failed', error_message: 'greenhouse HTTP 500' }),
        // Recovered later: not a failure.
        audit({ source_id: 'c', status: 'failed', run_at: '2026-10-15T18:10:00Z' }),
        audit({ source_id: 'c', status: 'succeeded', run_at: '2026-10-15T19:00:00Z' }),
        audit({ source_id: 'd', status: 'failed', error_message: 'NJS-123: call timeout' }),
        audit({ source_id: 'e', status: 'started', run_at: '2026-10-16T15:50:00Z' }),
        audit({ source_id: 'f', status: 'started', run_at: '2026-10-16T13:00:00Z' }),
      ]
    );
    expect(health).toMatchObject({
      failedSources: 3,
      oracleErrorSources: 2,
      errorCodes: ['NJS-123', 'ORA-00054'],
      stalledSources: 1,
    });
  });

  it('treats a source that failed in one run and succeeded in a later run as recovered', () => {
    const health = evaluateIngestionHealth(now, [], [
      audit({
        source_id: 'a',
        scheduler_run_id: 'job-board-hour-2026-10-15T18',
        status: 'failed',
        error_message: "ORA-01536: space quota exceeded for tablespace 'DATA'",
        run_at: '2026-10-15T18:10:00Z',
      }),
      audit({
        source_id: 'a',
        scheduler_run_id: 'job-board-hour-2026-10-16T01',
        status: 'succeeded',
        run_at: '2026-10-16T01:30:00Z',
      }),
      audit({
        source_id: 'b',
        scheduler_run_id: 'job-board-hour-2026-10-15T18',
        status: 'failed',
        error_message: "ORA-01536: space quota exceeded for tablespace 'DATA'",
        run_at: '2026-10-15T18:20:00Z',
      }),
    ]);
    expect(health).toMatchObject({ failedSources: 1, errorCodes: ['ORA-01536'] });
  });
});

describe('scheduledSlot', () => {
  const runId = (iso: string) => scheduledSlot(new Date(iso))?.runId ?? null;

  it('maps weekday EDT firings to the 14:00 and 21:00 New York slots', () => {
    // Thursday 2026-10-15, EDT (UTC-4): 14:00 NY = 18:00 UTC.
    expect(runId('2026-10-15T18:07:00Z')).toBe('job-board-hour-2026-10-15T18');
    // A later firing in the same slot window reuses the run ID.
    expect(runId('2026-10-15T19:07:00Z')).toBe('job-board-hour-2026-10-15T18');
    // 21:00 NY Thursday = 01:00 UTC Friday.
    expect(runId('2026-10-16T01:07:00Z')).toBe('job-board-hour-2026-10-16T01');
    expect(runId('2026-10-16T02:07:00Z')).toBe('job-board-hour-2026-10-16T01');
  });

  it('maps weekday EST firings using the standard-time offset', () => {
    // Tuesday 2026-12-15, EST (UTC-5): 14:00 NY = 19:00 UTC.
    expect(runId('2026-12-15T18:07:00Z')).toBeNull(); // 13:07 NY
    expect(runId('2026-12-15T19:07:00Z')).toBe('job-board-hour-2026-12-15T19');
    expect(runId('2026-12-16T01:07:00Z')).toBeNull(); // 20:07 NY
    expect(runId('2026-12-16T02:07:00Z')).toBe('job-board-hour-2026-12-16T02');
  });

  it('has only the 21:00 slot at weekends', () => {
    // Saturday 2026-10-17 14:07 EDT: no weekend afternoon slot.
    expect(runId('2026-10-17T18:07:00Z')).toBeNull();
    // Saturday 21:07 EDT = Sunday 01:07 UTC.
    expect(runId('2026-10-18T01:07:00Z')).toBe('job-board-hour-2026-10-18T01');
    // Friday 21:00 NY falls on Saturday UTC and is still a weekday slot.
    expect(runId('2026-10-17T01:07:00Z')).toBe('job-board-hour-2026-10-17T01');
  });

  it('ignores firings before a slot or after its 90-minute window', () => {
    expect(runId('2026-10-15T17:59:59Z')).toBeNull();
    expect(runId('2026-10-15T19:29:59Z')).toBe('job-board-hour-2026-10-15T18');
    expect(runId('2026-10-15T19:30:00Z')).toBeNull();
  });
});
