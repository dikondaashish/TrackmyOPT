import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import * as Bull from 'bull';
import {
  TextractClient,
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand,
} from '@aws-sdk/client-textract';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

interface TextractBlock {
  BlockType?: string;
  Text?: string;
}

interface TextractResponse {
  JobStatus?: string;
  NextToken?: string;
  Blocks?: TextractBlock[];
  StatusMessage?: string;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private textractClient: TextractClient;
  private s3Client: S3Client;
  private bucket: string;

  constructor(
    @InjectQueue('ocr') private ocrQueue: Bull.Queue,
    private configService: ConfigService,
  ) {
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';

    // Initialize Clients
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    if (region && accessKeyId && secretAccessKey) {
      this.textractClient = new TextractClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
      this.s3Client = new S3Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.logger.warn('AWS Credentials not found. OCR Service disabled.');
    }
  }

  async uploadToS3(fileBuffer: string, filename: string): Promise<string> {
    const buffer = Buffer.from(fileBuffer, 'base64');
    const timestamp = Date.now();
    const s3Key = `ocr-documents/${timestamp}_${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: 'application/pdf',
    });

    await this.s3Client.send(command);
    return s3Key;
  }

  async queueOcrJob(s3Key: string, filename: string) {
    this.logger.log(`Queueing OCR job for ${filename} (${s3Key})`);
    return this.ocrQueue.add('parse-pdf', {
      s3Key,
      filename,
    });
  }

  async getJobStatus(jobId: string) {
    const job = await this.ocrQueue.getJob(jobId);
    if (!job) return null;

    return {
      id: job.id,
      state: String(await job.getState()),
      progress: job.progress() as unknown,
      result: job.returnvalue as unknown,
      error: job.failedReason ? String(job.failedReason) : undefined,
    };
  }

  // Helper method to poll Textract (used by Processor)
  async processTextractJob(s3Key: string): Promise<string> {
    if (!this.textractClient)
      throw new Error('Textract Client not initialized');

    // 1. Start Job
    const params: import('@aws-sdk/client-textract').StartDocumentTextDetectionCommandInput =
      {
        DocumentLocation: {
          S3Object: { Bucket: String(this.bucket), Name: String(s3Key) },
        },
      };
    const startCommand = new StartDocumentTextDetectionCommand(params);

    const startResponse = await this.textractClient.send(startCommand);
    const textractJobId = startResponse.JobId;

    if (!textractJobId) {
      throw new Error('Failed to start Textract Job (No JobId returned)');
    }

    this.logger.log(`Textract Job Started: ${textractJobId}`);

    // 2. Poll for results
    return this.pollTextractResults(textractJobId);
  }

  private async pollTextractResults(textractJobId: string): Promise<string> {
    let status: string | undefined = 'IN_PROGRESS';
    let nextToken: string | undefined = undefined;
    let text = '';

    while (status === 'IN_PROGRESS') {
      await new Promise((r) => setTimeout(r, 2000)); // Sleep 2s

      const command = new GetDocumentTextDetectionCommand({
        JobId: textractJobId,
        NextToken: nextToken,
      });

      const response = (await this.textractClient.send(
        command,
      )) as unknown as TextractResponse;
      status = response.JobStatus || 'FAILED'; // Fallback if undefined

      if (status === 'SUCCEEDED') {
        response.Blocks?.forEach((block) => {
          if (block.BlockType === 'LINE' && block.Text) {
            text += block.Text + '\n';
          }
        });

        if (response.NextToken) {
          nextToken = response.NextToken;
          status = 'IN_PROGRESS'; // Continue paging
        } else {
          nextToken = undefined;
        }
      } else if (status === 'FAILED') {
        throw new Error(`Textract Job Failed: ${response.StatusMessage}`);
      }
    }
    return text;
  }
}
