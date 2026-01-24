import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OcrService } from './ocr.service';

@Controller('ocr')
export class OcrController {
    constructor(private readonly ocrService: OcrService) { }

    @Post('queue')
    async queueJob(@Body() body: { fileBuffer?: string, s3Key?: string, filename: string }) {
        let s3Key = body.s3Key;

        if (body.fileBuffer) {
            // Upload to S3 if buffer provided
            s3Key = await this.ocrService.uploadToS3(body.fileBuffer, body.filename);
        }

        if (!s3Key) {
            throw new Error('No file provided (s3Key or fileBuffer required)');
        }

        const job = await this.ocrService.queueOcrJob(s3Key, body.filename);
        return {
            status: 'queued',
            jobId: job.id,
            timestamp: new Date(),
        };
    }

    @Get('status/:id')
    async getStatus(@Param('id') id: string) {
        const status = await this.ocrService.getJobStatus(id);
        if (!status) {
            return { status: 'not_found' };
        }
        return status;
    }
}
