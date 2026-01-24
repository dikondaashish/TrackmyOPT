import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Extend Vercel timeout to 60s

/**
 * Cron Job: Trigger USCIS Status Check Batch
 * Triggered by cron-job.org
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('❌ Unauthorized cron job attempt');
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Triggering Backend USCIS Batch Check...');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.API_SECRET_KEY;

    if (!apiUrl || !apiKey) {
      console.error('❌ Missing configuration: NEXT_PUBLIC_API_URL or API_SECRET_KEY');
      throw new Error('Server misconfiguration: Missing API URL or Key');
    }

    // Call Backend (NestJS)
    const response = await fetch(`${apiUrl}/uscis/check-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      // Increase fetch timeout to handle cold starts (if environment supports it)
      signal: AbortSignal.timeout(59000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Backend Error (${response.status}):`, errorText);
      throw new Error(`Backend returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Batch triggered successfully:', result);

    return NextResponse.json(
      {
        ok: true,
        message: 'Batch job triggered',
        backend_response: result
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Internal server error',
        details: 'Check Vercel logs for full stack trace'
      },
      { status: 500 }
    );
  }
}

