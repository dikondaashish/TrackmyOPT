
import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { buildGeneratePrompt } from '@/lib/ai/prompts/generate';
import { checkAtsCompliance } from '@/lib/validators/ats-checker';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { checkResumeLimit, trackResumeGeneration } from '@/lib/usage-limit';
import { getUserId } from '@/lib/auth/getUserId';
import { corsHeadersConfiguredWebApp } from '@/lib/api/cors-policy';
import {
    JOB_DESCRIPTION_MAX_CHARS,
    prepareResumeText,
    RESUME_TEXT_MAX_CHARS,
} from '@/lib/resume/resume-text-limits';

// Rate Limiter: 10 requests per minute per IP using Upstash
const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN 
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
    }) 
  : null;

// Input Validation Schema
const GenerateSchema = z.object({
    resumeText: z.string().trim().min(1).max(RESUME_TEXT_MAX_CHARS, "Resume text too long (max 25k chars)"),
    jobDescription: z.string().trim().min(1).max(JOB_DESCRIPTION_MAX_CHARS, "Job description too long (max 15k chars)"),
    templateId: z.string().trim().min(1).max(50),
    focusKeywords: z.array(z.string().trim().min(1).max(80)).max(12).optional().default([]),
});

const corsHeaders = corsHeadersConfiguredWebApp();

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: NextRequest) {
    try {
        // 0. Auth Check — accepts the web cookie session OR the extension's
        // Bearer token (getUserId handles both).
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        // 1. Check Usage Limits
        const { allowed, limit, usage } = await checkResumeLimit(userId);
        if (!allowed) {
            return NextResponse.json(
                {
                    error: 'Usage limit reached',
                    details: `You have used ${usage}/${limit} generations this month. Please upgrade your plan.`
                },
                { status: 403, headers: corsHeaders }
            );
        }

        // 2. Rate Limiting
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        if (ratelimit) {
            const { success } = await ratelimit.limit(ip);
            if (!success) {
                return NextResponse.json(
                    { error: 'Too many requests. Please try again later.' },
                    { status: 429, headers: corsHeaders }
                );
            }
        }

        const body = await req.json();

        const resumePrep = prepareResumeText(String(body.resumeText ?? ""));
        const jobPrep = prepareResumeText(
            String(body.jobDescription ?? ""),
            JOB_DESCRIPTION_MAX_CHARS
        );

        // 3. Input Validation
        const validation = GenerateSchema.safeParse({
            ...body,
            resumeText: resumePrep.text,
            jobDescription: jobPrep.text,
        });
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.format() },
                { status: 400, headers: corsHeaders }
            );
        }

        const { resumeText, jobDescription, templateId, focusKeywords } = validation.data;

        // 4. Load Template
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

        // 5. Build Prompt
        const prompt = buildGeneratePrompt(resumeText, jobDescription, templateTex, focusKeywords);

        let response;
        try {
            response = await ai.models.generateContent({
                model: 'gemini-3.1-pro-preview',
                contents: prompt,
            });
        } catch (err) {
            console.warn('[generate] Primary model failed, falling back to gemini-2.5-pro:', err);
            response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
        }

        let latex = response.text || '';

        // Clean Output
        latex = latex.replace(/^```(?:latex)?\n?/, '').replace(/\n?```$/, '').trim();

        // ATS Validation
        const atsCheck = checkAtsCompliance(latex);

        // 6. Track Usage
        await trackResumeGeneration(userId, 'generate');

        return NextResponse.json(
            {
                success: true,
                latex,
                atsCheck,
                ...(resumePrep.truncated || jobPrep.truncated
                    ? {
                          warnings: [
                              resumePrep.truncated
                                  ? `Resume trimmed from ${resumePrep.originalLength.toLocaleString()} to ${resumePrep.text.length.toLocaleString()} characters for AI processing.`
                                  : null,
                              jobPrep.truncated
                                  ? `Job description trimmed from ${jobPrep.originalLength.toLocaleString()} to ${jobPrep.text.length.toLocaleString()} characters.`
                                  : null,
                          ].filter(Boolean),
                      }
                    : {}),
            },
            { status: 200, headers: corsHeaders }
        );

    } catch (error: any) {
        console.error('Generation Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate resume' },
            { status: 500, headers: corsHeaders }
        );
    }
}
