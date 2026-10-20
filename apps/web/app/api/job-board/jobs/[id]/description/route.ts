import * as Sentry from '@sentry/nextjs';
import { reportedElsewhere, withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerJob } from '@/lib/job-board/server-job-store';

async function handleGET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  try {
    const job = await getServerJob(id);
    if (!job || job.listingStatus !== 'open' || job.sourceTrustTier !== 'verified_ats') {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ description: job.description || '' });
  } catch (error) {
    // Reported with its cause, so the route wrapper does not open a second issue.
    Sentry.captureException(new Error('Verified job description read failed', { cause: error }));
    return reportedElsewhere(NextResponse.json({ error: 'Unable to load job description' }, { status: 500 }));
  }
}

export const GET = withSentryApiErrors(handleGET, '/api/job-board/jobs/[id]/description', 'GET');
