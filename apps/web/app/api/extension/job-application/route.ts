import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/getUserId';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { captureServerEvent } from '@/lib/posthog-server';
import rateLimit from '@/lib/auth/rate-limit';
import { normalizeJobSnapshot } from '@/lib/career/job-tracker/job-snapshot';
import { findSimilarApplication } from '@/lib/career/job-tracker/application-match';

export const dynamic = 'force-dynamic';

// 20 job saves per minute per user token
const jobAddLimiter = rateLimit({ interval: 60_000, name: 'extension-job-application' });
const MAX_REQUEST_BODY_CHARACTERS = 50_000;

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

/**
 * GET /api/extension/job-application?job_url=<url>
 * Returns whether the current posting is already in the caller's tracker, so
 * the extension widget can paint its saved state instead of always "Not saved".
 * Accepts either a web cookie session or the extension Bearer token.
 */
export async function GET(req: NextRequest) {
  const corsHeaders = corsHeadersWebAndExtension(req);
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const jobUrl = req.nextUrl.searchParams.get('job_url')?.trim() || '';
    const companyName = req.nextUrl.searchParams.get('company_name')?.trim() || '';
    const roleTitle = req.nextUrl.searchParams.get('role_title')?.trim() || '';
    if (!jobUrl && (!companyName || !roleTitle)) {
      return NextResponse.json({ saved: false }, { headers: corsHeaders });
    }

    const supabase = getAdminClient();
    let exactApplication: { status: string; applied_at: string | null; created_at: string } | null = null;
    if (jobUrl) {
      const { data, error } = await supabase
        .from('job_applications')
        .select('status, applied_at, created_at')
        .eq('user_id', userId)
        .eq('job_url', jobUrl)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Extension job-application lookup error:', error);
        return NextResponse.json({ error: 'Lookup failed' }, { status: 500, headers: corsHeaders });
      }
      exactApplication = data;
    }

    let duplicateApplication = null;
    if (!exactApplication && companyName && roleTitle) {
      const { data: candidates, error: candidateError } = await supabase
        .from('job_applications')
        .select('id, company_name, role_title, job_url, status, applied_at, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (candidateError) {
        // Duplicate guidance is best-effort and must never block the exact saved
        // state or the user's ability to save the current posting.
        console.error('Extension similar-application lookup error:', candidateError);
      } else {
        duplicateApplication = findSimilarApplication(candidates || [], {
          companyName,
          roleTitle,
          currentJobUrl: jobUrl,
        });
      }
    }

    return NextResponse.json(
      {
        saved: !!exactApplication,
        ...(exactApplication ? {
          status: exactApplication.status,
          saved_at: exactApplication.applied_at || exactApplication.created_at || null,
        } : {}),
        ...(duplicateApplication ? { duplicate_application: duplicateApplication } : {}),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Extension job-application GET error:', message, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/extension/job-application
 * Called by the Chrome extension when user adds a job from a career portal (LinkedIn, Indeed, etc.)
 * Accepts either a web cookie session or the extension Bearer token and creates
 * a job application in the user's tracker.
 */
export async function POST(req: NextRequest) {
  const corsHeaders = corsHeadersWebAndExtension(req);
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const { isRateLimited, unavailable } = await jobAddLimiter.check(req, 20, `job-add:${userId}`);
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before adding more jobs.' },
        { status: unavailable ? 503 : 429, headers: corsHeaders }
      );
    }
    const rawBody = await req.text();
    if (rawBody.length > MAX_REQUEST_BODY_CHARACTERS) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413, headers: corsHeaders }
      );
    }
    const body = (() => {
      try { return JSON.parse(rawBody) as unknown; } catch { return null; }
    })();
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
      salary_text,
      job_description,
    } = body as Record<string, unknown>;

    if (!company_name || !role_title) {
      return NextResponse.json(
        { error: 'company_name and role_title are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const snapshot = normalizeJobSnapshot({
      salaryText: salary_text,
      jobDescription: job_description,
    });
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
        salary_text: snapshot.salaryText,
        job_description: snapshot.jobDescription,
      })
      .select()
      .single();

    if (error) {
      console.error('Extension job-application insert error:', error);
      let message = 'Failed to add job to tracker';
      if (error.code === '23505') {
        // The partial unique index makes concurrent clicks/tabs atomic. Treat
        // the conflict as idempotent success so the widget paints Saved/View.
        return NextResponse.json(
          { ok: true, already_saved: true, message: 'This job is already in your tracker.' },
          { headers: corsHeaders }
        );
      } else if (error.code === '23503') {
        message = 'Your session is out of date. Sign out and sign in again in the extension.';
      } else if (error.code === '22P02') {
        message = 'Could not save this job. Sign out and sign in again in the extension.';
      }
      return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
    }

    await captureServerEvent(userId as string, "extension_job_added", {
      company_name: String(company_name).trim(),
      role_title: String(role_title).trim(),
      status: status === 'Applied' ? 'Applied' : 'Wishlist',
      source: 'chrome_extension',
      has_job_url: !!job_url,
      has_salary_text: !!snapshot.salaryText,
      has_job_description: !!snapshot.jobDescription,
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
