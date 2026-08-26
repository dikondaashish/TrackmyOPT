
import { NextRequest, NextResponse } from 'next/server';
import { generateAiContent } from '@/lib/ai/google-ai';
import { loadTemplateSource, normalizeAccentHex } from '@/lib/documents/template-source';
import { buildGeneratePrompt } from '@/lib/ai/prompts/generate';
import { checkAtsCompliance } from '@/lib/validators/ats-checker';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
    releaseResumeGenerationReservation,
    reserveResumeGeneration,
} from '@/lib/usage-limit';
import { getUserId } from '@/lib/auth/get-user-id';
import { corsHeadersConfiguredWebApp } from '@/lib/api/cors-policy';
import { hasUpstashRedisConfig } from '@/lib/upstash-redis';
import {
    JOB_DESCRIPTION_MAX_CHARS,
    prepareResumeText,
    RESUME_TEXT_MAX_CHARS,
} from '@/lib/resume/resume-text-limits';

// Rate Limiter: 10 requests per minute per IP using Upstash
const ratelimit = hasUpstashRedisConfig()
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
    /** Optional accent override chosen on the template selection page. */
    accentHex: z.string().trim().max(7).optional(),
    /**
     * Optional total years of professional experience. Passed to the model as
     * context only — page count is driven by the volume of the candidate's
     * actual content, never by a years threshold. Safe to omit.
     */
    yearsOfExperience: z.number().int().min(0).max(60).optional(),
});

const corsHeaders = corsHeadersConfiguredWebApp();

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    let reservationId: string | null = null;
    let reservationUserId: string | null = null;
    let reservationCommitted = false;
    try {
        // 0. Auth Check — accepts the web cookie session OR the extension's
        // Bearer token (getUserId handles both).
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        reservationUserId = userId;

        // 1. Rate Limiting
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

        // 2. Input Validation
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

        const {
            resumeText,
            jobDescription,
            templateId,
            focusKeywords,
            yearsOfExperience,
        } = validation.data;
        const accentHex = normalizeAccentHex(validation.data.accentHex);

        // 3. Load Template
        const template = loadTemplateSource(templateId, accentHex);
        if (!template) {
            console.error(`Template not found for id "${templateId}" (and fallback missing).`);
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // 4. Build Prompt
        const prompt = buildGeneratePrompt(
            resumeText,
            jobDescription,
            template.tex,
            focusKeywords,
            yearsOfExperience
        );

        // Reserve included allowance or a purchased credit atomically before
        // invoking the model. The finally block releases it if generation fails.
        const entitlement = await reserveResumeGeneration(userId, 'generate');
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

        const response = await generateAiContent({
            task: 'resume_generate',
            contents: prompt,
            userId,
        });

        let latex = response.text || '';

        // Clean Output
        latex = latex.replace(/^```(?:latex)?\n?/, '').replace(/\n?```$/, '').trim();

        // ATS Validation
        const atsCheck = checkAtsCompliance(latex);

        reservationCommitted = true;

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
    } finally {
        if (reservationId && reservationUserId && !reservationCommitted) {
            await releaseResumeGenerationReservation(reservationUserId, reservationId);
        }
    }
}
