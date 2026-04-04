import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth/jwt';
import { getPostHogClient } from '@/lib/posthog-server';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

/**
 * POST /api/extension/job-application
 * Called by the Chrome extension when user adds a job from a career portal (LinkedIn, Indeed, etc.)
 * Requires Bearer token (extension JWT). Creates a job application in the user's tracker.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = decoded.userId || decoded.sub;
    const body = await req.json();

    const {
      company_name,
      role_title,
      job_url,
      location,
      status = 'Applied',
      notes,
    } = body;

    if (!company_name || !role_title) {
      return NextResponse.json(
        { error: 'company_name and role_title are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        user_id: userId,
        company_name: String(company_name).trim(),
        role_title: String(role_title).trim(),
        job_url: job_url ? String(job_url).trim() : null,
        location: location ? String(location).trim() : null,
        status: status === 'Wishlist' ? 'Wishlist' : 'Applied',
        applied_at: status === 'Applied' ? new Date().toISOString().split('T')[0] : null,
        notes: notes ? String(notes).trim() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Extension job-application insert error:', error);
      return NextResponse.json(
        { error: 'Failed to add job to tracker' },
        { status: 500, headers: corsHeaders }
      );
    }

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId as string,
      event: 'extension_job_added',
      properties: {
        company_name: String(company_name).trim(),
        role_title: String(role_title).trim(),
        status: status === 'Applied' ? 'Applied' : 'Wishlist',
        source: 'chrome_extension',
        has_job_url: !!job_url,
      },
    });
    await posthog.shutdown();

    return NextResponse.json(
      { ok: true, id: data.id, message: 'Job added to tracker' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Extension job-application error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
