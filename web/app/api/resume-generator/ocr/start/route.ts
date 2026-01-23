import { NextRequest, NextResponse } from 'next/server';
import { textractService } from '@/lib/textract';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// In-memory store for OCR jobs (in production, use a database)
const ocrJobs = new Map<string, {
    status: 'queued' | 'running' | 'succeeded' | 'failed';
    textractJobId?: string;
    extractedText?: string;
    error?: string;
    filename?: string;
    s3Key?: string;
    createdAt: Date;
}>();

/**
 * POST /api/resume-generator/ocr/start
 * Start OCR processing for a scanned PDF
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fileBuffer, filename } = body;

        if (!fileBuffer) {
            return NextResponse.json(
                { ok: false, error: 'No file buffer provided' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Check if Textract is available
        if (!textractService.isAvailable()) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'OCR service not available. Please paste resume text manually instead.',
                    reason: 'AWS Textract not configured'
                },
                { status: 503, headers: corsHeaders }
            );
        }

        // Validate AWS configuration
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY ||
            !process.env.AWS_REGION || !process.env.AWS_S3_BUCKET) {
            return NextResponse.json(
                { ok: false, error: 'AWS configuration incomplete for OCR' },
                { status: 503, headers: corsHeaders }
            );
        }

        try {
            // Upload file to S3
            const s3Client = new S3Client({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
            });

            const buffer = Buffer.from(fileBuffer, 'base64');
            const timestamp = Date.now();
            const jobId = `ocr_${timestamp}_${Math.random().toString(36).substring(7)}`;
            const s3Key = `ocr-documents/${timestamp}_${filename || 'document.pdf'}`;

            const uploadCommand = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: s3Key,
                Body: buffer,
                ContentType: 'application/pdf',
            });

            await s3Client.send(uploadCommand);
            console.info('[OCR] File uploaded to S3:', { s3Key });

            // Start Textract job
            const textractJobId = await textractService.startDocumentTextDetection(s3Key);

            if (!textractJobId) {
                return NextResponse.json(
                    { ok: false, error: 'Failed to start OCR processing' },
                    { status: 500, headers: corsHeaders }
                );
            }

            // Store job info
            ocrJobs.set(jobId, {
                status: 'running',
                textractJobId,
                filename,
                s3Key,
                createdAt: new Date(),
            });

            console.info('[OCR] Job started:', { textractJobId });

            // Return the textractJobId - client will poll using this
            return NextResponse.json(
                { ok: true, jobId: textractJobId, textractJobId },
                { status: 202, headers: corsHeaders }
            );

        } catch (s3Error: any) {
            console.error('[OCR] S3/Textract error:', s3Error);
            return NextResponse.json(
                { ok: false, error: `OCR processing failed: ${s3Error?.message || 'Unknown error'}` },
                { status: 500, headers: corsHeaders }
            );
        }

    } catch (error: any) {
        console.error('[OCR] Start error:', error);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
