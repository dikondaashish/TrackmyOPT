import { BadRequestException } from '@nestjs/common';
import { JobBoardController } from './job-board.controller';
import type { JobBoardService } from './job-board.service';
import type { JobVisaSignalService } from './job-visa-signal.service';

describe('JobBoardController scheduler contract', () => {
  const queueEnabledSources = jest.fn();
  const queueSingleSource = jest.fn();
  const listJobs = jest.fn();
  const getJob = jest.fn();
  const getIngestionRunStatus = jest.fn();
  const listForJobs = jest.fn().mockResolvedValue([]);
  const controller = new JobBoardController(
    {
      queueEnabledSources,
      queueSingleSource,
      listJobs,
      getJob,
      getIngestionRunStatus,
    } as unknown as JobBoardService,
    { listForJobs } as unknown as JobVisaSignalService,
  );

  beforeEach(() => {
    queueEnabledSources.mockReset();
    queueSingleSource.mockReset();
    listJobs.mockReset();
    getJob.mockReset();
    listForJobs.mockReset().mockResolvedValue([]);
  });

  it('allows only normalized run IDs for read-only supervision', async () => {
    await expect(
      controller.ingestionRunStatus('arbitrary'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(getIngestionRunStatus).not.toHaveBeenCalled();
    getIngestionRunStatus.mockResolvedValue({ status: 'running' });
    await expect(
      controller.ingestionRunStatus('job-board-manual-existing'),
    ).resolves.toEqual({ status: 'running' });
    expect(getIngestionRunStatus).toHaveBeenCalledWith(
      'job-board-manual-existing',
    );
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

  it('passes job filters to the selected server-side store', async () => {
    listJobs.mockResolvedValue({ rows: [], total: 0 });
    await controller.listJobs({
      page: '2',
      pageSize: '25',
      query: 'engineer',
      searchScope: 'title',
      workplace: 'remote',
      employerEvidence: 'source_backed',
      includeJobUrls: 'https://example.test/a,https://example.test/b',
    });
    expect(listJobs).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        pageSize: 25,
        query: 'engineer',
        searchScope: 'title',
        workplace: 'remote',
        employerEvidence: 'source_backed',
        includeJobUrls: ['https://example.test/a', 'https://example.test/b'],
      }),
    );
    expect(listForJobs).toHaveBeenCalledWith([]);
  });
});
