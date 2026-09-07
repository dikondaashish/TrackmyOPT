import { ConfigService } from '@nestjs/config';
import { OracleIngestionRepairService } from './oracle-ingestion-repair.service';
import { OracleJobDataStore } from './oracle-job-data-store';

describe('temporary production parity repair guards', () => {
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
    [177, 0],
    [0, 1],
    [0, 20100],
  ])('rejects unbounded selectors %i/%i', async (index, offset) => {
    const { service, factory } = setup(true, 'supabase');
    await expect(service.page(index, offset, true)).rejects.toThrow(
      'invalid_page',
    );
    expect(factory).not.toHaveBeenCalled();
  });
});
