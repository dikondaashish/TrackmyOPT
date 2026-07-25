/**
 * API Rate Limiting Utility
 * 
 * SECURITY: Implements rate limiting to prevent abuse and brute-force attacks
 * 
 * Features:
 * - IP-based limiting for unauthenticated requests
 * - User-based limiting for authenticated requests
 * - Configurable limits per endpoint category
 * - Graceful 429 responses with Retry-After header
 * 
 * OWASP Reference: Rate limiting prevents:
 * - Brute force password attacks
 * - Credential stuffing
 * - API abuse and scraping
 * - Denial of service (DoS)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ============================================================================
// TYPES
// ============================================================================

export interface RateLimitConfig {
    /** Maximum requests allowed in the window */
    limit: number;
    /** Time window in seconds */
    windowSeconds: number;
    /** Identifier for this limit (for logging) */
    name: string;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number; // Unix timestamp when the limit resets
    retryAfter?: number; // Seconds until retry allowed
    /** Durable limiter was unavailable; callers should return 503, not 429. */
    unavailable?: boolean;
}

// ============================================================================
// CONFIGURATION - Rate limit presets for different endpoint categories
// ============================================================================

/**
 * SECURITY: Strict limits for authentication endpoints
 * Prevents brute force password attacks
 */
export const AUTH_RATE_LIMIT: RateLimitConfig = {
    limit: 5,           // 5 attempts
    windowSeconds: 900, // per 15 minutes
    name: 'auth',
};

/**
 * SECURITY: Moderate limits for general API usage
 */
export const API_RATE_LIMIT: RateLimitConfig = {
    limit: 100,        // 100 requests
    windowSeconds: 60, // per minute
    name: 'api',
};

/**
 * SECURITY: Stricter limits for external API calls (USCIS)
 * Prevents abuse of third-party rate limits
 */
export const USCIS_RATE_LIMIT: RateLimitConfig = {
    limit: 10,          // 10 requests
    windowSeconds: 3600, // per hour
    name: 'uscis',
};

/**
 * SECURITY: Email sending rate limit
 * Prevents email bombing
 */
export const EMAIL_RATE_LIMIT: RateLimitConfig = {
    limit: 10,          // 10 emails
    windowSeconds: 3600, // per hour
    name: 'email',
};

const durableLimiters: Record<string, Ratelimit> = {};

function hasDurableRateLimitConfig(): boolean {
    return Boolean(
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
    );
}

function getDurableLimiter(config: RateLimitConfig): Ratelimit | null {
    if (!hasDurableRateLimitConfig()) return null;

    const key = `${config.name}:${config.limit}:${config.windowSeconds}`;
    if (!durableLimiters[key]) {
        durableLimiters[key] = new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.fixedWindow(
                config.limit,
                `${config.windowSeconds} s` as Duration
            ),
            prefix: `trackmyopt:rate-limit:${config.name}`,
            analytics: true,
        });
    }
    return durableLimiters[key];
}

function unavailableResult(config: RateLimitConfig): RateLimitResult {
    const now = Math.floor(Date.now() / 1000);
    return {
        success: false,
        limit: config.limit,
        remaining: 0,
        reset: now + Math.min(config.windowSeconds, 60),
        retryAfter: Math.min(config.windowSeconds, 60),
        unavailable: true,
    };
}

function developmentBypassResult(config: RateLimitConfig): RateLimitResult {
    return {
        success: true,
        limit: config.limit,
        remaining: config.limit,
        reset: Math.floor(Date.now() / 1000) + config.windowSeconds,
    };
}

// ============================================================================
// CORE RATE LIMITING FUNCTIONS
// ============================================================================

/**
 * Extract client IP from request
 * SECURITY: Uses X-Forwarded-For for proxied requests (Vercel, Cloudflare)
 */
export function getClientIP(request: NextRequest): string {
    // Vercel provides cf-connecting-ip or x-forwarded-for
    const forwardedFor = request.headers.get('x-forwarded-for');
    const cfIP = request.headers.get('cf-connecting-ip');
    const realIP = request.headers.get('x-real-ip');

    if (cfIP) return cfIP;
    if (forwardedFor) return forwardedFor.split(',')[0].trim();
    if (realIP) return realIP;

    // Fallback (shouldn't happen in production)
    return 'unknown';
}

/**
 * Check rate limit for a given identifier
 * 
 * @param identifier - Unique identifier (IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Result with success status and limit info
 */
export async function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const limiter = getDurableLimiter(config);
    if (!limiter) {
        return process.env.NODE_ENV === 'production'
            ? unavailableResult(config)
            : developmentBypassResult(config);
    }

    try {
        const result = await limiter.limit(identifier);
        const now = Math.floor(Date.now() / 1000);
        const resetSeconds =
            result.reset > 10_000_000_000
                ? Math.ceil(result.reset / 1000)
                : result.reset;
        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: resetSeconds,
            retryAfter: result.success
                ? undefined
                : Math.max(1, resetSeconds - now),
        };
    } catch {
        return process.env.NODE_ENV === 'production'
            ? unavailableResult(config)
            : developmentBypassResult(config);
    }
}

/**
 * Check rate limit using IP address from request
 */
export async function checkRateLimitByIP(
    request: NextRequest,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const ip = getClientIP(request);
    return checkRateLimit(ip, config);
}

/**
 * Check rate limit using user ID
 */
export async function checkRateLimitByUser(
    userId: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    return checkRateLimit(`user:${userId}`, config);
}

export async function checkRateLimitByAccount(
    account: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    return checkRateLimit(`account:${account.trim().toLowerCase()}`, config);
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

/**
 * Create a 429 Too Many Requests response
 * SECURITY: Includes proper headers for clients to handle gracefully
 */
export function rateLimitResponse(
    result: RateLimitResult,
    customMessage?: string
): NextResponse {
    const message = customMessage ||
        `Too many requests. Please try again in ${result.retryAfter} seconds.`;

    return NextResponse.json(
        {
            ok: false,
            error: result.unavailable
                ? 'Authentication protection is temporarily unavailable. Please try again shortly.'
                : message,
            retryAfter: result.retryAfter,
        },
        {
            status: result.unavailable ? 503 : 429,
            headers: {
                'Retry-After': String(result.retryAfter || 60),
                'X-RateLimit-Limit': String(result.limit),
                'X-RateLimit-Remaining': String(result.remaining),
                'X-RateLimit-Reset': String(result.reset),
            },
        }
    );
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
    response: NextResponse,
    result: RateLimitResult
): NextResponse {
    response.headers.set('X-RateLimit-Limit', String(result.limit));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(result.reset));
    return response;
}

// ============================================================================
// MIDDLEWARE HELPER
// ============================================================================

/**
 * Rate limit middleware wrapper for API routes
 * 
 * Usage:
 * ```ts
 * export async function POST(req: NextRequest) {
 *   const rateLimitResult = await withRateLimit(req, AUTH_RATE_LIMIT);
 *   if (!rateLimitResult.success) {
 *     return rateLimitResponse(rateLimitResult);
 *   }
 *   // Continue with request handling...
 * }
 * ```
 */
export async function withRateLimit(
    request: NextRequest,
    config: RateLimitConfig,
    userId?: string
): Promise<RateLimitResult> {
    // Use user ID if provided, otherwise use IP
    if (userId) {
        return checkRateLimitByUser(userId, config);
    }
    return checkRateLimitByIP(request, config);
}
