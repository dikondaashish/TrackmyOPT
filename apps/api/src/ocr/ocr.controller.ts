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

const MAX_RESUME_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_DOCX_EXPANDED_BYTES = 25 * 1024 * 1024;
const MAX_DOCX_ENTRIES = 1_000;
const RESUME_PARSE_TIMEOUT_MS = 10_000;
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const ZIP_LOCAL_FILE_HEADER = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const ZIP_CENTRAL_DIRECTORY_HEADER = Buffer.from([0x50, 0x4b, 0x01, 0x02]);

function hasPrefix(buffer: Buffer, prefix: Buffer): boolean {
  return (
    buffer.length >= prefix.length &&
    buffer.subarray(0, prefix.length).equals(prefix)
  );
}

function assertSafeDocxArchive(buffer: Buffer): void {
  if (!hasPrefix(buffer, ZIP_LOCAL_FILE_HEADER)) {
    throw new HttpException(
      'Invalid DOCX file content',
      HttpStatus.BAD_REQUEST,
    );
  }

  let offset = 0;
  let entryCount = 0;
  let totalExpandedBytes = 0;
  let containsDocumentXml = false;

  while (offset < buffer.length) {
    const headerOffset = buffer.indexOf(ZIP_CENTRAL_DIRECTORY_HEADER, offset);
    if (headerOffset === -1) break;
    if (headerOffset + 46 > buffer.length) {
      throw new HttpException(
        'Invalid DOCX archive structure',
        HttpStatus.BAD_REQUEST,
      );
    }

    const expandedBytes = buffer.readUInt32LE(headerOffset + 24);
    const fileNameLength = buffer.readUInt16LE(headerOffset + 28);
    const extraLength = buffer.readUInt16LE(headerOffset + 30);
    const commentLength = buffer.readUInt16LE(headerOffset + 32);
    const entryEnd =
      headerOffset + 46 + fileNameLength + extraLength + commentLength;
    if (entryEnd > buffer.length || expandedBytes === 0xffffffff) {
      throw new HttpException(
        'Unsupported DOCX archive structure',
        HttpStatus.BAD_REQUEST,
      );
    }

    const fileName = buffer
      .subarray(headerOffset + 46, headerOffset + 46 + fileNameLength)
      .toString('utf8')
      .replaceAll('\\', '/')
      .toLowerCase();
    containsDocumentXml ||= fileName === 'word/document.xml';
    entryCount += 1;
    totalExpandedBytes += expandedBytes;

    if (entryCount > MAX_DOCX_ENTRIES) {
      throw new HttpException(
        'DOCX archive contains too many files',
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }
    if (totalExpandedBytes > MAX_DOCX_EXPANDED_BYTES) {
      throw new HttpException(
        'DOCX expanded content is too large',
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }
    offset = entryEnd;
  }

  if (entryCount === 0 || !containsDocumentXml) {
    throw new HttpException(
      'Invalid DOCX archive structure',
      HttpStatus.BAD_REQUEST,
    );
  }
}

async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error('Resume parsing timed out')),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  /**
   * Parse resume file (PDF/DOCX) and return extracted text
   * Used by Vercel frontend which can't run pdf-parse directly
   */
  @Post('parse-resume')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_RESUME_UPLOAD_BYTES, files: 1 },
    }),
  )
  async parseResume(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    if (
      file.buffer.length > MAX_RESUME_UPLOAD_BYTES ||
      file.size > MAX_RESUME_UPLOAD_BYTES
    ) {
      throw new HttpException(
        'Resume file is too large',
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    const fileName = file.originalname.toLowerCase();
    const declaresPdf =
      fileName.endsWith('.pdf') || file.mimetype === 'application/pdf';
    const declaresDocx =
      fileName.endsWith('.docx') || file.mimetype === DOCX_MIME;
    const hasPdfSignature = hasPrefix(file.buffer, Buffer.from('%PDF-'));
    const hasDocxSignature = hasPrefix(file.buffer, ZIP_LOCAL_FILE_HEADER);

    if (declaresPdf && hasPdfSignature) {
      // Validated below by the parser.
    } else if (declaresDocx && hasDocxSignature) {
      assertSafeDocxArchive(file.buffer);
    } else {
      throw new HttpException(
        'Unsupported or invalid file type',
        HttpStatus.BAD_REQUEST,
      );
    }

    let extractedText = '';
    let s3Key = '';

    try {
      if (declaresPdf && hasPdfSignature) {
        const data = await withTimeout(
          pdfParse(file.buffer),
          RESUME_PARSE_TIMEOUT_MS,
        );
        extractedText = (data.text || '').trim();
      } else {
        // Mammoth 1.11+ disables external file access by default for this API.
        const result = await withTimeout(
          mammoth.extractRawText({ buffer: file.buffer }),
          RESUME_PARSE_TIMEOUT_MS,
        );
        extractedText = result.value;
      }

      // Persist only after the hostile input has passed validation and parsing.
      s3Key = await this.ocrService.uploadToS3(
        file.buffer.toString('base64'),
        file.originalname,
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
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
