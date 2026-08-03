import { NextRequest, NextResponse } from 'next/server';
import { textractService } from '@/lib/aws/textract';
import { getUserId } from '@/lib/auth/get-user-id';
import { createClient } from '@supabase/supabase-js';

// CORS headers — restrict to first-party
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trackmyopt.com',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/resume-generator/ocr/status?textractJobId=<id>
 *
 * ISS-024: durable status lookup. We persist completion to Supabase so cold
 * starts don't lose state, and we still hit Textract directly when needed.
 */
export async function GET(req: NextRequest) {
    const userId = await getUserId(req);
    if (!userId) {
        return NextResponse.json(
            { status: 'failed', error: 'Unauthorized' },
            { status: 401, headers: corsHeaders }
        );
    }

    try {
        const { searchParams } = new URL(req.url);
        const textractJobId = searchParams.get('textractJobId') || searchParams.get('jobId');

        if (!textractJobId) {
            return NextResponse.json(
                { status: 'failed', error: 'Missing textractJobId parameter' },
                { status: 400, headers: corsHeaders }
            );
        }

        const admin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );

        // First check our durable store. If we already have a terminal result, return it.
        const { data: cached, error: lookupError } = await admin
            .from('ocr_jobs')
            .select('user_id, status, extracted_text, error_message, file_name')
            .eq('textract_job_id', textractJobId)
            .maybeSingle();

        if (lookupError) {
            console.error('[OCR Status] Ownership lookup failed');
            return NextResponse.json(
                { status: 'failed', error: 'OCR job lookup failed' },
                { status: 503, headers: corsHeaders }
            );
        }

        // A Textract ID is never sufficient authority by itself. The start
        // route must have persisted an owner-bound job before this route polls.
        if (!cached) {
            return NextResponse.json(
                { status: 'failed', error: 'OCR job not found' },
                { status: 404, headers: corsHeaders }
            );
        }

        // RLS bypass via service role — manually enforce ownership.
        if (cached.user_id !== userId) {
            return NextResponse.json(
                { status: 'failed', error: 'Forbidden' },
                { status: 403, headers: corsHeaders }
            );
        }

        if (cached?.status === 'SUCCEEDED') {
            return NextResponse.json(
                { status: 'succeeded', text: cached.extracted_text || '', filename: cached.file_name },
                { status: 200, headers: corsHeaders }
            );
        }
        if (cached?.status === 'FAILED') {
            return NextResponse.json(
                { status: 'failed', error: cached.error_message || 'OCR processing failed' },
                { status: 200, headers: corsHeaders }
            );
        }

        // Live check with Textract
        try {
            const result = await textractService.getDocumentTextDetection(textractJobId);

            if (result.status === 'IN_PROGRESS') {
                return NextResponse.json(
                    { status: 'running' },
                    { status: 200, headers: corsHeaders }
                );
            }

            if (result.status === 'SUCCEEDED') {
                // Persist completion so subsequent polls hit Supabase, not Textract.
                try {
                    await admin
                        .from('ocr_jobs')
                        .update({ status: 'SUCCEEDED', extracted_text: result.text || '' })
                        .eq('textract_job_id', textractJobId)
                        .eq('user_id', userId);
                } catch { /* non-fatal */ }

                return NextResponse.json(
                    { status: 'succeeded', text: result.text || '' },
                    { status: 200, headers: corsHeaders }
                );
            }

            if (result.status === 'FAILED' || result.status === 'PARTIAL_SUCCESS') {
                try {
                    await admin
                        .from('ocr_jobs')
                        .update({ status: 'FAILED', error_message: result.error || 'Textract failed' })
                        .eq('textract_job_id', textractJobId)
                        .eq('user_id', userId);
                } catch { /* non-fatal */ }

                return NextResponse.json(
                    { status: 'failed', error: result.error || 'OCR processing failed' },
                    { status: 200, headers: corsHeaders }
                );
            }

            return NextResponse.json(
                { status: 'running' },
                { status: 200, headers: corsHeaders }
            );
        } catch (textractError: unknown) {
            const msg = textractError instanceof Error ? textractError.message : 'unknown';
            console.error('[OCR Status] Textract check failed:', msg);
            return NextResponse.json(
                { status: 'failed', error: 'Failed to check OCR status' },
                { status: 200, headers: corsHeaders }
            );
        }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Internal server error';
        console.error('[OCR Status] Error:', msg);
        return NextResponse.json(
            { status: 'failed', error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
