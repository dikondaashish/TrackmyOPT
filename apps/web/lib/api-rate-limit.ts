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

// ============================================================================
// IN-MEMORY STORE
// Note: For serverless (Vercel), this resets on cold starts
// For production at scale, use Redis or similar
// ============================================================================

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// Global store for rate limits (persists across requests in same instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(): void {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;

    lastCleanup = now;
    const nowSeconds = Math.floor(now / 1000);

    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < nowSeconds) {
            rateLimitStore.delete(key);
        }
    }
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
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    // Cleanup old entries periodically
    cleanupExpiredEntries();

    const now = Math.floor(Date.now() / 1000);
    const key = `${config.name}:${identifier}`;

    let entry = rateLimitStore.get(key);

    // If no entry or entry expired, create new one
    if (!entry || entry.resetTime < now) {
        entry = {
            count: 0,
            resetTime: now + config.windowSeconds,
        };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);

    const remaining = Math.max(0, config.limit - entry.count);
    const success = entry.count <= config.limit;

    return {
        success,
        limit: config.limit,
        remaining,
        reset: entry.resetTime,
        retryAfter: success ? undefined : entry.resetTime - now,
    };
}

/**
 * Check rate limit using IP address from request
 */
export function checkRateLimitByIP(
    request: NextRequest,
    config: RateLimitConfig
): RateLimitResult {
    const ip = getClientIP(request);
    return checkRateLimit(ip, config);
}

/**
 * Check rate limit using user ID
 */
export function checkRateLimitByUser(
    userId: string,
    config: RateLimitConfig
): RateLimitResult {
    return checkRateLimit(`user:${userId}`, config);
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
            error: message,
            retryAfter: result.retryAfter,
        },
        {
            status: 429,
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
export function withRateLimit(
    request: NextRequest,
    config: RateLimitConfig,
    userId?: string
): RateLimitResult {
    // Use user ID if provided, otherwise use IP
    if (userId) {
        return checkRateLimitByUser(userId, config);
    }
    return checkRateLimitByIP(request, config);
}
