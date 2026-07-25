
import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { buildFixSyntaxPrompt } from '@/lib/ai/prompts/fix-syntax';
import rateLimit from '@/lib/auth/rate-limit';
import { getUserId } from '@/lib/auth/getUserId';

// Rate Limiter: 10 requests per minute per user
const limiter = rateLimit({
    interval: 60 * 1000,
    name: 'fix-latex',
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: NextRequest) {
    // Auth check first — rate limiter only catches distributed abuse, not anon access
    const userId = await getUserId(req);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Per-user rate limiting (keyed by user id, not IP)
        const limitKey = userId;
        const { isRateLimited, unavailable } = await limiter.check(req, 10, limitKey);

        if (isRateLimited) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: unavailable ? 503 : 429 }
            );
        }

        const { latexCode, errorMessage } = await req.json();

        if (!latexCode || !errorMessage) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const prompt = buildFixSyntaxPrompt(latexCode, errorMessage);

        let response;
        try {
            response = await ai.models.generateContent({
                model: 'gemini-3.1-pro-preview',
                contents: prompt,
            });
        } catch (err) {
            console.warn('[fix-latex] Primary model failed, falling back to gemini-2.5-pro:', err);
            response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
        }
        let fixedLatex = response.text || '';

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
