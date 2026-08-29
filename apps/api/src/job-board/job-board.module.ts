import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobBoardController } from './job-board.controller';
import { JobBoardProcessor } from './job-board.processor';
import { JobBoardService } from './job-board.service';
import { EmployerMatchService } from './employer-match.service';
import { JobVisaSignalService } from './job-visa-signal.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'job-board' })],
  controllers: [JobBoardController],
  providers: [JobBoardService, JobBoardProcessor, EmployerMatchService, JobVisaSignalService],
})
export class JobBoardModule {}
