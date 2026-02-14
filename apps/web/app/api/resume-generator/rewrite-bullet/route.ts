import { NextRequest, NextResponse } from 'next/server';
import { rewriteBulletPoints } from '@/lib/ai/gemini-ai';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        const { resumeText, jobDescription } = await req.json();

        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: 'Missing resumeText or jobDescription' },
                { status: 400, headers: corsHeaders }
            );
        }

        const rewrites = await rewriteBulletPoints(resumeText, jobDescription);

        return NextResponse.json({ rewrites }, { headers: corsHeaders });

    } catch (error) {
        console.error('Rewrite Error:', error);
        return NextResponse.json(
            { error: 'Failed to rewrite bullets' },
            { status: 500, headers: corsHeaders }
        );
    }
}
