import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
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

        // Get Job Count
        const { count: jobCount, error: jobError } = await supabase
            .from('job_tracker')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (jobError) {
            console.error('Error fetching job count:', jobError);
        }

        return NextResponse.json({
            jobsCount: jobCount || 0,
            jobLimit: 5 // Hardcoded limit for visualization for now
        });

    } catch (error) {
        console.error('Error in usage API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch usage stats' },
            { status: 500 }
        );
    }
}
