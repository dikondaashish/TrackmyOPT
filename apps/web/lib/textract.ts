import {
    TextractClient,
    StartDocumentTextDetectionCommand,
    GetDocumentTextDetectionCommand
} from "@aws-sdk/client-textract";

/**
 * AWS Textract service for OCR functionality
 * Used to extract text from scanned/image-based PDFs
 */
class TextractService {
    private client: TextractClient | null = null;
    private bucket: string;

    constructor() {
        this.bucket = process.env.AWS_S3_BUCKET || '';
        this.initializeClient();
    }

    private initializeClient() {
        try {
            if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
                console.warn('[TextractService] AWS credentials not configured');
                return;
            }

            this.client = new TextractClient({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
            });

            console.info('[TextractService] ✅ Initialized successfully');
        } catch (error) {
            console.error('[TextractService] ❌ Failed to initialize:', error);
        }
    }

    isAvailable(): boolean {
        const available = this.client !== null &&
            this.bucket !== '' &&
            process.env.OCR_TEXTRACT_ENABLED === 'true';

        console.info('[TextractService] Availability check:', {
            hasClient: this.client !== null,
            hasBucket: this.bucket !== '',
            enabled: process.env.OCR_TEXTRACT_ENABLED === 'true',
            available
        });

        return available;
    }

    /**
     * Start async document text detection
     */
    async startDocumentTextDetection(s3Key: string): Promise<string | null> {
        if (!this.client) {
            throw new Error('Textract client not initialized');
        }

        try {
            const command = new StartDocumentTextDetectionCommand({
                DocumentLocation: {
                    S3Object: {
                        Bucket: this.bucket,
                        Name: s3Key,
                    },
                },
            });

            const response = await this.client.send(command);
            console.info('[TextractService] Job started:', {
                jobId: response.JobId,
                s3Key
            });

            return response.JobId || null;
        } catch (error: any) {
            console.error('[TextractService] Start failed:', {
                error: error?.message,
                s3Key,
                bucket: this.bucket
            });
            throw error;
        }
    }

    /**
     * Get document text detection results
     */
    async getDocumentTextDetection(jobId: string): Promise<{
        status: 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
        text?: string;
        error?: string;
    }> {
        if (!this.client) {
            throw new Error('Textract client not initialized');
        }

        try {
            const command = new GetDocumentTextDetectionCommand({
                JobId: jobId,
            });

            const response = await this.client.send(command);

            if (response.JobStatus === 'IN_PROGRESS') {
                return { status: 'IN_PROGRESS' };
            }

            if (response.JobStatus === 'FAILED') {
                return {
                    status: 'FAILED',
                    error: response.StatusMessage || 'Textract job failed'
                };
            }

            if (response.JobStatus === 'SUCCEEDED') {
                // Extract text from blocks
                let extractedText = '';

                if (response.Blocks) {
                    const textBlocks = response.Blocks.filter(block => block.BlockType === 'LINE');
                    extractedText = textBlocks
                        .map(block => block.Text || '')
                        .filter(text => text.trim().length > 0)
                        .join('\n');
                }

                // Handle pagination for large documents
                let nextToken = response.NextToken;
                while (nextToken) {
                    const nextCommand = new GetDocumentTextDetectionCommand({
                        JobId: jobId,
                        NextToken: nextToken,
                    });

                    const nextResponse = await this.client.send(nextCommand);

                    if (nextResponse.Blocks) {
                        const textBlocks = nextResponse.Blocks.filter(block => block.BlockType === 'LINE');
                        const additionalText = textBlocks
                            .map(block => block.Text || '')
                            .filter(text => text.trim().length > 0)
                            .join('\n');

                        extractedText += '\n' + additionalText;
                    }

                    nextToken = nextResponse.NextToken;
                }

                console.info('[TextractService] Extraction complete:', {
                    jobId,
                    textLength: extractedText.length
                });

                return {
                    status: 'SUCCEEDED',
                    text: extractedText.trim()
                };
            }

            return { status: 'FAILED', error: 'Unknown job status' };
        } catch (error: any) {
            console.error('[TextractService] Get failed:', {
                error: error?.message,
                jobId
            });
            throw error;
        }
    }
}

export const textractService = new TextractService();
