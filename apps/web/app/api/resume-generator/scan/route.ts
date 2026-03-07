
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { buildAtsScanPrompt } from '@/lib/ai/prompts/ats-scan';
import { checkAtsCompliance } from '@/lib/validators/ats-checker';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resumeText, jobDescription, latexCode } = body;

        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: 'Missing resume text or job description' },
                { status: 400, headers: corsHeaders }
            );
        }

        // 1. Static Analysis (Format Check)
        // We use the existing validator for "Basic" checks (tables, images, etc.)
        const basicCheck = checkAtsCompliance(latexCode || '');

        // 2. AI Deep Analysis
        const prompt = buildAtsScanPrompt(resumeText, jobDescription);

        let response;
        try {
            response = await ai.models.generateContent({
                model: 'gemini-3.1-pro-preview',
                contents: prompt,
            });
        } catch {
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

        const finalAnalysis = {
            passed: basicCheck.passed && finalScore >= 75,
            issues: basicCheck.issues,
            keywordMatch: aiAnalysis.keywordMatch,
            sectionScores: aiAnalysis.sectionScores,
            bulletAnalysis: aiAnalysis.bulletAnalysis,
            improvements: aiAnalysis.improvements,
            missingKeywordsByCategory: aiAnalysis.missingKeywordsByCategory,
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
