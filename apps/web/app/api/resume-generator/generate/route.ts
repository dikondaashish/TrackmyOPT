
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { buildGeneratePrompt } from '@/lib/prompts/generate';
import { checkAtsCompliance } from '@/lib/validators/ats-checker';
import { z } from 'zod';
import rateLimit from '@/lib/rate-limit';
import { checkResumeLimit, trackResumeGeneration } from '@/lib/usage-limit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Rate Limiter: 10 requests per minute per IP
const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

// Input Validation Schema
const GenerateSchema = z.object({
    resumeText: z.string().min(1).max(25000, "Resume text too long (max 25k chars)"),
    jobDescription: z.string().min(1).max(15000, "Job description too long (max 15k chars)"),
    templateId: z.string().min(1).max(50),
});

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
        // 0. Auth Check
        const cookieStore = cookies();
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
        const { isRateLimited } = limiter.check(req, 10, ip);

        if (isRateLimited) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: corsHeaders }
            );
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
        // Using gemini-2.5-pro as requested by user (Brain)
        const primaryModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = buildGeneratePrompt(resumeText, jobDescription, templateTex);

        let streamResult;

        try {
            streamResult = await primaryModel.generateContentStream(prompt);
        } catch (error) {
            console.warn("Gemini 2.5 Pro failed to start stream, falling back to Flash", error);
            streamResult = await fallbackModel.generateContentStream(prompt);
        }

        // 6. Track Usage (Track before streaming starts)
        await trackResumeGeneration(user.id, 'generate');

        // 7. Create ReadableStream
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of streamResult.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            controller.enqueue(encoder.encode(chunkText));
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new NextResponse(stream, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        console.error('Generation Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate resume' },
            { status: 500, headers: corsHeaders }
        );
    }
}
