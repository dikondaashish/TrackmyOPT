import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextRequest, NextResponse } from 'next/server';

async function handleGET(_req: NextRequest) {
    return NextResponse.json({
        status: 'alive',
        timestamp: new Date().toISOString()
    });
}

export const GET = withSentryApiErrors(handleGET, '/api/keep-alive', 'GET');
