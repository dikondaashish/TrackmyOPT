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

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// Simple in-memory rate limit for click tracking (per IP + code)
// Resets on deploy/restart — good enough for click dedup
const clickCache = new Map<string, number>();
const CLICK_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// Clean up old entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of clickCache.entries()) {
        if (now - timestamp > CLICK_COOLDOWN_MS) {
            clickCache.delete(key);
        }
    }
}, 10 * 60 * 1000);

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
        const cacheKey = `${ip}:${code}`;
        const lastClick = clickCache.get(cacheKey);

        if (lastClick && Date.now() - lastClick < CLICK_COOLDOWN_MS) {
            // Already counted this click — return success but don't increment
            return NextResponse.json({ ok: true, deduplicated: true }, { headers: corsHeaders });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Increment clicks atomically via RPC
        await supabase.rpc("increment_referral_clicks", { ref_code: code });

        // Record this click for dedup
        clickCache.set(cacheKey, Date.now());

        return NextResponse.json({ ok: true }, { headers: corsHeaders });
    } catch (error) {
        console.error('[referral/track] Error:', error);
        return NextResponse.json(
            { ok: false, error: "Internal error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
