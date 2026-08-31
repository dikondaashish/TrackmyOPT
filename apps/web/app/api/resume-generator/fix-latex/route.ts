
import { NextRequest, NextResponse } from 'next/server';
import { generateAiContent } from '@/lib/ai/google-ai';
import { buildFixSyntaxPrompt } from '@/lib/ai/prompts/fix-syntax';
import rateLimit from '@/lib/auth/rate-limit';
import { getUserId } from '@/lib/auth/get-user-id';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';

// Rate Limiter: 10 requests per minute per user
const limiter = rateLimit({
    interval: 60 * 1000,
    name: 'fix-latex',
});

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

export async function POST(req: NextRequest) {
    const corsHeaders = corsHeadersWebAndExtension(req);
    // Auth check first — rate limiter only catches distributed abuse, not anon access
    const userId = await getUserId(req);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    try {
        // Per-user rate limiting (keyed by user id, not IP)
        const limitKey = userId;
        const { isRateLimited, unavailable } = await limiter.check(req, 10, limitKey);

        if (isRateLimited) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: unavailable ? 503 : 429, headers: corsHeaders }
            );
        }

        const { latexCode, errorMessage } = await req.json();

        if (!latexCode || !errorMessage) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400, headers: corsHeaders }
            );
        }

        const prompt = buildFixSyntaxPrompt(latexCode, errorMessage);

        const response = await generateAiContent({
            task: 'latex_fix',
            contents: prompt,
            userId,
        });
        let fixedLatex = response.text || '';

        // Clean output
        fixedLatex = fixedLatex.replace(/^```(?:latex)?\n?/, '').replace(/\n?```$/, '').trim();

        return NextResponse.json({ latex: fixedLatex }, { headers: corsHeaders });

    } catch (error: any) {
        console.error('Auto-Fix Error:', error);
        return NextResponse.json(
            { error: 'Failed to fix LaTeX' },
            { status: 500, headers: corsHeaders }
        );
    }
}
