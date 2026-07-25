/**
 * POST /api/referral/track
 * 
 * Increments the click counter for a referral code.
 * No auth required — called when someone visits a referral link.
 * 
 * Rate limited: one click per IP per referral code per 24 hours.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/auth/api-rate-limit";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

const REFERRAL_CLICK_LIMIT = {
    limit: 1,
    windowSeconds: 24 * 60 * 60,
    name: 'referral-click',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const code = typeof body.code === "string"
            ? body.code.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase()
            : null;

        if (!code || code.length === 0 || code.length > 50) {
            return NextResponse.json(
                { ok: false, error: "Invalid referral code" },
                { status: 400, headers: corsHeaders }
            );
        }

        // ISS-036: prefer Vercel-set headers (signed/trusted) over arbitrary
        // x-forwarded-for which clients can spoof. Fall back to xff only if
        // Vercel-specific headers are absent (e.g. local dev).
        const ip = req.headers.get('x-vercel-forwarded-for')
            || req.headers.get('cf-connecting-ip')
            || req.headers.get('x-real-ip')
            || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || 'unknown';
        const rateLimit = await checkRateLimit(
            `referral-click:${ip}:${code}`,
            REFERRAL_CLICK_LIMIT,
        );
        if (rateLimit.unavailable) {
            return NextResponse.json(
                { ok: false, error: 'Click tracking is temporarily unavailable' },
                { status: 503, headers: corsHeaders },
            );
        }
        if (!rateLimit.success) {
            // Already counted this click — return success but don't increment
            return NextResponse.json({ ok: true, deduplicated: true }, { headers: corsHeaders });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Increment clicks atomically via RPC
        await supabase.rpc("increment_referral_clicks", { ref_code: code });

        return NextResponse.json({ ok: true }, { headers: corsHeaders });
    } catch (error) {
        console.error('[referral/track] Error:', error);
        return NextResponse.json(
            { ok: false, error: "Internal error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
