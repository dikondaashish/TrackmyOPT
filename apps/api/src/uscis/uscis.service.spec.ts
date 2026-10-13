import { ConfigService } from '@nestjs/config';
import type { Queue } from 'bull';
import { createClient } from '@supabase/supabase-js';
import { UscisService } from './uscis.service';

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

describe('daily USCIS queue pagination', () => {
  function setup(
    failPage = false,
    outcomes: { job_id: string; state: string }[] = [],
  ) {
    const ranges: Array<[string, number]> = [];
    const from = jest.fn((table: string) => {
      const query = {
        upsert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve({ data: outcomes, error: null }).then(resolve),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn((start: number, end: number) => {
          ranges.push([table, start]);
          const count = table === 'case_status' ? 1681 : 1100;
          const data = Array.from(
            { length: Math.max(0, Math.min(end + 1, count) - start) },
            (_, i) => ({
              id: `case-${start + i}`,
              user_id: `user-${start + i}`,
              receipt_number: `receipt-${start + i}`,
            }),
          );
          return Promise.resolve({
            data,
            error:
              failPage && start > 0 ? { message: 'page unavailable' } : null,
          });
        }),
      };
      return query;
    });
    jest
      .mocked(createClient)
      .mockReturnValue({ from } as unknown as ReturnType<typeof createClient>);
    const addBulk = jest
      .fn<Promise<unknown[]>, [unknown[]]>()
      .mockResolvedValue([]);
    const service = new UscisService(new ConfigService(), {
      addBulk,
      getJobs: jest.fn().mockResolvedValue([]),
    } as unknown as Queue);
    return { service, addBulk, ranges };
  }

  it('queues every enrolled case beyond 1000 without querying plans', async () => {
    const { service, addBulk, ranges } = setup();
    await expect(service.queueAllActiveCases()).resolves.toEqual({
      count: 1681,
      skippedFree: 0,
      queued: 3362,
    });
    expect(ranges).toContainEqual(['case_status', 1000]);
    expect(ranges.some(([table]) => table === 'profiles')).toBe(false);
    expect(addBulk.mock.calls[0][0]).toHaveLength(3362);
  });

  it('does not requeue completed daily checks, but recovers failures after repair', async () => {
    const day = new Date().toISOString().slice(0, 10);
    const done = `daily-case-0-${day}`;
    const failed = `daily-case-1-${day}`;
    const { service, addBulk } = setup(false, [
      { job_id: done, state: 'succeeded' },
      { job_id: failed, state: 'failed' },
    ]);
    const result = await service.queueAllActiveCases();
    expect(result.queued).toBe(3361);
    const jobs = addBulk.mock.calls[0][0] as {
      opts: { jobId: string; backoff: { delay: number } };
    }[];
    expect(jobs.some((j) => j.opts.jobId === done)).toBe(false);
    expect(jobs.some((j) => j.opts.jobId === failed)).toBe(true);
    expect(jobs.every((j) => j.opts.backoff.delay >= 300000)).toBe(true);
  });

  it('dry run reads every page but does not queue or persist jobs', async () => {
    const { service, addBulk } = setup();
    expect(await service.queueAllActiveCases(true)).toEqual({
      count: 1681,
      skippedFree: 0,
      dryRun: true,
      queued: 0,
    });
    expect(addBulk).not.toHaveBeenCalled();
  });

  it('does not queue an incomplete population after a page error', async () => {
    const { service, addBulk } = setup(true);
    await expect(service.queueAllActiveCases()).rejects.toThrow(
      'Failed to fetch cases',
    );
    expect(addBulk).not.toHaveBeenCalled();
  });
});

describe('case queue data retention', () => {
  it('rebuilds inactive daily jobs with legacy retry and retention options', async () => {
    const legacy = {
      id: 'daily-existing-case-2026-10-12',
      name: 'check-status',
      data: { userId: 'owner', receiptNumber: 'IOE0000000001' },
      opts: { backoff: { type: 'exponential', delay: 5000 } },
      remove: jest.fn().mockResolvedValue(undefined),
    };
    const service = new UscisService(new ConfigService(), {
      getJobs: jest.fn().mockResolvedValue([legacy]),
    } as unknown as Queue);
    expect(
      await service.purgeUnenrolledJobs([
        { user_id: 'owner', receipt_number: 'IOE0000000001' },
      ]),
    ).toBe(1);
    expect(legacy.remove).toHaveBeenCalledTimes(1);
  });
  it('removes failed/delayed legacy payloads only for missing enrollments', async () => {
    const removed = {
      name: 'check-status',
      data: { userId: 'removed', receiptNumber: 'IOE0000000001' },
      remove: jest.fn().mockResolvedValue(undefined),
    };
    const shared = {
      name: 'check-status',
      data: { userId: 'owner', receiptNumber: 'IOE0000000001' },
      remove: jest.fn(),
    };
    const other = { name: 'other-task', data: {}, remove: jest.fn() };
    const getJobs = jest.fn().mockResolvedValue([removed, shared, other]);
    const service = new UscisService(new ConfigService(), {
      getJobs,
    } as unknown as Queue);
    expect(
      await service.purgeUnenrolledJobs([
        { user_id: 'owner', receipt_number: 'IOE0000000001' },
      ]),
    ).toBe(1);
    expect(removed.remove).toHaveBeenCalledTimes(1);
    expect(shared.remove).not.toHaveBeenCalled();
    expect(other.remove).not.toHaveBeenCalled();
    expect(getJobs).toHaveBeenCalledWith(
      ['waiting', 'delayed', 'paused', 'completed', 'failed'],
      0,
      999,
    );
  });
  it('does not retain private job payloads after new manual jobs finish or fail', async () => {
    const add = jest.fn().mockResolvedValue({ id: 'job' });
    const service = new UscisService(new ConfigService(), {
      add,
    } as unknown as Queue);
    await service.queueCheckStatus('IOE0000000001', 'owner');
    expect(add).toHaveBeenCalledWith('check-status', expect.anything(), {
      removeOnComplete: true,
      removeOnFail: true,
    });
  });
});
