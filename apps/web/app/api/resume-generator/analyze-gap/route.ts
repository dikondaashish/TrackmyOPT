import { NextRequest, NextResponse } from 'next/server';
import { analyzeAtsGap } from '@/lib/ai/gemini-ai';
import { getUserId } from '@/lib/auth/get-user-id';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { checkAtsScanLimit, trackAtsScan } from '@/lib/usage-limit';
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
        const { resumeText, jobDescription } = body as Record<string, unknown>;

        if (
            typeof resumeText !== 'string' ||
            !resumeText.trim() ||
            typeof jobDescription !== 'string' ||
            !jobDescription.trim()
        ) {
            return NextResponse.json(
                { error: 'Missing resumeText or jobDescription' },
                { status: 400, headers: corsHeaders }
            );
        }

        const preparedResume = prepareResumeText(resumeText, RESUME_TEXT_MAX_CHARS);
        const preparedJobDescription = prepareResumeText(jobDescription, JOB_DESCRIPTION_MAX_CHARS);

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

        const analysis = await analyzeAtsGap(preparedResume.text, preparedJobDescription.text, userId);

        // Only consume quota after a valid analysis is available. A model or
        // parsing failure must be visible to the user, not become a fake zero
        // score that silently spends an ATS scan.
        const reserved = await trackAtsScan(userId, limit);
        if (!reserved.ok) {
            return NextResponse.json(
                {
                    error: reserved.error === 'ATS scan limit reached'
                        ? 'Monthly ATS scan limit reached'
                        : 'Failed to reserve ATS scan quota',
                    code: reserved.error === 'ATS scan limit reached'
                        ? 'ats_scan_limit_reached'
                        : 'ats_scan_reservation_failed',
                },
                { status: reserved.error === 'ATS scan limit reached' ? 402 : 500, headers: corsHeaders }
            );
        }

        return NextResponse.json(analysis, { headers: corsHeaders });

    } catch (error) {
        console.error('Gap Analysis Error:', error);
        return NextResponse.json(
            { error: 'ATS analysis is temporarily unavailable', code: 'ats_analysis_unavailable' },
            { status: 502, headers: corsHeaders }
        );
    }
}
