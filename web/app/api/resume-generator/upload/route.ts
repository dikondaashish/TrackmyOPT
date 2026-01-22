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

/**
 * POST /api/resume-generator/upload
 * Upload and parse resume files (PDF, DOC, DOCX, TXT)
 * Returns extracted text content
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

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File too large. Maximum size is 10MB.' },
                { status: 413, headers: corsHeaders }
            );
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];

        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        // Check by extension if MIME type is not reliable
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!allowedTypes.includes(fileType) && !hasValidExtension) {
            return NextResponse.json(
                { success: false, error: 'Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Read file content
        const buffer = await file.arrayBuffer();
        let extractedText = '';

        // Handle different file types
        if (fileName.endsWith('.txt') || fileType === 'text/plain') {
            // Plain text file
            extractedText = new TextDecoder().decode(buffer);
        } else if (fileName.endsWith('.pdf') || fileType === 'application/pdf') {
            // PDF file - use pdfjs-dist for reliable serverless parsing
            try {
                const { extractPdfText } = await import('@/lib/pdf-parser');
                const pdfResult = await extractPdfText(Buffer.from(buffer));
                extractedText = pdfResult.text;

                if (pdfResult.isLikelyScanned || extractedText.trim().length < 50) {
                    // Return OCR option for scanned PDFs
                    const fileBuffer = Buffer.from(buffer).toString('base64');
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'pdf_no_extractable_text',
                            can_ocr: process.env.OCR_TEXTRACT_ENABLED === 'true',
                            message: 'This PDF appears to be scanned/image-based. You can run OCR to extract text.',
                            filename: file.name,
                            fileBuffer: fileBuffer // Base64 encoded for OCR
                        },
                        { status: 400, headers: corsHeaders }
                    );
                }
            } catch (pdfError: any) {
                console.error('PDF parsing error:', pdfError?.message || pdfError);
                return NextResponse.json(
                    { success: false, error: 'Failed to parse PDF. Please try a different file or paste text manually.' },
                    { status: 400, headers: corsHeaders }
                );
            }
        } else if (fileName.endsWith('.docx') || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // DOCX file - use mammoth
            try {
                const mammoth = await import('mammoth');
                const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
                extractedText = result.value;
            } catch (docxError) {
                console.error('DOCX parsing error:', docxError);
                return NextResponse.json(
                    { success: false, error: 'Failed to parse DOCX. Please try a different file or paste text manually.' },
                    { status: 400, headers: corsHeaders }
                );
            }
        } else if (fileName.endsWith('.doc') || fileType === 'application/msword') {
            // DOC file - limited support, suggest DOCX
            return NextResponse.json(
                { success: false, error: 'Old DOC format has limited support. Please convert to DOCX or PDF and try again.' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Clean up extracted text
        extractedText = extractedText
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        if (!extractedText || extractedText.length < 50) {
            return NextResponse.json(
                { success: false, error: 'No readable text found in file. Please paste your resume text manually.' },
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

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process file. Please try again or paste text manually.' },
            { status: 500, headers: corsHeaders }
        );
    }
}
