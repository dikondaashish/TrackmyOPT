/**
 * Lightweight PATCH endpoint for non-date profile flags
 * (onboarding_completed, future toggles).
 *
 * Uses the standard API envelope (lib/api/response.ts).
 */
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiFail, apiOk, apiServerError, apiUnauthorized } from '@/lib/api/response';

const ALLOWED_FLAGS = new Set(['onboarding_completed']);

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

        return apiOk({ updated: Object.keys(updates) });
    } catch (e) {
        return apiServerError(e);
    }
}
