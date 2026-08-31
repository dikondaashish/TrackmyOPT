
import { NextRequest, NextResponse } from 'next/server';
import { generateAiContent } from '@/lib/ai/google-ai';
import { loadTemplateSource, normalizeAccentHex } from '@/lib/documents/template-source';
import { buildRegeneratePrompt } from '@/lib/ai/prompts/regenerate';
import { checkAtsCompliance } from '@/lib/validators/ats-checker';
import { REGENERATION_FEEDBACK_MAX_CHARS } from '@/lib/resume/ats-analysis-types';
import { z } from 'zod';
import rateLimit from '@/lib/auth/rate-limit';
import {
    releaseResumeGenerationReservation,
    reserveResumeGeneration,
} from '@/lib/usage-limit';
import { getUserId } from '@/lib/auth/get-user-id';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import {
    JOB_DESCRIPTION_MAX_CHARS,
    prepareResumeText,
    RESUME_TEXT_MAX_CHARS,
} from '@/lib/resume/resume-text-limits';

// Rate limiter: 10 requests per minute per authenticated user. Do not make
// students on the same campus or carrier share a generation bucket.
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
    userFeedback: z.string().optional().refine(val => !val || val.length <= REGENERATION_FEEDBACK_MAX_CHARS, {
        message: `Feedback too long (max ${REGENERATION_FEEDBACK_MAX_CHARS} chars)`
    }),
    atsAnalysis: z.any().optional(),
});

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

export async function POST(req: NextRequest) {
    let reservationId: string | null = null;
    let reservationUserId: string | null = null;
    let reservationCommitted = false;
    const corsHeaders = corsHeadersWebAndExtension(req);
    try {
        // Accept the dashboard cookie session or the extension's bearer token.
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        reservationUserId = userId;

        // 1. Rate Limiting
        const { isRateLimited, unavailable } = await limiter.check(
            req,
            10,
            `resume-regenerate:${userId}`,
        );

        if (isRateLimited) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: unavailable ? 503 : 429, headers: corsHeaders }
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
                { status: 400, headers: corsHeaders }
            );
        }

        const { jobDescription, templateId, previousLatex, userFeedback, atsAnalysis } = validation.data;

        // 3. Load Template
        const template = loadTemplateSource(templateId, normalizeAccentHex(body.accentHex));
        if (!template) {
            console.error(`Template not found for id "${templateId}" (and fallback missing).`);
            return NextResponse.json({ error: 'Template not found' }, { status: 404, headers: corsHeaders });
        }

        // 4. Build Prompt
        const prompt = buildRegeneratePrompt(
            jobDescription,
            template.tex,
            previousLatex,
            userFeedback,
            atsAnalysis
        );

        const entitlement = await reserveResumeGeneration(userId, 'regenerate');
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
                { status: 403, headers: corsHeaders }
            );
        }
        reservationId = entitlement.reservationId;

        // 5. Generate
        const response = await generateAiContent({
            task: 'resume_regenerate',
            contents: prompt,
            userId,
        });
        let latex = response.text || '';

        // 6. Clean Output
        latex = latex.replace(/^```(?:latex)?\n?/, '').replace(/\n?```$/, '').trim();

        // 7. ATS Validation
        const atsCheck = checkAtsCompliance(latex);

        reservationCommitted = true;

        return NextResponse.json(
            {
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
            },
            { headers: corsHeaders }
        );

    } catch (error: any) {
        console.error('Regeneration Error:', error);
        return NextResponse.json(
            { error: 'Failed to regenerate resume' },
            { status: 500, headers: corsHeaders }
        );
    } finally {
        if (reservationId && reservationUserId && !reservationCommitted) {
            await releaseResumeGenerationReservation(reservationUserId, reservationId);
        }
    }
}
