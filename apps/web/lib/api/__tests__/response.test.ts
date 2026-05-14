/**
 * Unit tests for the shared API response envelope (lib/api/response.ts).
 * Locks the contract: { ok: true, data } on success, { ok: false, error } on failure.
 */

import { describe, expect, it, vi } from 'vitest';
import {
    apiFail,
    apiForbidden,
    apiNotFound,
    apiOk,
    apiRateLimited,
    apiServerError,
    apiUnauthorized,
} from '@/lib/api/response';

async function bodyOf(res: Response): Promise<any> {
    return await res.json();
}

describe('apiOk', () => {
    it('returns { ok: true, data } with status 200', async () => {
        const res = apiOk({ id: 'abc' });
        expect(res.status).toBe(200);
        const body = await bodyOf(res);
        expect(body).toEqual({ ok: true, data: { id: 'abc' } });
    });

    it('honors custom status override', async () => {
        const res = apiOk({}, { status: 201 });
        expect(res.status).toBe(201);
    });
});

describe('apiFail', () => {
    it('returns { ok: false, error } with status 400 by default', async () => {
        const res = apiFail('bad input');
        expect(res.status).toBe(400);
        const body = await bodyOf(res);
        expect(body).toEqual({ ok: false, error: 'bad input' });
    });

    it('includes code and details when provided', async () => {
        const res = apiFail('missing field', { code: 'validation_error', details: { field: 'email' } });
        const body = await bodyOf(res);
        expect(body.code).toBe('validation_error');
        expect(body.details).toEqual({ field: 'email' });
    });

    it('does NOT include code/details when not provided (no nulls in response)', async () => {
        const res = apiFail('plain error');
        const body = await bodyOf(res);
        expect('code' in body).toBe(false);
        expect('details' in body).toBe(false);
    });
});

describe('apiUnauthorized / apiForbidden / apiNotFound / apiRateLimited', () => {
    it('apiUnauthorized = 401 with code unauthorized', async () => {
        const res = apiUnauthorized();
        expect(res.status).toBe(401);
        const body = await bodyOf(res);
        expect(body.code).toBe('unauthorized');
    });

    it('apiForbidden = 403 with code forbidden', async () => {
        const res = apiForbidden();
        expect(res.status).toBe(403);
        const body = await bodyOf(res);
        expect(body.code).toBe('forbidden');
    });

    it('apiNotFound = 404 with code not_found', async () => {
        const res = apiNotFound();
        expect(res.status).toBe(404);
        const body = await bodyOf(res);
        expect(body.code).toBe('not_found');
    });

    it('apiRateLimited = 429 with code rate_limited', async () => {
        const res = apiRateLimited();
        expect(res.status).toBe(429);
        const body = await bodyOf(res);
        expect(body.code).toBe('rate_limited');
    });
});

describe('apiServerError', () => {
    it('returns 500 with generic public message (does not leak internal error)', async () => {
        // Suppress the server-side log we expect this helper to emit.
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const res = apiServerError(new Error('database is down — secret password leaked'));
        expect(res.status).toBe(500);
        const body = await bodyOf(res);
        expect(body.ok).toBe(false);
        expect(body.error).toBe('Internal server error');
        expect(body.code).toBe('internal_error');
        // Critical: secret message stays in server logs only, not in response body
        expect(JSON.stringify(body)).not.toContain('secret password');
        spy.mockRestore();
    });
});
