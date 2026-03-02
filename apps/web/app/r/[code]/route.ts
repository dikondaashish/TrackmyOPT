/**
 * GET /r/:code
 * 
 * Pretty referral URL redirect.
 * Redirects to the landing page with ?ref= query param.
 * 
 * Example: trackmyopt.com/r/charvi → trackmyopt.com/?ref=charvi
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { code: string } }
) {
    const code = params.code;

    // Sanitize: only allow alphanumeric, hyphens, underscores
    const sanitized = code?.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();

    if (!sanitized || sanitized.length === 0 || sanitized.length > 50) {
        // Invalid code — redirect to homepage without ref
        return NextResponse.redirect(new URL("/", req.url));
    }

    // Redirect to landing page with the ref param
    return NextResponse.redirect(new URL(`/?ref=${sanitized}`, req.url));
}
