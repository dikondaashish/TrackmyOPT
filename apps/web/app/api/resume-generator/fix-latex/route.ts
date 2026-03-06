
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { buildFixSyntaxPrompt } from '@/lib/ai/prompts/fix-syntax';
import rateLimit from '@/lib/auth/rate-limit';

// Rate Limiter: 20 requests per minute per IP (higher limit for debugging cycle)
const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        // 1. Rate Limiting
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const { isRateLimited } = limiter.check(req, 20, ip);

        if (isRateLimited) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const { latexCode, errorMessage } = await req.json();

        if (!latexCode || !errorMessage) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Using gemini-2.0-flash for speed in debugging
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro" });
        const prompt = buildFixSyntaxPrompt(latexCode, errorMessage);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let fixedLatex = response.text();

        // Clean output
        fixedLatex = fixedLatex.replace(/^```(?:latex)?\n?/, '').replace(/\n?```$/, '').trim();

        return NextResponse.json({
            latex: fixedLatex
        });

    } catch (error: any) {
        console.error('Auto-Fix Error:', error);
        return NextResponse.json(
            { error: 'Failed to fix LaTeX' },
            { status: 500 }
        );
    }
}
