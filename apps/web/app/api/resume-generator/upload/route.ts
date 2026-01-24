import { NextRequest, NextResponse } from 'next/server';
import { extractPdfText } from '@/lib/pdf-parser';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export const runtime = 'nodejs'; // Required for pdfjs-dist and fs

/**
 * POST /api/resume-generator/upload
 * Upload and parse resume files (PDF, DOC, DOCX, TXT)
 * Logic ported from ATS Scanner for maximum reliability
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
            // ==========================================
            // 1. PDF Handling (Robust Multi-Stage)
            // ==========================================
            if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {

                // Stage 1: Try PDF.js (Best for complex layouts)
                try {
                    const pdfResult = await extractPdfText(buffer);
                    extractedText = pdfResult.text;

                    // Check if scanned (image-only)
                    if (pdfResult.isLikelyScanned || extractedText.length < 50) {
                        console.log('⚠️ PDF appears to be scanned or empty');
                        extractedText = ''; // Trigger fallback
                    }
                } catch (pdfJsError) {
                    console.warn('⚠️ PDF.js failed, trying fallback:', pdfJsError);
                }

                // Stage 2: Fallback to pdf-parse (Simpler, sometimes works when PDF.js fails)
                if (!extractedText || extractedText.length < 50) {
                    try {
                        const pdfParseModule = await import('pdf-parse');
                        const pdfParse = pdfParseModule.default || pdfParseModule;
                        const data = await pdfParse(buffer);
                        const parseText = data.text ? data.text.trim() : '';

                        // Check confidence
                        if (parseText.length > 50) {
                            extractedText = parseText;
                            console.log('✅ Fallback pdf-parse succeeded');
                        }
                    } catch (parseErr) {
                        console.warn('⚠️ pdf-parse fallback failed');
                    }
                }

                // Stage 3: Fail gracefully with OCR Hint
                // If we still don't have text, it's likely a scan
                if (!extractedText || extractedText.length < 50) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'pdf_no_extractable_text',
                            can_ocr: true, // Frontend shows OCR button
                            message: 'This PDF appears to be an image. Please use OCR.',
                            filename: file.name,
                            fileBuffer: buffer.toString('base64')
                        },
                        { status: 400, headers: corsHeaders }
                    );
                }

            }
            // ==========================================
            // 2. DOCX Handling (Mammoth)
            // ==========================================
            else if (fileName.endsWith('.docx') || file.type.includes('wordprocessingml')) {
                const mammoth = await import('mammoth');
                const result = await mammoth.extractRawText({ buffer });
                extractedText = result.value;
            }
            // ==========================================
            // 3. Text / Legacy DOC
            // ==========================================
            else if (fileName.endsWith('.txt') || file.type === 'text/plain') {
                extractedText = new TextDecoder().decode(buffer);
            } else if (fileName.endsWith('.doc')) {
                return NextResponse.json(
                    { success: false, error: 'Old .doc format not supported. Save as .docx or PDF.' },
                    { status: 400, headers: corsHeaders }
                );
            } else {
                return NextResponse.json(
                    { success: false, error: 'Unsupported file type.' },
                    { status: 400, headers: corsHeaders }
                );
            }

            // Cleanup & Final Validation
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
