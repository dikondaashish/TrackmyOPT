import { describe, expect, it } from 'vitest';
import {
  evaluateIngestionHealth,
  newYorkTimeToUtc,
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

  it('flags slots with no queued dispatch', () => {
    const health = evaluateIngestionHealth(
      now,
      [
        { scheduler_run_id: 'job-board-hour-2026-10-15T18', dispatch_status: 'queued' },
        { scheduler_run_id: 'job-board-hour-2026-10-16T01', dispatch_status: 'failed' },
      ],
      []
    );
    expect(health.missingRuns).toEqual(['job-board-hour-2026-10-16T01']);
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
});
