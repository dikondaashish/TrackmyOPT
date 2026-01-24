import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { UscisService } from './uscis.service';
import { UscisController } from './uscis.controller';
import { UscisProcessor } from './uscis.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'uscis',
    }),
  ],
  providers: [UscisService, UscisProcessor],
  controllers: [UscisController],
  exports: [UscisService],
})
export class UscisModule { }
