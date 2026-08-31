import { NextRequest, NextResponse } from 'next/server';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { normalizeResumeText, prepareResumeText } from '@/lib/resume/resume-text-limits';
import { getUserId } from '@/lib/auth/get-user-id';

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

export const runtime = 'nodejs';

/**
 * POST /api/resume-generator/upload
 * Routes PDF parsing to backend API (Render) which has proper Node.js environment
 *
 * Auth via getUserId (cookie OR extension Bearer token), matching every other
 * resume-generator route — this one was cookie-only until the Chrome extension
 * needed to call it for the side panel's upload option.
 */
export async function POST(req: NextRequest) {
    const corsHeaders = corsHeadersWebAndExtension(req);
    try {
        const userId = await getUserId(req);

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401, headers: corsHeaders }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400, headers: corsHeaders }
            );
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File too large. Maximum size is 10MB.' },
                { status: 413, headers: corsHeaders }
            );
        }

        const fileName = file.name.toLowerCase();
        const buffer = Buffer.from(await file.arrayBuffer());
        let extractedText = '';
        let s3Key: string | null = null;

        try {
            // PDF & DOCX: Route to backend API (Render) for reliable parsing
            if (fileName.endsWith('.pdf') || file.type === 'application/pdf' ||
                fileName.endsWith('.docx') || file.type.includes('wordprocessingml')) {

                const backendUrl = process.env.NEXT_PUBLIC_API_URL;
                if (!backendUrl) {
                    throw new Error('Backend API URL not configured');
                }

                // Forward to backend
                const backendFormData = new FormData();
                backendFormData.append('file', new Blob([buffer], { type: file.type }), file.name);

                const response = await fetch(`${backendUrl}/ocr/parse-resume`, {
                    method: 'POST',
                    headers: {
                        'x-api-key': process.env.API_SECRET_KEY || '',
                    },
                    body: backendFormData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Backend returned ${response.status}`);
                }

                const result = await response.json();
                extractedText = result.text || '';
                s3Key = result.s3Key || null;

                if (!extractedText || extractedText.length < 50) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'pdf_no_extractable_text',
                            can_ocr: true,
                            message: 'This file appears to be scanned. Please use OCR.',
                            filename: file.name,
                            fileBuffer: buffer.toString('base64')
                        },
                        { status: 400, headers: corsHeaders }
                    );
                }
            }
            // TXT Handling (local - no issues)
            else if (fileName.endsWith('.txt') || file.type === 'text/plain') {
                extractedText = new TextDecoder().decode(buffer);
            }
            // Legacy DOC
            else if (fileName.endsWith('.doc')) {
                return NextResponse.json(
                    { success: false, error: 'Old .doc format not supported. Save as .docx or PDF.' },
                    { status: 400, headers: corsHeaders }
                );
            }
            // Unsupported
            else {
                return NextResponse.json(
                    { success: false, error: 'Unsupported file type.' },
                    { status: 400, headers: corsHeaders }
                );
            }

            extractedText = normalizeResumeText(extractedText);

            if (!extractedText || extractedText.length < 50) {
                return NextResponse.json(
                    { success: false, error: 'Could not extract text. File might be empty.' },
                    { status: 400, headers: corsHeaders }
                );
            }

            const prepared = prepareResumeText(extractedText);

            return NextResponse.json(
                {
                    success: true,
                    text: prepared.text,
                    filename: file.name,
                    length: prepared.text.length,
                    originalLength: prepared.originalLength,
                    truncated: prepared.truncated,
                    s3Key: s3Key
                },
                { status: 200, headers: corsHeaders }
            );

        } catch (processError: any) {
            console.error('Processing error:', processError);
            return NextResponse.json(
                { success: false, error: `Failed to process file: ${processError.message}` },
                { status: 500, headers: corsHeaders }
            );
        }

    } catch (error: any) {
        console.error('Upload handler error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
