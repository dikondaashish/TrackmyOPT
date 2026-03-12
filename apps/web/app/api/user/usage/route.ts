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

        // Get Profile and Job Count
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('premium_status, plan_tier')
            .eq('user_id', user.id)
            .single();

        const { count: jobCount, error: jobError } = await supabase
            .from('job_tracker')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (profileError) console.error('Error fetching profile for usage:', profileError);
        if (jobError) console.error('Error fetching job count:', jobError);

        // Calculate limits
        const isPaid = profile?.premium_status || false;
        const jobLimit = isPaid ? 1000 : 5; // 1000 acts as 'Unlimited' for UI practical purposes

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
