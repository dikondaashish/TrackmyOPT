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
import { OracleIngestionRepairService } from './oracle-ingestion-repair.service';
import { OracleIngestionRepairController } from './oracle-ingestion-repair.controller';

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
  controllers: [JobBoardController, OracleIngestionRepairController],
  providers: [
    OracleIngestionRepairService,
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
