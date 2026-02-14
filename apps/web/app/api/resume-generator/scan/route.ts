
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
        // Using gemini-2.5-pro for advanced reasoning on content match
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        const prompt = buildAtsScanPrompt(resumeText, jobDescription);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

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
        const finalAnalysis = {
            passed: basicCheck.passed,
            issues: basicCheck.issues, // Formatting issues
            keywordMatch: aiAnalysis.keywordMatch,
            sectionScores: aiAnalysis.sectionScores,
            improvements: aiAnalysis.improvements,
            // Calculate overall score: 40% Formatting, 30% Keywords, 30% Impact
            score: Math.round(
                (basicCheck.issues.length === 0 ? 40 : Math.max(0, 40 - basicCheck.issues.length * 10)) +
                (aiAnalysis.keywordMatch.score * 0.3) +
                ((aiAnalysis.sectionScores.impact + aiAnalysis.sectionScores.relevance) / 2 * 0.3)
            )
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
