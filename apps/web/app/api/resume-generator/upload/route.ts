import { NextRequest, NextResponse } from 'next/server';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export const runtime = 'nodejs';

/**
 * POST /api/resume-generator/upload
 * Upload and parse resume files (PDF, DOC, DOCX, TXT)
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400, headers: corsHeaders }
            );
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File too large. Maximum size is 10MB.' },
                { status: 413, headers: corsHeaders }
            );
        }

        const fileName = file.name.toLowerCase();
        const buffer = Buffer.from(await file.arrayBuffer());
        let extractedText = '';

        try {
            // PDF Handling
            if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
                // Use pdf-parse (proven to work)
                const pdfParse = require('pdf-parse');
                const data = await pdfParse(buffer);
                extractedText = (data.text || '').trim();

                // Check if scanned/empty
                if (!extractedText || extractedText.length < 50) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'pdf_no_extractable_text',
                            can_ocr: true,
                            message: 'This PDF appears to be scanned. Please use OCR.',
                            filename: file.name,
                            fileBuffer: buffer.toString('base64')
                        },
                        { status: 400, headers: corsHeaders }
                    );
                }
            }
            // DOCX Handling
            else if (fileName.endsWith('.docx') || file.type.includes('wordprocessingml')) {
                const mammoth = require('mammoth');
                const result = await mammoth.extractRawText({ buffer });
                extractedText = result.value;
            }
            // TXT Handling
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

            // Cleanup
            extractedText = extractedText
                .replace(/\r\n/g, '\n')
                .replace(/\0/g, '')
                .trim();

            if (!extractedText || extractedText.length < 50) {
                return NextResponse.json(
                    { success: false, error: 'Could not extract text. File might be empty.' },
                    { status: 400, headers: corsHeaders }
                );
            }

            return NextResponse.json(
                {
                    success: true,
                    text: extractedText,
                    filename: file.name,
                    length: extractedText.length
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

    } catch (error) {
        console.error('Upload handler error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
