import { NextRequest, NextResponse } from 'next/server';
import { analyzeAtsGap } from '@/lib/ai/gemini-ai';
import { getUserId } from '@/lib/auth/getUserId';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trackmyopt.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    const userId = await getUserId(req);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { resumeText, jobDescription } = await req.json();

        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: 'Missing resumeText or jobDescription' },
                { status: 400, headers: corsHeaders }
            );
        }

        const analysis = await analyzeAtsGap(resumeText, jobDescription);

        return NextResponse.json(analysis, { headers: corsHeaders });

    } catch (error) {
        console.error('Gap Analysis Error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze gap' },
            { status: 500, headers: corsHeaders }
        );
    }
}
