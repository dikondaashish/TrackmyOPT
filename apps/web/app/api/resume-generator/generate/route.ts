
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
        // Try multiple paths to resolve template file (Vercel Lambda vs Local Monorepo)
        const possiblePaths = [
            path.join(process.cwd(), 'templates/latex', `${templateId}.tex`),
            path.join(process.cwd(), 'apps/web/templates/latex', `${templateId}.tex`),
        ];

        let templateTex = '';
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                templateTex = fs.readFileSync(p, 'utf-8');
                break;
            }
        }

        if (!templateTex) {
            // Fallback to modern.tex
            const fallbackPaths = [
                path.join(process.cwd(), 'templates/latex', 'modern.tex'),
                path.join(process.cwd(), 'apps/web/templates/latex', 'modern.tex'),
            ];

            for (const p of fallbackPaths) {
                if (fs.existsSync(p)) {
                    templateTex = fs.readFileSync(p, 'utf-8');
                    break;
                }
            }

            if (!templateTex) {
                console.error(`Template not found. Checked paths: ${possiblePaths.join(', ')}`);
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
