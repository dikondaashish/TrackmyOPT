
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { buildRegeneratePrompt } from '@/lib/prompts/regenerate';
import { checkAtsCompliance } from '@/lib/validators/ats-checker';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { resumeText, jobDescription, templateId, previousLatex, userFeedback } = await req.json();

        if (!resumeText || !jobDescription || !templateId || !previousLatex) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 1. Load Template
        const templatePath = path.join(process.cwd(), 'apps/web/templates/latex', `${templateId}.tex`);
        let templateTex = '';

        if (fs.existsSync(templatePath)) {
            templateTex = fs.readFileSync(templatePath, 'utf-8');
        } else {
            const fallbackPath = path.join(process.cwd(), 'apps/web/templates/latex', 'modern.tex');
            if (fs.existsSync(fallbackPath)) {
                templateTex = fs.readFileSync(fallbackPath, 'utf-8');
            } else {
                return NextResponse.json({ error: 'Template not found' }, { status: 404 });
            }
        }

        // 2. Build Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = buildRegeneratePrompt(
            resumeText,
            jobDescription,
            templateTex,
            previousLatex,
            userFeedback
        );

        // 3. Generate
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let latex = response.text();

        // 4. Clean Output
        latex = latex.replace(/```latex/g, '').replace(/```/g, '').trim();

        // 5. ATS Validation
        const atsCheck = checkAtsCompliance(latex);

        return NextResponse.json({
            latex,
            atsCheck
        });

    } catch (error: any) {
        console.error('Regeneration Error:', error);
        return NextResponse.json(
            { error: 'Failed to regenerate resume' },
            { status: 500 }
        );
    }
}
