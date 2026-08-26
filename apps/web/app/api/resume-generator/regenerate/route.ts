
import { NextRequest, NextResponse } from 'next/server';
import { generateAiContent } from '@/lib/ai/google-ai';
import { loadTemplateSource, normalizeAccentHex } from '@/lib/documents/template-source';
import { buildRegeneratePrompt } from '@/lib/ai/prompts/regenerate';
import { checkAtsCompliance } from '@/lib/validators/ats-checker';
import { z } from 'zod';
import rateLimit from '@/lib/auth/rate-limit';
import {
    releaseResumeGenerationReservation,
    reserveResumeGeneration,
} from '@/lib/usage-limit';
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

export async function POST(req: NextRequest) {
    let reservationId: string | null = null;
    let reservationUserId: string | null = null;
    let reservationCommitted = false;
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

        reservationUserId = user.id;

        // 1. Rate Limiting
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

        // 2. Input Validation
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

        // 3. Load Template
        const template = loadTemplateSource(templateId, normalizeAccentHex(body.accentHex));
        if (!template) {
            console.error(`Template not found for id "${templateId}" (and fallback missing).`);
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // 4. Build Prompt
        const prompt = buildRegeneratePrompt(
            jobDescription,
            template.tex,
            previousLatex,
            userFeedback,
            atsAnalysis
        );

        const entitlement = await reserveResumeGeneration(user.id, 'regenerate');
        if (!entitlement.allowed || !entitlement.reservationId) {
            return NextResponse.json(
                {
                    error: 'Usage limit reached',
                    code: entitlement.denialReason,
                    details:
                        entitlement.denialReason === 'credits_required'
                            ? `You used ${entitlement.usage}/${entitlement.limit} included generations. Buy resume credits to continue.`
                            : `You used ${entitlement.usage}/${entitlement.limit} included generations. Upgrade to Pro to continue.`,
                    usage: entitlement.usage,
                    limit: entitlement.limit,
                    creditBalance: entitlement.creditBalance,
                    canBuyCredits: entitlement.canBuyCredits,
                },
                { status: 403 }
            );
        }
        reservationId = entitlement.reservationId;

        // 5. Generate
        const response = await generateAiContent({
            task: 'resume_regenerate',
            contents: prompt,
            userId: user.id,
        });
        let latex = response.text || '';

        // 6. Clean Output
        latex = latex.replace(/^```(?:latex)?\n?/, '').replace(/\n?```$/, '').trim();

        // 7. ATS Validation
        const atsCheck = checkAtsCompliance(latex);

        reservationCommitted = true;

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
    } finally {
        if (reservationId && reservationUserId && !reservationCommitted) {
            await releaseResumeGenerationReservation(reservationUserId, reservationId);
        }
    }
}
