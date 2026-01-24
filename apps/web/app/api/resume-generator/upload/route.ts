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
        constAC_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File too large. Maximum size is 10MB.' },
                { status: 413, headers: corsHeaders }
            );
        }

        const fileName = file.name.toLowerCase();

        // Read file content
        const buffer = await file.arrayBuffer();
        let extractedText = '';

        try {
            // Handle different file types
            if (fileName.endsWith('.txt') || file.type === 'text/plain') {
                // Plain text file
                extractedText = new TextDecoder().decode(buffer);
            } else if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
                // PDF file - use pdf-parse
                const pdfParseModule = await import('pdf-parse');
                const pdfParse = pdfParseModule.default || pdfParseModule;

                // pdf-parse expects a buffer, not array buffer
                const nodeBuffer = Buffer.from(buffer);
                const pdfData = await pdfParse(nodeBuffer);
                extractedText = pdfData.text;

                // Check if PDF is likely scanned (image-based)
                if (!extractedText || extractedText.trim().length < 50) {
                    const fileBufferBase64 = nodeBuffer.toString('base64');
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'pdf_no_extractable_text',
                            can_ocr: process.env.OCR_TEXTRACT_ENABLED === 'true',
                            message: 'This PDF appears to be scanned. We can try OCR to read it.',
                            filename: file.name,
                            fileBuffer: fileBufferBase64 // Return for potential OCR retry
                        },
                        { status: 400, headers: corsHeaders }
                    );
                }
            } else if (fileName.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                // DOCX file - use mammoth
                const mammoth = await import('mammoth');
                const nodeBuffer = Buffer.from(buffer);
                const result = await mammoth.extractRawText({ buffer: nodeBuffer });
                extractedText = result.value;
            } else if (fileName.endsWith('.doc') || file.type === 'application/msword') {
                return NextResponse.json(
                    { success: false, error: 'Old .doc format is not supported. Please save as .docx or .pdf.' },
                    { status: 400, headers: corsHeaders }
                );
            } else {
                return NextResponse.json(
                    { success: false, error: 'Unsupported file type. Please upload PDF, DOCX, or TXT.' },
                    { status: 400, headers: corsHeaders }
                );
            }

            // Clean up extracted text
            extractedText = extractedText
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                // Remove null bytes
                .replace(/\0/g, '')
                .trim();

            if (!extractedText || extractedText.length < 50) {
                return NextResponse.json(
                    { success: false, error: 'Could not extract text. The file might be empty or an image.' },
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

        } catch (parseError: any) {
            console.error('File parsing error:', parseError);
            return NextResponse.json(
                { success: false, error: `Failed to parse file: ${parseError.message}` },
                { status: 500, headers: corsHeaders }
            );
        }

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error during upload.' },
            { status: 500, headers: corsHeaders }
        );
    }
}
