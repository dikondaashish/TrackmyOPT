import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { buildAtsScanPrompt } from '@/lib/ai/prompts/ats-scan';
import { checkAtsCompliance } from '@/lib/validators/ats-checker';
import { getUserId } from '@/lib/auth/getUserId';
import { latexToPlainText } from '@/lib/resume/latex-to-plain-text';
import { computeKeywordPlacement } from '@/lib/resume/keyword-placement';
import { checkAtsScanLimit, trackAtsScan } from '@/lib/usage-limit';

const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trackmyopt.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: NextRequest) {
    const userId = await getUserId(req);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { resumeText, jobDescription, latexCode, generatedText } = body;

        if (!jobDescription) {
            return NextResponse.json(
                { error: 'Missing job description' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Prefer extracted generated resume text for keyword matching (Phase 1.1)
        const scanResumeText =
            (typeof generatedText === 'string' && generatedText.trim()) ||
            (latexCode ? latexToPlainText(latexCode) : '') ||
            resumeText ||
            '';

        if (!scanResumeText.trim()) {
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

        const reserved = await trackAtsScan(userId);
        if (!reserved.ok) {
            return NextResponse.json(
                { error: 'Failed to reserve ATS scan quota' },
                { status: 500, headers: corsHeaders }
            );
        }

        // 1. Static Analysis (Format Check)
        // We use the existing validator for "Basic" checks (tables, images, etc.)
        const basicCheck = checkAtsCompliance(latexCode || '');

        // 2. AI Deep Analysis
        const prompt = buildAtsScanPrompt(scanResumeText, jobDescription);

        let response;
        try {
            response = await ai.models.generateContent({
                model: 'gemini-3.1-pro-preview',
                contents: prompt,
            });
        } catch (err) {
            console.warn('[scan] Primary model failed, falling back to gemini-2.5-pro:', err);
            response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
        }
        const text = response.text || '';

        // Parse JSON response from AI
        // Remove markdown code blocks if present
        const jsonString = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

        let aiAnalysis;
        try {
            aiAnalysis = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse AI output:", text);
            // Fallback empty structure
            aiAnalysis = {
                keywordMatch: { found: [], missing: [], score: 0 },
                sectionScores: { impact: 0, brevity: 0, relevance: 0 },
                improvements: ["Could not analyze content detailedly. Please try again."]
            };
        }

        // 3. Merge Results
        // Use AI's overall score as the primary score (it already factors in keywords,
        // bullets, sections, and placement). Apply a small penalty for static format issues.
        const formatPenalty = Math.min(basicCheck.issues.length * 5, 15);
        const aiScore = aiAnalysis.overallScore ?? aiAnalysis.keywordMatch?.score ?? 0;
        const finalScore = Math.max(0, Math.min(100, Math.round(aiScore - formatPenalty)));

        const foundKeywords = aiAnalysis.keywordMatch?.found ?? [];
        const keywordPlacement = computeKeywordPlacement(scanResumeText, foundKeywords);

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
        };

        return NextResponse.json(
            finalAnalysis,
            { status: 200, headers: corsHeaders }
        );

    } catch (error: any) {
        console.error('ATS Scan Error:', error);
        return NextResponse.json(
            { error: 'Failed to perform ATS scan' },
            { status: 500, headers: corsHeaders }
        );
    }
}
