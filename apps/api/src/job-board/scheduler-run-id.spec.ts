import {
  ingestionReservationParams,
  normalizeSchedulerRunId,
  normalizeTriggerOrigin,
  planIngestionOrchestratorOptions,
} from './scheduler-run-id';

describe('job-board scheduler idempotency', () => {
  it('accepts only the UTC hourly scheduler key shape', () => {
    expect(normalizeSchedulerRunId('job-board-hour-2026-08-31T18')).toBe(
      'job-board-hour-2026-08-31T18',
    );
    expect(
      normalizeSchedulerRunId('job-board-hour-2026-08-31T18:30'),
    ).toBeNull();
    expect(
      normalizeSchedulerRunId('../job-board-hour-2026-08-31T18'),
    ).toBeNull();
    expect(normalizeSchedulerRunId(undefined)).toBeNull();
    expect(normalizeSchedulerRunId('job-board-manual-incident-123')).toBe(
      'job-board-manual-incident-123',
    );
    expect(normalizeSchedulerRunId('manual-incident-123')).toBeNull();
  });

  it('retains scheduled orchestrator records so redundant wake-ups cannot duplicate an hour', () => {
    expect(
      planIngestionOrchestratorOptions('job-board-hour-2026-08-31T18'),
    ).toEqual({
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      jobId: 'job-board-hour-2026-08-31T18',
      removeOnComplete: 3,
      removeOnFail: false,
    });
  });

  it('keeps an explicit manual run independent without an undeduplicated fallback', () => {
    expect(
      planIngestionOrchestratorOptions('job-board-manual-incident-123'),
    ).toEqual({
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      jobId: 'job-board-manual-incident-123',
      removeOnComplete: 3,
      removeOnFail: false,
    });
  });

  it('defaults unknown origins without guessing and persists valid origins in reservation parameters', () => {
    expect(normalizeTriggerOrigin(undefined)).toBe('unknown');
    expect(normalizeTriggerOrigin('some_scheduler')).toBe('unknown');
    expect(normalizeTriggerOrigin('cron_jobs_org')).toBe('cron_jobs_org');
    expect(
      ingestionReservationParams('source-a', {
        schedulerRunId: 'job-board-hour-2026-08-31T18',
        triggerOrigin: 'cron_jobs_org',
      }),
    ).toEqual({
      source: 'source-a',
      scheduler_id: 'job-board-hour-2026-08-31T18',
      origin: 'cron_jobs_org',
    });
  });
});
