import { ConfigService } from '@nestjs/config';
import { OracleIngestionRepairService } from './oracle-ingestion-repair.service';
import { OracleJobDataStore } from './oracle-job-data-store';

describe('protected production parity repair guards', () => {
  afterEach(() => jest.restoreAllMocks());
  function setup(enabled: boolean, store: string, paused = true) {
    const config = {
      get: (key: string) =>
        ({
          NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: 'test',
          JOB_DATA_STORE: store,
          ORACLE_INGESTION_REPAIR_ENABLED: enabled,
        })[key],
    } as unknown as ConfigService;
    const queue = {
      isPaused: jest.fn().mockResolvedValue(paused),
      getJobCounts: jest
        .fn()
        .mockResolvedValue({ active: 0, waiting: 0, delayed: 0 }),
    };
    const factory = jest.spyOn(OracleJobDataStore, 'fromEnvironment');
    return {
      service: new OracleIngestionRepairService(
        config,
        queue as never,
        queue as never,
      ),
      queue,
      factory,
    };
  }
  it.each([
    [false, 'supabase'],
    [true, 'oracle'],
  ])(
    'rejects disabled repair or a production Oracle store before database access',
    async (enabled, store) => {
      const { service, queue, factory } = setup(enabled, store);
      await expect(service.page(0, 0, true)).rejects.toThrow('repair_disabled');
      expect(queue.isPaused).not.toHaveBeenCalled();
      expect(factory).not.toHaveBeenCalled();
    },
  );
  it('requires paused queues before opening Oracle', async () => {
    const { service, factory } = setup(true, 'supabase', false);
    await expect(service.page(0, 0, true)).rejects.toThrow('queue_not_paused');
    expect(factory).not.toHaveBeenCalled();
  });
  it.each([
    [-1, 0],
    [10001, 0],
    [0, 1],
    [0, 20100],
  ])('rejects unbounded selectors %i/%i', async (index, offset) => {
    const { service, factory } = setup(true, 'supabase');
    await expect(service.page(index, offset, true)).rejects.toThrow(
      'invalid_page',
    );
    expect(factory).not.toHaveBeenCalled();
  });

  function accountingPage(sourceHasIdentity: boolean) {
    const { service } = setup(true, 'supabase');
    const row = {
      id: 'oracle-created',
      sourceId: 'source',
      sourceAts: 'greenhouse',
      boardToken: 'board',
      externalJobId: 'legitimate',
      listingStatus: 'open',
    };
    const target = {
      healthCheck: jest.fn(),
      listSourceJobsPage: jest
        .fn()
        .mockResolvedValue({ rows: [row], total: 501 }),
      deleteVerifiedExtras: jest.fn(),
    };
    const internal = service as unknown as {
      guard: jest.Mock;
      target: jest.Mock;
      source: unknown;
      getOracleRowsByExternalIds: jest.Mock;
      getSupabaseRowsByExternalIds: jest.Mock;
      readSourceSignals: jest.Mock;
      getOracleSignals: jest.Mock;
    };
    internal.guard = jest.fn().mockResolvedValue(['source']);
    internal.target = jest.fn().mockReturnValue(target);
    internal.source = {
      listSourceJobsPage: jest.fn().mockResolvedValue({ rows: [], total: 500 }),
    };
    internal.getOracleRowsByExternalIds = jest.fn().mockResolvedValue([]);
    internal.getSupabaseRowsByExternalIds = jest
      .fn()
      .mockResolvedValue(sourceHasIdentity ? [row] : []);
    internal.readSourceSignals = jest.fn().mockResolvedValue([]);
    internal.getOracleSignals = jest.fn().mockResolvedValue([]);
    return { service, target, internal };
  }

  it('checks reciprocal identity even when the Supabase offset page is empty', async () => {
    const { service, internal } = accountingPage(true);
    expect(await service.page(0, 500, false)).toMatchObject({ extra: [] });
    expect(internal.getSupabaseRowsByExternalIds).toHaveBeenCalledWith(
      'source',
      ['legitimate'],
    );
  });

  it('preserves Oracle-only jobs and refuses synchronization until they are accounted for', async () => {
    const { service, target } = accountingPage(false);
    await expect(service.page(0, 500, true)).rejects.toThrow(
      'oracle_only_jobs_require_accounting',
    );
    expect(target.deleteVerifiedExtras).not.toHaveBeenCalled();
  });
});
