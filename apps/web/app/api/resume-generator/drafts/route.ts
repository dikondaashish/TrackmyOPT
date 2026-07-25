/**
 * Resume draft autosave API (ISS-025).
 *
 * GET  /api/resume-generator/drafts?draftKey=foo  → fetch a single draft
 * POST /api/resume-generator/drafts               → upsert { draftKey, step, payload }
 *
 * Client uses a stable `draftKey` (per browser tab/session) so refreshes
 * resume where the user left off.
 *
 * Uses the standard API envelope (lib/api/response.ts).
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    apiFail,
    apiOk,
    apiServerError,
    apiUnauthorized,
} from '@/lib/api/response';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return apiUnauthorized();

        const { searchParams } = new URL(req.url);
        const draftKey = searchParams.get('draftKey');

        if (!draftKey) {
            const { data, error } = await supabase
                .from('resume_drafts')
                .select('draft_key, step, payload, updated_at')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })
                .limit(1);
            if (error) return apiFail('Could not load resume draft', { status: 500, code: 'db_error' });
            return apiOk({ draft: data?.[0] ?? null });
        }

        const { data, error } = await supabase
            .from('resume_drafts')
            .select('draft_key, step, payload, updated_at')
            .eq('user_id', user.id)
            .eq('draft_key', draftKey)
            .maybeSingle();
        if (error) return apiFail('Could not load resume draft', { status: 500, code: 'db_error' });
        return apiOk({ draft: data ?? null });
    } catch (e) {
        return apiServerError(e);
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return apiUnauthorized();

        const body = await req.json().catch(() => ({}) as Record<string, unknown>);
        const draftKey =
            typeof body.draftKey === 'string' && body.draftKey.length > 0
                ? body.draftKey.slice(0, 80)
                : null;
        const step = typeof body.step === 'string' ? body.step.slice(0, 40) : null;
        const payload = body.payload;

        if (!draftKey || !payload || typeof payload !== 'object') {
            return apiFail('draftKey and payload required', { code: 'invalid_input' });
        }

        const json = JSON.stringify(payload);
        if (json.length > 100_000) {
            return apiFail('Draft too large', { status: 413, code: 'payload_too_large' });
        }

        const { error } = await supabase
            .from('resume_drafts')
            .upsert(
                { user_id: user.id, draft_key: draftKey, step, payload },
                { onConflict: 'user_id,draft_key' },
            );
        if (error) return apiFail('Could not save resume draft', { status: 500, code: 'db_error' });
        return apiOk({ saved: true });
    } catch (e) {
        return apiServerError(e);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return apiUnauthorized();
        const { searchParams } = new URL(req.url);
        const draftKey = searchParams.get('draftKey');
        if (!draftKey) return apiFail('draftKey required', { code: 'invalid_input' });
        const { error } = await supabase
            .from('resume_drafts')
            .delete()
            .eq('user_id', user.id)
            .eq('draft_key', draftKey);
        if (error) return apiFail('Could not delete resume draft', { status: 500, code: 'db_error' });
        return apiOk({ deleted: true });
    } catch (e) {
        return apiServerError(e);
    }
}
