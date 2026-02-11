
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';
import { buildGeneratePrompt } from '@/lib/prompts/generate';
import { checkAtsCompliance } from '@/lib/validators/ats-checker';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// Initialize Gemini globally
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resumeText, jobDescription, templateId } = body;

        if (!resumeText || !jobDescription || !templateId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400, headers: corsHeaders }
            );
        }

        // 1. Load Template
        const templatePath = path.join(process.cwd(), 'apps/web/templates/latex', `${templateId}.tex`);

        let templateTex = '';
        if (fs.existsSync(templatePath)) {
            templateTex = fs.readFileSync(templatePath, 'utf-8');
        } else {
            // Fallback
            const fallbackPath = path.join(process.cwd(), 'apps/web/templates/latex', 'modern.tex');
            if (fs.existsSync(fallbackPath)) {
                templateTex = fs.readFileSync(fallbackPath, 'utf-8');
            } else {
                return NextResponse.json(
                    { error: 'Template file not found' },
                    { status: 404 }
                );
            }
        }

        // 2. Build Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = buildGeneratePrompt(resumeText, jobDescription, templateTex);

        // Generate Content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let latex = response.text();

        // Clean Output
        latex = latex.replace(/^```(?:latex)?\n?/, '').replace(/\n?```$/, '').trim();

        // Verify basic structure
        if (!latex.includes('\\documentclass') || !latex.includes('\\end{document}')) {
            console.warn("Generated LaTeX might be incomplete or malformed.");
        }

        // ATS Validation
        const atsCheck = checkAtsCompliance(latex);

        return NextResponse.json(
            { success: true, latex, atsCheck },
            { status: 200, headers: corsHeaders }
        );

    } catch (error: any) {
        console.error('Generation Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate resume' },
            { status: 500, headers: corsHeaders }
        );
    }
}
