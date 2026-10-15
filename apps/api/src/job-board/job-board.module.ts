import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobBoardController } from './job-board.controller';
import {
  JobBoardProcessor,
  SlowJobBoardProcessor,
} from './job-board.processor';
import { JobBoardService } from './job-board.service';
import { EmployerMatchService } from './employer-match.service';
import { JobVisaSignalService } from './job-visa-signal.service';
import { CompanyDiscoveryService } from './company-discovery.service';
import { jobDataStoreProvider } from './job-data-store.provider';
import { isJobBoardWorkerEnabled } from './ingestion-automation-config';
import { JobBoardFailureReporter } from './job-board-failure-reporter';

/**
 * Bull consumers are registered only where JOB_BOARD_WORKER_ENABLED is not
 * "false". The website API can then enqueue and serve jobs without running
 * ingestion work, leaving one dedicated worker as the only consumer.
 */
export function jobBoardWorkerProviders(env: NodeJS.ProcessEnv = process.env) {
  return isJobBoardWorkerEnabled(env.JOB_BOARD_WORKER_ENABLED)
    ? [JobBoardProcessor, SlowJobBoardProcessor]
    : [];
}

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'job-board',
      settings: {
        lockDuration: 30_000,
        stalledInterval: 30_000,
        maxStalledCount: 1,
      },
    }),
    BullModule.registerQueue({
      name: 'job-board-slow',
      settings: {
        lockDuration: 30_000,
        stalledInterval: 30_000,
        maxStalledCount: 1,
      },
    }),
  ],
  controllers: [JobBoardController],
  providers: [
    jobDataStoreProvider,
    JobBoardService,
    JobBoardFailureReporter,
    ...jobBoardWorkerProviders(),
    EmployerMatchService,
    JobVisaSignalService,
    CompanyDiscoveryService,
  ],
})
export class JobBoardModule {}
