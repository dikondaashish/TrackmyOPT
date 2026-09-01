import {
  queueSchedulerRun,
  type SchedulerAttempt,
  type SchedulerRunStore,
} from './scheduler-run-ledger';
import type { SchedulerContext } from './scheduler-run-id';

class MemoryStore implements SchedulerRunStore {
  readonly claimed = new Set<string>();
  readonly attempts: SchedulerAttempt[] = [];

  claim(context: SchedulerContext) {
    if (this.claimed.has(context.schedulerRunId)) return Promise.resolve(false);
    this.claimed.add(context.schedulerRunId);
    return Promise.resolve(true);
  }

  markQueued() {
    return Promise.resolve();
  }

  recordAttempt(attempt: SchedulerAttempt) {
    this.attempts.push(attempt);
    return Promise.resolve();
  }

  releaseClaim(schedulerRunId: string) {
    this.claimed.delete(schedulerRunId);
    return Promise.resolve();
  }
}

const hourly = (hour: string): SchedulerContext => ({
  schedulerRunId: `job-board-hour-${hour}`,
  triggerOrigin: 'cron_jobs_org',
});

describe('scheduler run ledger', () => {
  it('queues one hourly run and records each duplicate as suppressed', async () => {
    const store = new MemoryStore();
    const enqueue = jest
      .fn()
      .mockResolvedValue({ id: hourly('2026-09-01T03').schedulerRunId });

    const results = await Promise.all([
      queueSchedulerRun(hourly('2026-09-01T03'), store, enqueue),
      queueSchedulerRun(hourly('2026-09-01T03'), store, enqueue),
      queueSchedulerRun(hourly('2026-09-01T03'), store, enqueue),
      queueSchedulerRun(hourly('2026-09-01T03'), store, enqueue),
    ]);

    expect(enqueue).toHaveBeenCalledTimes(1);
    expect(results.map((result) => result.status).sort()).toEqual([
      'queued',
      'suppressed',
      'suppressed',
      'suppressed',
    ]);
    expect(
      store.attempts.filter((row) => row.outcome === 'queued'),
    ).toHaveLength(1);
    expect(
      store.attempts.filter((row) => row.outcome === 'suppressed'),
    ).toHaveLength(3);
  });

  it('queues distinct UTC hours separately', async () => {
    const store = new MemoryStore();
    const enqueue = jest.fn().mockResolvedValue({});
    await queueSchedulerRun(hourly('2026-09-01T03'), store, enqueue);
    await queueSchedulerRun(hourly('2026-09-01T04'), store, enqueue);
    expect(enqueue).toHaveBeenCalledTimes(2);
  });

  it('lets explicit manual IDs bypass the hourly key', async () => {
    const store = new MemoryStore();
    const enqueue = jest.fn().mockResolvedValue({});
    await queueSchedulerRun(hourly('2026-09-01T03'), store, enqueue);
    await queueSchedulerRun(
      {
        schedulerRunId: 'job-board-manual-incident-123',
        triggerOrigin: 'manual',
      },
      store,
      enqueue,
    );
    expect(enqueue).toHaveBeenCalledTimes(2);
  });

  it('records a failed queue attempt and releases its database claim for retry', async () => {
    const store = new MemoryStore();
    const context = hourly('2026-09-01T03');
    await expect(
      queueSchedulerRun(context, store, () =>
        Promise.reject(new Error('redis unavailable')),
      ),
    ).rejects.toThrow('redis unavailable');
    expect(store.attempts[0]?.outcome).toBe('failed');
    expect(store.claimed.has(context.schedulerRunId)).toBe(false);
  });
});
