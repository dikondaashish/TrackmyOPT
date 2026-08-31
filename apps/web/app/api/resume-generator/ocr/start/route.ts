import { NextRequest, NextResponse } from 'next/server';
import { textractService } from '@/lib/aws/textract';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getUserId } from '@/lib/auth/get-user-id';
import { createClient } from '@supabase/supabase-js';

const MAX_OCR_FILE_BYTES = 10 * 1024 * 1024;
const MAX_OCR_BASE64_CHARS = Math.ceil((MAX_OCR_FILE_BYTES * 4) / 3) + 4;

// CORS headers — restrict to first-party origin; in-app users post via cookie auth
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trackmyopt.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

function decodeScannedPdf(value: unknown): Buffer | null {
    if (
        typeof value !== 'string' ||
        value.length === 0 ||
        value.length > MAX_OCR_BASE64_CHARS ||
        value.length % 4 !== 0 ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(value)
    ) {
        return null;
    }

    const buffer = Buffer.from(value, 'base64');
    return buffer.length > 0 && buffer.length <= MAX_OCR_FILE_BYTES && buffer.subarray(0, 5).toString() === '%PDF-'
        ? buffer
        : null;
}

function safePdfFilename(value: unknown): string {
    if (typeof value !== 'string') return 'document.pdf';
    const filename = value
        .normalize('NFKC')
        .replace(/[^a-zA-Z0-9._-]+/g, '_')
        .replace(/^\.+/, '')
        .slice(0, 120);
    return filename || 'document.pdf';
}

/**
 * POST /api/resume-generator/ocr/start
 * Start OCR processing for a scanned PDF.
 *
 * ISS-024: persists job state in Supabase (table: ocr_jobs) so cold-start
 * serverless instances don't lose the in-memory Map. The previous version
 * declared a Map at module scope that never survived between calls.
 */
export async function POST(req: NextRequest) {
    // Auth (ISS-024 + general hardening — was unauthenticated before)
    const userId = await getUserId(req);
    if (!userId) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    try {
        const body: unknown = await req.json();
        const fileBuffer = typeof body === 'object' && body !== null
            ? (body as Record<string, unknown>).fileBuffer
            : undefined;
        const filename = typeof body === 'object' && body !== null
            ? (body as Record<string, unknown>).filename
            : undefined;

        const buffer = decodeScannedPdf(fileBuffer);
        if (!buffer) {
            return NextResponse.json(
                { ok: false, error: 'A valid PDF file buffer is required' },
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

            const timestamp = Date.now();
            const safeFilename = safePdfFilename(filename);
            const s3Key = `ocr-documents/${userId}/${timestamp}_${safeFilename}`;

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

            // Persist ownership before returning the public job identifier.
            // Without this row the status route must refuse to poll Textract.
            const admin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
            );
            const { error: persistError } = await admin.from('ocr_jobs').insert({
                user_id: userId,
                textract_job_id: textractJobId,
                status: 'IN_PROGRESS',
                s3_key: s3Key,
                file_name: safeFilename,
            });
            if (persistError) {
                console.error('[OCR] Failed to persist job ownership');
                return NextResponse.json(
                    { ok: false, error: 'Could not initialize secure OCR tracking' },
                    { status: 503, headers: corsHeaders }
                );
            }

            console.info('[OCR] Job started:', { textractJobId });

            // Return the textractJobId — client polls Textract via /ocr/status
            return NextResponse.json(
                { ok: true, jobId: textractJobId, textractJobId },
                { status: 202, headers: corsHeaders }
            );

        } catch (s3Error: any) {
            console.error('[OCR] S3/Textract error:', s3Error);
            return NextResponse.json(
                { ok: false, error: 'OCR processing failed' },
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
