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
    JobBoardProcessor,
    SlowJobBoardProcessor,
    EmployerMatchService,
    JobVisaSignalService,
    CompanyDiscoveryService,
  ],
})
export class JobBoardModule {}
