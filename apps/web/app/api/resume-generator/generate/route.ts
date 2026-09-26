
import { NextRequest, NextResponse } from 'next/server';
import { generateResumeWithDeadline, ResumeGenerationTimeout, RESUME_AI_TIMEOUT_MS } from '@/lib/resume/generate-with-deadline';
import { runWithAiRequestContext, getAiRequestCostSummary } from '@/lib/ai/ai-request-context';
import { loadTemplateSource, normalizeAccentHex } from '@/lib/documents/template-source';
import { buildGeneratePrompt } from '@/lib/ai/prompts/generate';
import { checkAtsCompliance } from '@/lib/validators/ats-checker';
import { captureResumeAiCostRecorded } from '@/lib/posthog/ai-cost-analytics';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
    commitResumeGeneration,
    releaseResumeGenerationReservation,
    reserveResumeGeneration,
} from '@/lib/usage-limit';
import { getUserId } from '@/lib/auth/get-user-id';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { hasUpstashRedisConfig } from '@/lib/upstash-redis';
import { isUsableResumeLatex } from '@/lib/resume/latex-to-plain-text';
import {
    mergeModelLatexWithTemplate,
    stripModelLatexOutput,
    validateGeneratedResumeOutput,
} from '@/lib/resume/model-latex-output';

export const maxDuration = 120;
import {
    JOB_DESCRIPTION_MAX_CHARS,
    prepareResumeText,
    RESUME_TEXT_MAX_CHARS,
} from '@/lib/resume/resume-text-limits';

// Rate limiter: 10 requests per minute per authenticated user using Upstash.
// Using the user ID avoids one campus, office, or mobile carrier blocking other
// signed-in students who happen to share its public IP address.
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
    /** Rewrite employment titles as a career ladder toward the JD role. Default off. */
    alignJobTitles: z.boolean().optional().default(false),
});

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

export async function POST(req: NextRequest) {
    return runWithAiRequestContext(() => handleGeneratePost(req));
}

async function handleGeneratePost(req: NextRequest) {
    const startedAt = Date.now();
    const corsHeaders = corsHeadersWebAndExtension(req);
    let reservationId: string | null = null;
    let reservationUserId: string | null = null;
    let reservationCommitted = false;
    let creditReleased = false;
    try {
        // 0. Auth Check — accepts the web cookie session OR the extension's
        // Bearer token (getUserId handles both).
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        reservationUserId = userId;

        // 1. Rate Limiting
        if (ratelimit) {
            const { success } = await ratelimit.limit(`resume-generate:${userId}`);
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
            alignJobTitles,
        } = validation.data;
        const accentHex = normalizeAccentHex(validation.data.accentHex);

        // 3. Load Template
        const template = loadTemplateSource(templateId, accentHex);
        if (!template) {
            console.error(`Template not found for id "${templateId}" (and fallback missing).`);
            return NextResponse.json({ error: 'Template not found' }, { status: 404, headers: corsHeaders });
        }

        // 4. Build Prompt (inputs first, rules after — Gemini weights the tail)
        const prompt = buildGeneratePrompt(
            resumeText,
            jobDescription,
            template.tex,
            { focusKeywords, alignJobTitles },
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

        const response = await generateResumeWithDeadline({
            task: 'resume_generate',
            contents: prompt,
            userId,
        }, RESUME_AI_TIMEOUT_MS - (Date.now() - startedAt));

        let latex = stripModelLatexOutput(response.text || '');
        if (!isUsableResumeLatex(latex)) {
            throw new Error('Model returned unusable resume latex');
        }
        latex = mergeModelLatexWithTemplate(template.tex, latex);

        const structureCheck = validateGeneratedResumeOutput({
            latex,
            templateTex: template.tex,
            resumeText,
        });
        if (!structureCheck.ok) {
            throw new Error(`Generated resume failed validation: ${structureCheck.issues.join('; ')}`);
        }

        // Return validated source now. The dedicated compile endpoint handles PDF work
        // and the editor handles syntax repair without delaying this response.

        // ATS Validation
        const atsCheck = checkAtsCompliance(latex);

        if (!(await commitResumeGeneration(userId, reservationId))) {
            throw new Error('Failed to commit resume generation entitlement');
        }
        reservationCommitted = true;

        const costSummary = getAiRequestCostSummary();
        if (costSummary) {
            void captureResumeAiCostRecorded(userId, {
                ai_request_id: costSummary.requestId,
                ai_cost_usd: costSummary.totalCostUsd,
                ai_cost_generate_usd: costSummary.byTask.resume_generate ?? 0,
                ai_cost_latex_fix_usd: costSummary.byTask.latex_fix ?? 0,
                ai_call_count: costSummary.callCount,
                ai_model: costSummary.primaryModel,
                ai_fallback_used: costSummary.fallbackUsed,
                template_id: templateId,
                source: 'generate',
            });
        }

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

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown generation error';
        console.error('Generation Error:', message);
        if (reservationId && reservationUserId && !reservationCommitted) {
            creditReleased = await releaseResumeGenerationReservation(reservationUserId, reservationId);
        }
        return NextResponse.json(
            {
                success: false,
                error: error instanceof ResumeGenerationTimeout ? error.message : 'Failed to generate resume',
                ...(error instanceof ResumeGenerationTimeout ? { code: 'resume_generation_timeout' } : {}),
                details: message,
                creditRefunded: creditReleased,
            },
            { status: error instanceof ResumeGenerationTimeout ? 504 : 500, headers: corsHeaders }
        );
    } finally {
        if (reservationId && reservationUserId && !reservationCommitted && !creditReleased) {
            creditReleased = await releaseResumeGenerationReservation(
                reservationUserId,
                reservationId,
            );
        }
    }
}
