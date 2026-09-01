import { BadRequestException } from '@nestjs/common';
import { JobBoardController } from './job-board.controller';
import type { JobBoardService } from './job-board.service';

describe('JobBoardController scheduler contract', () => {
  const queueEnabledSources = jest.fn();
  const controller = new JobBoardController({
    queueEnabledSources,
  } as unknown as JobBoardService);

  beforeEach(() => queueEnabledSources.mockReset());

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
});
