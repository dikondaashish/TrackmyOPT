
import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { loadTemplateSource, normalizeAccentHex } from '@/lib/documents/template-source';
import { buildRegeneratePrompt } from '@/lib/ai/prompts/regenerate';
import { checkAtsCompliance } from '@/lib/validators/ats-checker';
import { z } from 'zod';
import rateLimit from '@/lib/auth/rate-limit';
import { checkResumeLimit, trackResumeGeneration } from '@/lib/usage-limit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
    JOB_DESCRIPTION_MAX_CHARS,
    prepareResumeText,
    RESUME_TEXT_MAX_CHARS,
} from '@/lib/resume/resume-text-limits';

// Rate Limiter: 10 requests per minute per IP
const limiter = rateLimit({
    interval: 60 * 1000,
    name: 'resume-regenerate',
});

// Input Validation Schema
const RegenerateSchema = z.object({
    resumeText: z.string().min(1).max(RESUME_TEXT_MAX_CHARS, "Resume text too long"),
    jobDescription: z.string().min(1).max(JOB_DESCRIPTION_MAX_CHARS, "Job description too long"),
    templateId: z.string().min(1).max(50),
    previousLatex: z.string().min(1).max(50000, "Previous LaTeX too long"),
    userFeedback: z.string().optional().refine(val => !val || val.length <= 1000, {
        message: "Feedback too long (max 1000 chars)"
    }),
    atsAnalysis: z.any().optional(),
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: NextRequest) {
    try {
        // 0. Auth Check
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Check Usage Limits
        const { allowed, limit, usage } = await checkResumeLimit(user.id);
        if (!allowed) {
            return NextResponse.json(
                {
                    error: 'Usage limit reached',
                    details: `You have used ${usage}/${limit} generations this month. Please upgrade your plan.`
                },
                { status: 403 }
            );
        }

        // 2. Rate Limiting
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const { isRateLimited, unavailable } = await limiter.check(req, 10, ip);

        if (isRateLimited) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: unavailable ? 503 : 429 }
            );
        }

        const body = await req.json();

        const resumePrep = prepareResumeText(String(body.resumeText ?? ""));
        const jobPrep = prepareResumeText(
            String(body.jobDescription ?? ""),
            JOB_DESCRIPTION_MAX_CHARS
        );

        // 3. Input Validation
        const validation = RegenerateSchema.safeParse({
            ...body,
            resumeText: resumePrep.text,
            jobDescription: jobPrep.text,
        });
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { jobDescription, templateId, previousLatex, userFeedback, atsAnalysis } = validation.data;

        // 4. Load Template
        const template = loadTemplateSource(templateId, normalizeAccentHex(body.accentHex));
        if (!template) {
            console.error(`Template not found for id "${templateId}" (and fallback missing).`);
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // 5. Build Prompt
        const prompt = buildRegeneratePrompt(
            jobDescription,
            template.tex,
            previousLatex,
            userFeedback,
            atsAnalysis
        );

        // 6. Generate
        let response;
        try {
            response = await ai.models.generateContent({
                model: 'gemini-3.1-pro-preview',
                contents: prompt,
            });
        } catch (err) {
            console.warn('[regenerate] Primary model failed, falling back to gemini-2.5-pro:', err);
            response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
        }
        let latex = response.text || '';

        // 7. Clean Output
        latex = latex.replace(/^```(?:latex)?\n?/, '').replace(/\n?```$/, '').trim();

        // 8. ATS Validation
        const atsCheck = checkAtsCompliance(latex);

        // 9. Track Usage
        await trackResumeGeneration(user.id, 'regenerate');

        return NextResponse.json({
            latex,
            atsCheck,
            ...(resumePrep.truncated || jobPrep.truncated
                ? {
                      warnings: [
                          resumePrep.truncated
                              ? `Resume trimmed from ${resumePrep.originalLength.toLocaleString()} to ${resumePrep.text.length.toLocaleString()} characters.`
                              : null,
                          jobPrep.truncated
                              ? `Job description trimmed from ${jobPrep.originalLength.toLocaleString()} to ${jobPrep.text.length.toLocaleString()} characters.`
                              : null,
                      ].filter(Boolean),
                  }
                : {}),
        });

    } catch (error: any) {
        console.error('Regeneration Error:', error);
        return NextResponse.json(
            { error: 'Failed to regenerate resume' },
            { status: 500 }
        );
    }
}
