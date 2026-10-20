import * as Sentry from '@sentry/nextjs';
import { reportedElsewhere, withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NO_RESUME, readJobSearchParams } from '@/lib/job-board/filter-params';
import { cachedResumeJobProfile, JobFeedError, loadJobFeed } from '@/lib/job-board/job-feed';
import type { ResumeJobProfile } from '@/lib/job-board/resume-match';

async function handleGET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { filters, page, resumeId } = readJobSearchParams(new URL(request.url).searchParams);

  const trackerResult = await supabase
    .from('job_applications')
    .select('job_url, company_name, role_title, status, is_archived')
    .eq('user_id', user.id);
  if (trackerResult.error) return NextResponse.json({ error: 'Unable to load tracker filters' }, { status: 500 });

  let resumeProfile: ResumeJobProfile | null = null;
  let rankingUnavailable = false;
  if (resumeId && resumeId !== NO_RESUME) {
    const resumeResult = await supabase.from('resumes').select('structured_data').eq('id', resumeId).eq('user_id', user.id).maybeSingle();
    if (resumeResult.error) {
      // The jobs still load in date order; the explorer says ranking is unavailable.
      Sentry.captureException(new Error('Verified job feed resume ranking read failed'));
      rankingUnavailable = true;
    } else {
      resumeProfile = cachedResumeJobProfile(resumeResult.data?.structured_data)?.profile ?? null;
    }
  }

  try {
    const feed = await loadJobFeed({ filters, page, trackerEntries: trackerResult.data || [], resumeProfile });
    return NextResponse.json({ ...feed, rankingUnavailable });
  } catch (error) {
    if (!(error instanceof JobFeedError)) throw error;
    // Reported with its cause, so the route wrapper does not open a second issue.
    Sentry.captureException(error);
    const message = error.stage === 'evidence' ? 'Unable to load job evidence' : 'Unable to load verified jobs';
    return reportedElsewhere(NextResponse.json({ error: message }, { status: 500 }));
  }
}

export const GET = withSentryApiErrors(handleGET, '/api/job-board/jobs', 'GET');
