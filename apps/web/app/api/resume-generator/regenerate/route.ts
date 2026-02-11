
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
