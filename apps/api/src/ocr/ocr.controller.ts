import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  /**
   * Parse resume file (PDF/DOCX) and return extracted text
   * Used by Vercel frontend which can't run pdf-parse directly
   */
  @Post('parse-resume')
  @UseInterceptors(FileInterceptor('file'))
  async parseResume(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const fileName = file.originalname.toLowerCase();
    let extractedText = '';
    let s3Key = '';

    try {
      // Upload to S3 for persistence (download feature)
      s3Key = await this.ocrService.uploadToS3(
        file.buffer.toString('base64'),
        file.originalname,
      );

      if (fileName.endsWith('.pdf') || file.mimetype === 'application/pdf') {
        const data = await pdfParse(file.buffer);
        extractedText = (data.text || '').trim();
      } else if (
        fileName.endsWith('.docx') ||
        file.mimetype.includes('wordprocessingml')
      ) {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = result.value;
      } else {
        throw new HttpException(
          'Unsupported file type',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to parse file: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      success: true,
      text: extractedText,
      filename: file.originalname,
      length: extractedText.length,
      s3Key: s3Key,
    };
  }

  /**
   * Direct OCR processing (synchronous, no queue)
   * Upload file, run Textract, return result
   */
  @Post('direct')
  async directOcr(@Body() body: { fileBuffer: string; filename: string }) {
    if (!body.fileBuffer || !body.filename) {
      throw new HttpException(
        'fileBuffer and filename are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Upload to S3
      const s3Key = await this.ocrService.uploadToS3(
        body.fileBuffer,
        body.filename,
      );

      // Process with Textract directly (synchronous)
      const text = await this.ocrService.processTextractJob(s3Key);

      return {
        ok: true,
        text: text,
        filename: body.filename,
        s3Key: s3Key,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        errorMessage || 'OCR processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('queue')
  async queueJob(
    @Body() body: { fileBuffer?: string; s3Key?: string; filename: string },
  ) {
    try {
      let s3Key = body.s3Key;

      if (body.fileBuffer) {
        // Upload to S3 if buffer provided
        s3Key = await this.ocrService.uploadToS3(
          body.fileBuffer,
          body.filename,
        );
      }

      if (!s3Key) {
        throw new HttpException(
          'No file provided (s3Key or fileBuffer required)',
          HttpStatus.BAD_REQUEST,
        );
      }

      const job = await this.ocrService.queueOcrJob(s3Key, body.filename);
      return {
        ok: true,
        status: 'queued',
        jobId: job.id,
        textractJobId: job.id, // For compatibility with frontend polling
        timestamp: new Date(),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        errorMessage || 'Failed to queue OCR job',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
