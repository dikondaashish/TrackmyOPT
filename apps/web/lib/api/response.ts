/**
 * Shared HTTP response helpers for API routes.
 *
 * Why:
 *  - Every API route used to invent its own success/error shape — some used
 *    `{ ok: true, data }`, others `{ success: true, ...spread }`, others
 *    `{ error: 'message' }` with random nesting.
 *  - Clients then had to special-case each route. This causes bugs like
 *    ISS-002.1 (CaseStatusSummary widget reading `data.caseStatus` while
 *    the API returned `data.data`).
 *
 * Standard envelope:
 *
 *   Success → 200 { ok: true,  data: T }
 *   Failure → 4xx { ok: false, error: string, code?: string, details?: any }
 *
 * Use the helpers below instead of `NextResponse.json(...)` directly so this
 * contract stays consistent.
 */

import { NextResponse } from 'next/server';

type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = {
    ok: false;
    error: string;
    code?: string;
    details?: unknown;
};

interface ResponseOptions {
    status?: number;
    headers?: HeadersInit;
}

/** 200-style success. Pass any serializable `data`. */
export function apiOk<T>(data: T, opts: ResponseOptions = {}): NextResponse {
    const body: ApiSuccess<T> = { ok: true, data };
    return NextResponse.json(body, {
        status: opts.status ?? 200,
        headers: opts.headers,
    });
}

/** Client-side error (default 400). Use for validation, not-found, unauthorized. */
export function apiFail(
    error: string,
    opts: ResponseOptions & { code?: string; details?: unknown } = {},
): NextResponse {
    const body: ApiFailure = {
        ok: false,
        error,
        ...(opts.code ? { code: opts.code } : {}),
        ...(opts.details !== undefined ? { details: opts.details } : {}),
    };
    return NextResponse.json(body, {
        status: opts.status ?? 400,
        headers: opts.headers,
    });
}

/** 401 Unauthorized. */
export function apiUnauthorized(message = 'Unauthorized', opts: ResponseOptions = {}): NextResponse {
    return apiFail(message, { ...opts, status: 401, code: 'unauthorized' });
}

/** 403 Forbidden. */
export function apiForbidden(message = 'Forbidden', opts: ResponseOptions = {}): NextResponse {
    return apiFail(message, { ...opts, status: 403, code: 'forbidden' });
}

/** 404 Not Found. */
export function apiNotFound(message = 'Not found', opts: ResponseOptions = {}): NextResponse {
    return apiFail(message, { ...opts, status: 404, code: 'not_found' });
}

/** 429 Too Many Requests. */
export function apiRateLimited(
    message = 'Too many requests',
    opts: ResponseOptions = {},
): NextResponse {
    return apiFail(message, { ...opts, status: 429, code: 'rate_limited' });
}

/**
 * 500-style server error. The actual error is logged server-side via the
 * supplied logger (or console.error if none); the client gets a generic
 * message to avoid leaking internal detail.
 */
export function apiServerError(
    error: unknown,
    publicMessage = 'Internal server error',
    opts: ResponseOptions & { code?: string } = {},
): NextResponse {
    const msg = error instanceof Error ? error.message : String(error);
    // Server-only log; never returned to the client.
    console.error('[apiServerError]', msg);
    return apiFail(publicMessage, {
        ...opts,
        status: opts.status ?? 500,
        code: opts.code ?? 'internal_error',
    });
}
