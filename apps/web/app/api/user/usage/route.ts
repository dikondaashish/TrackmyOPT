import { NextRequest, NextResponse } from 'next/server';
import { checkResumeLimit } from '@/lib/usage-limit';

export const dynamic = 'force-dynamic';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Job tracker stores rows in job_applications (see migrations/20260115_create_job_tracker.sql)
        const { count: jobCount, error: jobError } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (jobError) console.error('Error fetching job count:', jobError);

        // Job tracker is free for all tiers (no server-side cap).
        const jobLimit = 1000;

        // Get Resume Usage
        const { usage: resumeUsage, limit: resumeLimit } = await checkResumeLimit(user.id);

        return NextResponse.json({
            jobsCount: jobCount || 0,
            jobLimit: jobLimit,
            resumeUsage,
            resumeLimit
        });

    } catch (error) {
        console.error('Error in usage API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch usage stats' },
            { status: 500 }
        );
    }
}
