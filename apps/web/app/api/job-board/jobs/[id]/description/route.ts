import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerJob } from '@/lib/job-board/server-job-store';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
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
  } catch {
    return NextResponse.json({ error: 'Unable to load job description' }, { status: 500 });
  }
}
