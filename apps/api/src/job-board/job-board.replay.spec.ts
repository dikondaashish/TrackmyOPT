import { ConfigService } from '@nestjs/config';
import { JobBoardService } from './job-board.service';
import {
  JobBoardProcessor,
  SlowJobBoardProcessor,
} from './job-board.processor';

const context = {
  schedulerRunId: 'job-board-manual-replay',
  triggerOrigin: 'manual' as const,
  jobStoreKind: 'supabase' as const,
  runStartedAt: '2026-09-06T00:00:00Z',
};
function serviceWithAudit(status: string | null) {
  const config = {
    get: (key: string) =>
      ({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test',
        JOB_DATA_STORE: 'supabase',
      })[key],
  };
  const service = new JobBoardService(
    config as ConfigService,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );
  const internal = service as unknown as {
    ingestSourceByIdInternal: jest.Mock;
    supabase: unknown;
  };
  internal.ingestSourceByIdInternal = jest
    .fn()
    .mockResolvedValue({ sourceId: 'a', skipped: 'duplicate_scheduler_run' });
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    maybeSingle: jest
      .fn()
      .mockResolvedValue({ data: status ? { status } : null, error: null }),
  };
  internal.supabase = { from: jest.fn().mockReturnValue(query) };
  return service;
}
describe('source replay audit safety', () => {
  it('persists the source manifest before enqueue and preserves it on replay', async () => {
    const service = serviceWithAudit(null);
    const internal = service as unknown as {
      supabase: unknown;
      getSlowSourceIds: jest.Mock;
      queue: unknown;
      slowQueue: unknown;
    };
    internal.supabase = {
      from: () => ({
        select: () => ({
          eq: () =>
            Promise.resolve({ data: [{ id: 'changed-source' }], error: null }),
        }),
      }),
    };
    internal.getSlowSourceIds = jest.fn().mockResolvedValue(new Set());
    const order: string[] = [];
    const addBulk = jest
      .fn<
        Promise<void>,
        [{ data: { sourceId: string; jobStoreKind: string } }[]]
      >()
      .mockImplementation(() => {
        order.push('enqueue');
        return Promise.resolve();
      });
    internal.queue = { addBulk };
    internal.slowQueue = { addBulk };
    await service.enqueueEnabledSourceJobs(
      { ...context, sourceIds: ['original-source'] },
      (ids) => {
        expect(ids).toEqual(['original-source']);
        order.push('manifest');
        return Promise.resolve();
      },
    );
    expect(order).toEqual(['manifest', 'enqueue']);
    expect(addBulk.mock.calls[0][0][0].data).toMatchObject({
      sourceId: 'original-source',
      jobStoreKind: 'supabase',
    });
  });
  it('does not enqueue if durable selection persistence fails', async () => {
    const service = serviceWithAudit(null);
    const internal = service as unknown as {
      supabase: unknown;
      queue: unknown;
    };
    internal.supabase = {
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: [{ id: 'source' }], error: null }),
        }),
      }),
    };
    const addBulk = jest.fn();
    internal.queue = { addBulk };
    await expect(
      service.enqueueEnabledSourceJobs(context, () =>
        Promise.reject(new Error('Valkey unavailable')),
      ),
    ).rejects.toThrow('Valkey unavailable');
    expect(addBulk).not.toHaveBeenCalled();
  });
  it.each(['started', 'failed', null])(
    'rejects a replay with %s audit instead of silently completing',
    async (status) => {
      await expect(
        serviceWithAudit(status).ingestSourceById('a', context),
      ).rejects.toThrow('no successful or policy-terminal audit');
    },
  );
  it('suppresses a genuinely completed duplicate without repeating persistence', async () => {
    await expect(
      serviceWithAudit('succeeded').ingestSourceById('a', context),
    ).resolves.toMatchObject({ skipped: 'duplicate_scheduler_run' });
  });
  it.each([JobBoardProcessor, SlowJobBoardProcessor])(
    'finalizes exhausted stalls independently of normal retry counters (%p)',
    async (Processor) => {
      const service = {
        markSourceAuditFailed: jest.fn().mockResolvedValue(true),
      };
      const processor =
        Processor === JobBoardProcessor
          ? new JobBoardProcessor(service as never, {} as never)
          : new SlowJobBoardProcessor(service as never);
      const job = {
        data: { ...context, sourceId: 'a' },
        attemptsMade: 0,
        opts: { attempts: 3 },
      };
      await processor.onSourceFailed(
        job as never,
        new Error('job stalled more than allowable limit'),
      );
      expect(service.markSourceAuditFailed).toHaveBeenCalledTimes(1);
    },
  );
  it('does not terminalize an ordinary retryable failure', async () => {
    const service = { markSourceAuditFailed: jest.fn() };
    const processor = new JobBoardProcessor(service as never, {} as never);
    await processor.onSourceFailed(
      { data: context, attemptsMade: 1, opts: { attempts: 3 } } as never,
      new Error('temporary'),
    );
    expect(service.markSourceAuditFailed).not.toHaveBeenCalled();
  });
});
