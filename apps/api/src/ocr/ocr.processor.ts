import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as Bull from 'bull';
import { OcrService } from './ocr.service';

@Processor('ocr')
export class OcrProcessor {
    private readonly logger = new Logger(OcrProcessor.name);

    constructor(private readonly ocrService: OcrService) { }

    @Process('parse-pdf')
    async handlePdfParsing(job: Bull.Job<{ s3Key: string, filename: string }>) {
        this.logger.log(`Processing Job ${job.id}: ${job.data.filename}`);
        await job.progress(10);

        try {
            // Processing logic (Call Textract)
            const text = await this.ocrService.processTextractJob(job.data.s3Key);

            await job.progress(100);
            return {
                status: 'succeeded',
                text,
                filename: job.data.filename
            };
        } catch (error: any) {
            this.logger.error(`Job ${job.id} failed: ${error.message}`);
            throw error;
        }
    }
}
