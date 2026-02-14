import { NextRequest, NextResponse } from 'next/server';
import { textractService } from '@/lib/aws/textract';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// In-memory store for OCR jobs (in production use Redis/database)
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
 * GET /api/resume-generator/ocr/status?jobId=<id>
 * Check OCR processing status and get results
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');
        const textractJobId = searchParams.get('textractJobId');

        if (!jobId && !textractJobId) {
            return NextResponse.json(
                { status: 'failed', error: 'Missing jobId or textractJobId parameter' },
                { status: 400, headers: corsHeaders }
            );
        }

        // If we have a textractJobId, check directly with Textract
        if (textractJobId) {
            try {
                const result = await textractService.getDocumentTextDetection(textractJobId);

                if (result.status === 'IN_PROGRESS') {
                    return NextResponse.json(
                        { status: 'running' },
                        { status: 200, headers: corsHeaders }
                    );
                }

                if (result.status === 'SUCCEEDED') {
                    return NextResponse.json(
                        {
                            status: 'succeeded',
                            text: result.text || '',
                        },
                        { status: 200, headers: corsHeaders }
                    );
                }

                if (result.status === 'FAILED') {
                    return NextResponse.json(
                        {
                            status: 'failed',
                            error: result.error || 'OCR processing failed',
                        },
                        { status: 200, headers: corsHeaders }
                    );
                }

            } catch (textractError: any) {
                console.error('[OCR Status] Textract check failed:', textractError);
                return NextResponse.json(
                    { status: 'failed', error: 'Failed to check OCR status' },
                    { status: 200, headers: corsHeaders }
                );
            }
        }

        // Check in-memory job store
        const job = ocrJobs.get(jobId!);

        if (!job) {
            return NextResponse.json(
                { status: 'failed', error: 'OCR job not found' },
                { status: 404, headers: corsHeaders }
            );
        }

        // If job is already completed, return cached result
        if (job.status === 'succeeded') {
            return NextResponse.json(
                {
                    status: 'succeeded',
                    text: job.extractedText || '',
                    filename: job.filename,
                },
                { status: 200, headers: corsHeaders }
            );
        }

        if (job.status === 'failed') {
            return NextResponse.json(
                {
                    status: 'failed',
                    error: job.error || 'OCR processing failed',
                },
                { status: 200, headers: corsHeaders }
            );
        }

        // If job is running, check Textract status
        if (job.status === 'running' && job.textractJobId) {
            try {
                const result = await textractService.getDocumentTextDetection(job.textractJobId);

                if (result.status === 'IN_PROGRESS') {
                    return NextResponse.json(
                        { status: 'running' },
                        { status: 200, headers: corsHeaders }
                    );
                }

                if (result.status === 'SUCCEEDED') {
                    // Update job cache
                    job.status = 'succeeded';
                    job.extractedText = result.text;
                    ocrJobs.set(jobId!, job);

                    console.info('[OCR Status] Completed:', {
                        jobId,
                        textLength: result.text?.length || 0
                    });

                    return NextResponse.json(
                        {
                            status: 'succeeded',
                            text: result.text || '',
                            filename: job.filename,
                        },
                        { status: 200, headers: corsHeaders }
                    );
                }

                if (result.status === 'FAILED') {
                    // Update job cache
                    job.status = 'failed';
                    job.error = result.error;
                    ocrJobs.set(jobId!, job);

                    return NextResponse.json(
                        {
                            status: 'failed',
                            error: result.error || 'OCR processing failed',
                        },
                        { status: 200, headers: corsHeaders }
                    );
                }

            } catch (textractError: any) {
                console.error('[OCR Status] Textract check failed:', textractError);

                // Update job cache
                job.status = 'failed';
                job.error = textractError?.message || 'Failed to check OCR status';
                ocrJobs.set(jobId!, job);

                return NextResponse.json(
                    { status: 'failed', error: 'Failed to check OCR status' },
                    { status: 200, headers: corsHeaders }
                );
            }
        }

        // Default to running
        return NextResponse.json(
            { status: 'running' },
            { status: 200, headers: corsHeaders }
        );

    } catch (error: any) {
        console.error('[OCR Status] Error:', error);
        return NextResponse.json(
            { status: 'failed', error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
