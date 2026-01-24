import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';
import { OcrProcessor } from './ocr.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ocr',
    }),
  ],
  providers: [OcrService, OcrProcessor],
  controllers: [OcrController],
  exports: [OcrService],
})
export class OcrModule { }
