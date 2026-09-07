import { ConfigService } from '@nestjs/config';
import { JobBoardService } from './job-board.service';
import { JobBoardProcessor } from './job-board.processor';

const context = {
  schedulerRunId: 'job-board-manual-supervision',
  triggerOrigin: 'manual' as const,
  jobStoreKind: 'oracle' as const,
  runStartedAt: '2026-09-07T00:00:00.000Z',
  sourceIds: ['missing', 'active', 'done'],
};

function setup() {
  const audits = [
    { source_id: 'active', status: 'started', run_at: context.runStartedAt },
    { source_id: 'done', status: 'succeeded', run_at: context.runStartedAt },
  ];
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    then: (resolve: (value: unknown) => unknown) =>
      Promise.resolve({ data: audits, error: null }).then(resolve),
  };
  const job = {
    data: { ...context },
    getState: jest.fn().mockResolvedValue('completed'),
  };
  const queue = {
    getJob: jest.fn().mockResolvedValue(job),
    getJobs: jest.fn().mockResolvedValue([]),
    getJobCounts: jest
      .fn()
      .mockResolvedValue({ active: 0, waiting: 0, delayed: 0 }),
    isPaused: jest.fn().mockResolvedValue(false),
    addBulk: jest.fn().mockResolvedValue([]),
  };
  const config = {
    get: (key: string) =>
      ({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test',
        JOB_DATA_STORE: 'oracle',
        JOB_BOARD_QUEUE_CONTROL_ENABLED: true,
      })[key],
  } as unknown as ConfigService;
  const service = new JobBoardService(
    config,
    queue as never,
    queue as never,
    {} as never,
    {} as never,
    {} as never,
  );
  const internal = service as unknown as {
    supabase: unknown;
    getSlowSourceIds: jest.Mock;
    complete: (...args: unknown[]) => Promise<void>;
  };
  const rpc = jest.fn().mockResolvedValue({ error: null });
  internal.supabase = { from: jest.fn().mockReturnValue(query), rpc };
  internal.getSlowSourceIds = jest.fn().mockResolvedValue(new Set());
  return { service, internal, queue, query, job, rpc };
}

describe('ingestion supervision incident regressions', () => {
  it('never expires an actively owned source merely because its start is older than five minutes', async () => {
    const { service, query } = setup();
    await service.recoverIngestionRun(context.schedulerRunId);
    expect(query.update).not.toHaveBeenCalled();
  });

  it('recovers only never-started manifest identities and preserves the original store and run time', async () => {
    const { service, queue } = setup();
    await service.recoverIngestionRun(context.schedulerRunId);
    const submitted = queue.addBulk.mock.calls.flatMap(
      ([jobs]) => jobs as { data: unknown }[],
    );
    expect(submitted).toHaveLength(1);
    expect(submitted[0].data).toMatchObject({
      ...context,
      sourceId: 'missing',
    });
  });

  it('refuses recovery while an operator pause is in force', async () => {
    const { service, queue } = setup();
    queue.isPaused.mockResolvedValue(true);
    await expect(
      service.recoverIngestionRun(context.schedulerRunId),
    ).rejects.toThrow('paused');
    expect(queue.addBulk).not.toHaveBeenCalled();
  });

  it('refuses to reconstruct a historical run without its immutable manifest', async () => {
    const { service, queue } = setup();
    queue.getJob.mockResolvedValue(null);
    await expect(
      service.recoverIngestionRun(context.schedulerRunId),
    ).rejects.toThrow('manifest');
    expect(queue.addBulk).not.toHaveBeenCalled();
  });

  it('rejects recovery into a different store after a rollback', async () => {
    const { service, queue, job } = setup();
    queue.getJob.mockResolvedValue({
      ...job,
      data: { ...context, jobStoreKind: 'supabase' },
    });
    await expect(
      service.recoverIngestionRun(context.schedulerRunId),
    ).rejects.toThrow('job_store_mismatch');
    expect(queue.addBulk).not.toHaveBeenCalled();
  });

  it('reports global pause as a Boolean independent of the paused job count', async () => {
    const { service, queue } = setup();
    queue.isPaused.mockResolvedValue(true);
    expect(await service.getIngestionQueueState()).toMatchObject({
      queuesPaused: { normal: true, slow: true },
    });
  });

  it('removes only queued wrappers for an aborted run while both queues are paused', async () => {
    const { service, queue } = setup();
    queue.isPaused.mockResolvedValue(true);
    const remove = jest.fn().mockResolvedValue(undefined);
    queue.getJobs.mockResolvedValue([
      {
        data: { schedulerRunId: context.schedulerRunId },
        getState: jest.fn().mockResolvedValue('paused'),
        remove,
      },
    ]);
    queue.getJobs.mockImplementation((states: string[]) =>
      states.includes('active')
        ? []
        : [
            {
              data: { schedulerRunId: context.schedulerRunId },
              getState: jest.fn().mockResolvedValue('paused'),
              remove,
            },
          ],
    );
    const result = await service.cancelIngestionRun(context.schedulerRunId);
    expect(result).toEqual({
      schedulerRunId: context.schedulerRunId,
      jobsRemoved: 2,
    });
    expect(remove).toHaveBeenCalledTimes(2);
  });

  it('refuses cancellation when an aborted run still has active work', async () => {
    const { service, queue } = setup();
    queue.isPaused.mockResolvedValue(true);
    queue.getJobs.mockResolvedValue([
      {
        data: { schedulerRunId: context.schedulerRunId },
        getState: jest.fn().mockResolvedValue('active'),
        remove: jest.fn(),
      },
    ]);
    await expect(
      service.cancelIngestionRun(context.schedulerRunId),
    ).rejects.toThrow('active');
  });

  it('fails the worker when its durable audit completion fails', async () => {
    const { internal, rpc } = setup();
    rpc.mockResolvedValue({
      error: { message: 'Only a started ingestion audit log can be completed' },
    });
    await expect(
      internal.complete(
        'audit',
        1,
        {
          jobsNew: 0,
          jobsDuplicate: 1,
          jobsStale: 0,
          jobsRemoved: 0,
          jobsReopened: 0,
        },
        1,
      ),
    ).rejects.toThrow('audit');
  });

  it('registers one normal queue worker so named handlers cannot multiply source concurrency', () => {
    const prototype = JobBoardProcessor.prototype;
    const registrations = Object.getOwnPropertyNames(prototype)
      .filter((name) => name !== 'constructor')
      .map(
        (name) =>
          Reflect.getMetadata(
            'bull:module_queue_process',
            prototype[name as keyof JobBoardProcessor],
          ) as unknown,
      )
      .filter(Boolean);
    expect(registrations).toEqual([{ name: '*', concurrency: 1 }]);
  });
});
