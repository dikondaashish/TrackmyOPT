import { NextRequest, NextResponse } from 'next/server';
import { analyzeAtsGap } from '@/lib/ai/gemini-ai';
import { getUserId } from '@/lib/auth/get-user-id';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { checkAtsScanLimit, trackAtsScan } from '@/lib/usage-limit';

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
        const { resumeText, jobDescription } = await req.json();

        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: 'Missing resumeText or jobDescription' },
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

        const analysis = await analyzeAtsGap(resumeText, jobDescription, userId);

        return NextResponse.json(analysis, { headers: corsHeaders });

    } catch (error) {
        console.error('Gap Analysis Error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze gap' },
            { status: 500, headers: corsHeaders }
        );
    }
}
