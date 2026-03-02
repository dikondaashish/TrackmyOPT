/**
 * GET /api/referral/stats?code=charvi
 * 
 * Returns referral stats for a given code.
 * Protected: only accessible with CRON_SECRET (admin) for now.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Internal-Secret",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    try {
        // Admin-only: check for internal secret
        const secret = req.headers.get("X-Internal-Secret");
        const code = req.nextUrl.searchParams.get("code");

        if (!secret || secret !== process.env.CRON_SECRET) {
            return NextResponse.json(
                { ok: false, error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        if (code) {
            // Get stats for a specific code
            const { data, error } = await supabase
                .from("referrals")
                .select("code, name, owner_email, clicks, signups, premium_conversions, is_active, created_at")
                .eq("code", code.toLowerCase())
                .single();

            if (error || !data) {
                return NextResponse.json(
                    { ok: false, error: "Referral code not found" },
                    { status: 404, headers: corsHeaders }
                );
            }

            return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
        }

        // Get all referral stats
        const { data, error } = await supabase
            .from("referrals")
            .select("code, name, owner_email, clicks, signups, premium_conversions, is_active, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json(
                { ok: false, error: "Failed to fetch stats" },
                { status: 500, headers: corsHeaders }
            );
        }

        return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    } catch {
        return NextResponse.json(
            { ok: false, error: "Internal error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
