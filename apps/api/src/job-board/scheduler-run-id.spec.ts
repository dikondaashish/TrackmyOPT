import {
  normalizeSchedulerRunId,
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

  it('keeps an explicit manual run independent', () => {
    expect(planIngestionOrchestratorOptions(null)).toEqual({
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  });
});
