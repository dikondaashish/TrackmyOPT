import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument, normalizeText } from '@/lib/gemini-ai';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export const maxDuration = 60; // Allow 60s for AI processing

/**
 * POST /api/resume-generator/upload
 * Upload and parse resume files using Gemini AI
 * Supporting: PDF, DOCX, Images, TXT
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

        const fileName = file.name.toLowerCase();

        // Read file content
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use Gemini for everything except plain text
        let extractedText = '';

        if (fileName.endsWith('.txt') || file.type === 'text/plain') {
            extractedText = new TextDecoder().decode(buffer);
        } else {
            // Use Gemini AI for PDF, DOCX, Images
            try {
                console.log(`🚀 Analyzing ${fileName} with Gemini AI...`);
                // Force PDF mime type for analysis if it's a doc to ensure proper handling
                // or just pass original type. Gemini handles most.
                const analysis = await analyzeDocument(buffer, file.type, file.name);

                if (analysis.extractedText && analysis.extractedText.length > 50) {
                    extractedText = normalizeText(analysis.extractedText);
                } else {
                    throw new Error('AI could not extract text from this document');
                }
            } catch (aiError: any) {
                console.error('❌ Gemini Analysis failed:', aiError);
                return NextResponse.json(
                    { success: false, error: 'Failed to analyze document with AI. Please try a different file.' },
                    { status: 500, headers: corsHeaders }
                );
            }
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
