/**
 * Lightweight PATCH endpoint for non-date profile flags
 * (onboarding_completed, future toggles).
 *
 * Uses the standard API envelope (lib/api/response.ts).
 */
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiFail, apiOk, apiServerError, apiUnauthorized } from '@/lib/api/response';
import { captureServerEvent } from '@/lib/posthog-server';

const ALLOWED_FLAGS = new Set(['onboarding_completed']);

const ALLOWED_ONBOARDING_STATUS = new Set([
    'applying_opt',
    'on_opt',
    'stem_opt',
]);

type OnboardingAnalyticsInput = {
    skipped?: boolean;
    onboarding_status?: string;
    is_stem_eligible?: boolean;
    degree_level?: string;
};

function parseOnboardingAnalytics(body: Record<string, unknown>): OnboardingAnalyticsInput {
    const analytics: OnboardingAnalyticsInput = {};

    if (typeof body.skipped === 'boolean') {
        analytics.skipped = body.skipped;
    }

    if (typeof body.onboarding_status === 'string') {
        const status = body.onboarding_status.trim();
        if (ALLOWED_ONBOARDING_STATUS.has(status)) {
            analytics.onboarding_status = status;
        }
    }

    if (typeof body.is_stem_eligible === 'boolean') {
        analytics.is_stem_eligible = body.is_stem_eligible;
    }

    if (typeof body.degree_level === 'string') {
        const degree = body.degree_level.trim();
        if (degree.length > 0 && degree.length <= 64) {
            analytics.degree_level = degree;
        }
    }

    return analytics;
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return apiUnauthorized();
        }

        const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
        const onboardingAnalytics = parseOnboardingAnalytics(body);
        const updates: Record<string, boolean> = {};
        for (const [key, value] of Object.entries(body)) {
            if (!ALLOWED_FLAGS.has(key)) continue;
            if (typeof value !== 'boolean') continue;
            updates[key] = value;
        }

        if (Object.keys(updates).length === 0) {
            return apiFail('No valid fields provided', { code: 'no_valid_fields' });
        }

        const { error } = await supabase.from('profiles').update(updates).eq('user_id', user.id);

        if (error) {
            console.error('profile/flags update error:', error);
            return apiFail('Database error', { status: 500, code: 'db_error' });
        }

        if (updates.onboarding_completed === true) {
            await captureServerEvent(user.id, 'onboarding_completed', {
                skipped: onboardingAnalytics.skipped === true,
                status: onboardingAnalytics.onboarding_status ?? null,
                is_stem_eligible: onboardingAnalytics.is_stem_eligible ?? null,
                degree_level: onboardingAnalytics.degree_level ?? null,
                capture_source: 'server',
            });
        }

        return apiOk({ updated: Object.keys(updates) });
    } catch (e) {
        return apiServerError(e);
    }
}
