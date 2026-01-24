import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Cron Job: Trigger USCIS Status Check Batch
 * Triggered by cron-job.org
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (set in Vercel environment variables)
    const authHeader = req.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('❌ Unauthorized cron job attempt');
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Triggering Backend USCIS Batch Check...');

    // Call Backend (NestJS) to queue jobs
    // In production, this points to your Render URL via env var
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const response = await fetch(`${apiUrl}/uscis/check-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

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
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
