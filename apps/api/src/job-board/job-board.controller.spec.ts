import { BadRequestException } from '@nestjs/common';
import { JobBoardController } from './job-board.controller';
import type { JobBoardService } from './job-board.service';

describe('JobBoardController scheduler contract', () => {
  const queueEnabledSources = jest.fn();
  const queueSingleSource = jest.fn();
  const controller = new JobBoardController({
    queueEnabledSources,
    queueSingleSource,
  } as unknown as JobBoardService);

  beforeEach(() => {
    queueEnabledSources.mockReset();
    queueSingleSource.mockReset();
  });

  it.each([undefined, '', 'job-board-hour-2026-09-01T03:15', 'arbitrary-id'])(
    'rejects missing or malformed scheduler ID %p with 400',
    async (schedulerRunId) => {
      await expect(
        controller.queueEnabledSources(schedulerRunId),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(queueEnabledSources).not.toHaveBeenCalled();
    },
  );

  it('passes the validated scheduler ID and trigger origin to the service', async () => {
    queueEnabledSources.mockResolvedValue({
      status: 'queued',
      jobId: 'job-board-hour-2026-09-01T03',
    });
    await controller.queueEnabledSources(
      'job-board-hour-2026-09-01T03',
      'cron_jobs_org',
    );
    expect(queueEnabledSources).toHaveBeenCalledWith({
      schedulerRunId: 'job-board-hour-2026-09-01T03',
      triggerOrigin: 'cron_jobs_org',
    });
  });

  it('queues a validated single source for targeted recovery', async () => {
    queueSingleSource.mockResolvedValue({
      status: 'queued',
      jobId: 'job-board-manual-recover:source-1',
    });
    await controller.queueSingleSource(
      'source-1',
      'job-board-manual-recover',
      'manual',
    );
    expect(queueSingleSource).toHaveBeenCalledWith('source-1', {
      schedulerRunId: 'job-board-manual-recover',
      triggerOrigin: 'manual',
    });
  });

  it('rejects malformed single-source requests before queueing', async () => {
    await expect(
      controller.queueSingleSource('source-1', 'bad-id'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(queueSingleSource).not.toHaveBeenCalled();
  });
});
