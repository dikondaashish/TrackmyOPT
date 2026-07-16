import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
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

/**
 * Logs a resume generation. Returns `{ ok: boolean }` so callers can choose to
 * fail-closed (block the generation) when accounting fails — ISS-023.
 *
 * The original "non-blocking" behavior leaked quota when Supabase insert errors
 * occurred. Now callers should check the result and reject the response when
 * `ok === false`.
 */
export async function trackResumeGeneration(
    userId: string,
    type: 'generate' | 'regenerate',
): Promise<{ ok: boolean; error?: string }> {
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
        return { ok: false, error: error.message };
    }
    return { ok: true };
}

const FREE_ATS_SCAN_LIMIT = 3;
const PRO_ATS_SCAN_LIMIT = 10_000;

// ATS routes accept the extension's custom Bearer JWT as well as web cookies.
// Once a route has verified that JWT and resolved userId, use the server-only
// admin client for quota reads/writes; an anon cookie client has no Supabase
// session in extension requests and would incorrectly fail RLS.
function getAtsUsageClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
    );
}

export async function checkAtsScanLimit(userId: string) {
    const supabase = getAtsUsageClient();

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('plan_tier, premium_status')
        .eq('user_id', userId)
        .single();

    if (profileError) {
        console.error('Error fetching profile for ATS limit check:', profileError);
    }

    const tier = profile?.plan_tier || 'free';
    let limit = FREE_ATS_SCAN_LIMIT;
    if (tier === 'pro') limit = PRO_ATS_SCAN_LIMIT;
    if (tier === 'dedicated') limit = PRO_ATS_SCAN_LIMIT;
    if (profile?.premium_status && limit < PRO_ATS_SCAN_LIMIT) limit = PRO_ATS_SCAN_LIMIT;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: usageData, error: usageError } = await supabase
        .from('resume_generations')
        .select('id')
        .eq('user_id', userId)
        .eq('generation_type', 'ats_scan')
        .gte('created_at', startOfMonth);

    if (usageError) {
        console.error('Error fetching ATS scan usage:', usageError);
        throw new Error('Failed to check ATS scan limits');
    }

    const usage = usageData?.length ?? 0;
    const allowed = usage < limit;

    return { allowed, limit, usage, tier };
}

export async function trackAtsScan(userId: string): Promise<{ ok: boolean; error?: string }> {
    const supabase = getAtsUsageClient();

    const { error } = await supabase.from('resume_generations').insert({
        user_id: userId,
        generation_type: 'ats_scan',
    });

    if (error) {
        console.error('Failed to log ATS scan:', error);
        return { ok: false, error: error.message };
    }
    return { ok: true };
}
