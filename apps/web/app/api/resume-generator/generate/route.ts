
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
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { corsHeadersConfiguredWebApp } from '@/lib/api/cors-policy';

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
    resumeText: z.string().min(1).max(25000, "Resume text too long (max 25k chars)"),
    jobDescription: z.string().min(1).max(15000, "Job description too long (max 15k chars)"),
    templateId: z.string().min(1).max(50),
});

const corsHeaders = corsHeadersConfiguredWebApp();

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

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
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        // 1. Check Usage Limits
        const { allowed, limit, usage, tier } = await checkResumeLimit(user.id);
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

        // 3. Input Validation
        const validation = GenerateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.format() },
                { status: 400, headers: corsHeaders }
            );
        }

        const { resumeText, jobDescription, templateId } = validation.data;

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
        const prompt = buildGeneratePrompt(resumeText, jobDescription, templateTex);

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
        await trackResumeGeneration(user.id, 'generate');

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
