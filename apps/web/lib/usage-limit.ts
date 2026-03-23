import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function checkResumeLimit(userId: string) {
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

    // 1. Get User Profile for Tier
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('plan_tier, premium_status')
        .eq('user_id', userId)
        .single();

    if (profileError) {
        console.error('Error fetching profile for limit check:', profileError);
        // Fail open or closed? Let's fail safe (allow basic limit) or throw.
        // For now, default to free tier if error.
    }

    const tier = profile?.plan_tier || 'free';

    // Limits
    let limit = 5; // Default Free
    if (tier === 'pro') limit = 500;
    if (tier === 'dedicated') limit = 1000;

    // Legacy/Manual override check
    if (profile?.premium_status && limit < 500) limit = 500;

    // 2. Count Usage for Current Month (SUM credit_cost)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: usageData, error: usageError } = await supabase
        .from('resume_generations')
        .select('credit_cost')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth);

    if (usageError) {
        console.error('Error fetching resume usage:', usageError);
        throw new Error('Failed to check usage limits');
    }

    const usage = usageData?.reduce((acc, row) => acc + Number(row.credit_cost || 0), 0) || 0;
    const allowed = usage < limit;

    return { allowed, limit, usage, tier };
}

export async function trackResumeGeneration(userId: string, type: 'generate' | 'regenerate') {
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

    const creditCost = type === 'regenerate' ? 0.5 : 1.0;

    const { error } = await supabase
        .from('resume_generations')
        .insert({
            user_id: userId,
            generation_type: type,
            credit_cost: creditCost
        });

    if (error) {
        console.error('Failed to log resume generation:', error);
        // Non-blocking error logging
    }
}
