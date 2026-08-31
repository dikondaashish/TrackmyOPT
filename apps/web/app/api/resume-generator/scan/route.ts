import { NextRequest, NextResponse } from 'next/server';
import { buildAtsScanPrompt } from '@/lib/ai/prompts/ats-scan';
import { generateAiContent } from '@/lib/ai/google-ai';
import { checkAtsCompliance } from '@/lib/validators/ats-checker';
import { getUserId } from '@/lib/auth/get-user-id';
import { latexToPlainText } from '@/lib/resume/latex-to-plain-text';
import { computeKeywordPlacement } from '@/lib/resume/keyword-placement';
import { checkAtsScanLimit, trackAtsScan } from '@/lib/usage-limit';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { analyzeLatexBulletMetrics } from '@/lib/resume/bullet-metrics';
import { calculateAtsFinalScore } from '@/lib/resume/ats-score';
import { parseAtsScanAiResponse } from '@/lib/resume/ats-analysis-schema';
import {
    JOB_DESCRIPTION_MAX_CHARS,
    prepareResumeText,
    RESUME_TEXT_MAX_CHARS,
} from '@/lib/resume/resume-text-limits';

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

export async function POST(req: NextRequest) {
    const corsHeaders = corsHeadersWebAndExtension(req);
    const userId = await getUserId(req);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    try {
        const body: unknown = await req.json();
        if (typeof body !== 'object' || body === null) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400, headers: corsHeaders }
            );
        }
        const { resumeText, jobDescription, latexCode, generatedText } = body as Record<string, unknown>;

        if (typeof jobDescription !== 'string' || !jobDescription.trim()) {
            return NextResponse.json(
                { error: 'Missing job description' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Prefer extracted generated resume text for keyword matching (Phase 1.1)
        const rawScanResumeText =
            (typeof generatedText === 'string' && generatedText.trim()) ||
            (typeof latexCode === 'string' && latexCode.trim() ? latexToPlainText(latexCode) : '') ||
            (typeof resumeText === 'string' ? resumeText : '') ||
            '';
        const scanResumePrep = prepareResumeText(rawScanResumeText, RESUME_TEXT_MAX_CHARS);
        const jobDescriptionPrep = prepareResumeText(jobDescription, JOB_DESCRIPTION_MAX_CHARS);
        const safeLatexCode = typeof latexCode === 'string' ? latexCode : '';

        if (!scanResumePrep.text) {
            return NextResponse.json(
                { error: 'Missing resume text to scan' },
                { status: 400, headers: corsHeaders }
            );
        }

        const { allowed, limit, usage } = await checkAtsScanLimit(userId);
        if (!allowed) {
            return NextResponse.json(
                {
                    error: 'Monthly ATS scan limit reached',
                    code: 'ats_scan_limit_reached',
                    limit,
                    usage,
                },
                { status: 402, headers: corsHeaders }
            );
        }

        // 1. Static Analysis (Format Check)
        // We use the existing validator for "Basic" checks (tables, images, etc.)
        const basicCheck = checkAtsCompliance(safeLatexCode);

        // 2. AI Deep Analysis
        const prompt = buildAtsScanPrompt(scanResumePrep.text, jobDescriptionPrep.text);

        let response;
        try {
            response = await generateAiContent({
                task: 'ats_scan',
                contents: prompt,
                config: { responseMimeType: 'application/json' },
                userId,
            });
        } catch (error) {
            console.error('ATS provider request failed:', error);
            return NextResponse.json(
                {
                    error: 'We could not complete the ATS analysis. Your scan was not used. Please try again.',
                    code: 'ats_analysis_unavailable',
                    scanConsumed: false,
                },
                { status: 502, headers: corsHeaders }
            );
        }
        const text = response.text || '';

        // The model response is untrusted. A malformed or incomplete response
        // must never be presented as a real low ATS score or consume quota.
        const aiAnalysis = parseAtsScanAiResponse(text);
        if (!aiAnalysis) {
            console.error('ATS provider returned an invalid analysis payload');
            return NextResponse.json(
                {
                    error: 'We could not produce a trustworthy ATS analysis. Your scan was not used. Please try again.',
                    code: 'ats_analysis_unavailable',
                    scanConsumed: false,
                },
                { status: 502, headers: corsHeaders }
            );
        }

        // 3. Merge Results. Content quality is scored once by the AI rubric.
        // Only actual parse/structure problems receive the deterministic format
        // penalty; recommendations such as low metrics must not be counted twice.
        const scoreBreakdown = calculateAtsFinalScore({
            overallScore: aiAnalysis.overallScore,
            keywordScore: aiAnalysis.keywordMatch?.score,
            issues: basicCheck.issues,
        });
        const finalScore = scoreBreakdown.finalScore;
        const bulletMetrics = analyzeLatexBulletMetrics(safeLatexCode);

        const foundKeywords = aiAnalysis.keywordMatch?.found ?? [];
        const keywordPlacement = computeKeywordPlacement(scanResumePrep.text, foundKeywords);

        const finalAnalysis = {
            passed: basicCheck.passed && finalScore >= 75,
            issues: basicCheck.issues,
            keywordMatch: aiAnalysis.keywordMatch,
            sectionScores: aiAnalysis.sectionScores,
            bulletAnalysis: aiAnalysis.bulletAnalysis,
            improvements: aiAnalysis.improvements,
            missingKeywordsByCategory: aiAnalysis.missingKeywordsByCategory,
            keywordPlacement,
            score: finalScore,
            metricsRatio: bulletMetrics.ratio,
            metricsBullets: {
                total: bulletMetrics.total,
                quantified: bulletMetrics.withMetrics,
            },
            scoreBreakdown,
        };

        // Record usage last. This RPC locks by user and rechecks the limit, so
        // simultaneous completed scans cannot exceed the monthly allowance.
        const reservation = await trackAtsScan(userId, limit);
        if (!reservation.ok) {
            return NextResponse.json(
                {
                    error: 'ATS analysis is ready, but we could not safely record your scan. Your scan was not used. Please try again.',
                    code: 'ats_quota_unavailable',
                    scanConsumed: false,
                },
                { status: 503, headers: corsHeaders }
            );
        }
        if (!reservation.allowed) {
            return NextResponse.json(
                {
                    error: 'Your monthly ATS scan limit was reached while this analysis was running. Your scan was not used.',
                    code: 'ats_scan_limit_reached',
                    limit: reservation.limit ?? limit,
                    usage: reservation.usage ?? usage,
                    scanConsumed: false,
                },
                { status: 402, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            finalAnalysis,
            { status: 200, headers: corsHeaders }
        );

    } catch (error: unknown) {
        console.error('ATS Scan Error:', error);
        return NextResponse.json(
            {
                error: 'Unable to start an ATS scan. Please try again.',
                code: 'ats_scan_unavailable',
                scanConsumed: false,
            },
            { status: 500, headers: corsHeaders }
        );
    }
}
