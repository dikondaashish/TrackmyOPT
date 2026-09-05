import { ConfigService } from '@nestjs/config';
import { JobBoardService } from './job-board.service';

function createService(store: { close: jest.Mock }, pauseOnBoot = false) {
  const config = {
    get: jest.fn((key: string) => {
      if (key === 'NEXT_PUBLIC_SUPABASE_URL')
        return 'https://example.supabase.co';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-service-role';
      if (key === 'JOB_BOARD_QUEUE_CONTROL_ENABLED') return true;
      if (key === 'JOB_BOARD_QUEUE_PAUSE_ON_BOOT') return pauseOnBoot;
      return undefined;
    }),
  } as unknown as ConfigService;
  const queue = {
    pause: jest.fn().mockResolvedValue(undefined),
    resume: jest.fn().mockResolvedValue(undefined),
    getJobCounts: jest.fn().mockResolvedValue({ waiting: 0 }),
  };
  const employerMatches = {};
  const visaSignals = {};
  const service = new JobBoardService(
    config,
    queue as never,
    queue as never,
    employerMatches as never,
    visaSignals as never,
    store as never,
  );
  return { service, queue };
}

describe('JobBoardService shutdown lifecycle', () => {
  it('pauses only the job-board queues when the boot guard is enabled', async () => {
    const store = { close: jest.fn().mockResolvedValue(undefined) };
    const { service, queue } = createService(store, true);

    await service.onModuleInit();

    expect(queue.pause).toHaveBeenCalledWith();
    expect(queue.pause).toHaveBeenCalledTimes(2);
  });

  it('waits for active source work before closing the data store', async () => {
    const store = { close: jest.fn().mockResolvedValue(undefined) };
    const { service } = createService(store);
    let release!: () => void;
    const active = new Promise<void>((resolve) => {
      release = resolve;
    });
    const internals = service as unknown as {
      activeSourceWork: Set<Promise<unknown>>;
    };
    internals.activeSourceWork.add(active);

    const shutdown = service.onModuleDestroy();
    await Promise.resolve();
    expect(store.close).not.toHaveBeenCalled();

    release();
    await shutdown;
    expect(store.close).toHaveBeenCalledTimes(1);
  });

  it('closes the data store when there is no active source work', async () => {
    const store = { close: jest.fn().mockResolvedValue(undefined) };
    const { service } = createService(store);

    await service.onModuleDestroy();

    expect(store.close).toHaveBeenCalledTimes(1);
  });
});
