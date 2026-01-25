import { Controller, Post, Body, Get, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

@Controller('ocr')
export class OcrController {
    constructor(private readonly ocrService: OcrService) { }

    /**
     * Parse resume file (PDF/DOCX) and return extracted text
     * Used by Vercel frontend which can't run pdf-parse directly
     */
    @Post('parse-resume')
    @UseInterceptors(FileInterceptor('file'))
    async parseResume(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('No file uploaded');
        }

        const fileName = file.originalname.toLowerCase();
        let extractedText = '';

        if (fileName.endsWith('.pdf') || file.mimetype === 'application/pdf') {
            const data = await pdfParse(file.buffer);
            extractedText = (data.text || '').trim();
        } else if (fileName.endsWith('.docx') || file.mimetype.includes('wordprocessingml')) {
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            extractedText = result.value;
        } else {
            throw new Error('Unsupported file type');
        }

        return {
            success: true,
            text: extractedText,
            filename: file.originalname,
            length: extractedText.length
        };
    }

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
