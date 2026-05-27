import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth/jwt';
import { withPostHogClient } from '@/lib/posthog-server';
import rateLimit from '@/lib/auth/rate-limit';

export const dynamic = 'force-dynamic';

// 20 job saves per minute per user token
const jobAddLimiter = rateLimit({ interval: 60_000 });

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

    const { isRateLimited } = jobAddLimiter.check(req, 20, `job-add:${userId}`);
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before adding more jobs.' },
        { status: 429, headers: corsHeaders }
      );
    }
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders });
    }

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
      let message = 'Failed to add job to tracker';
      if (error.code === '23505') {
        message = 'This job is already in your tracker.';
      } else if (error.code === '23503') {
        message = 'Your session is out of date. Sign out and sign in again in the extension.';
      } else if (error.code === '22P02') {
        message = 'Could not save this job. Sign out and sign in again in the extension.';
      }
      return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
    }

    await withPostHogClient((posthog) => {
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
    });

    return NextResponse.json(
      { ok: true, id: data.id, message: 'Job added to tracker' },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Extension job-application error:', message, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
