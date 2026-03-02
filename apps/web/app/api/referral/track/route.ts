/**
 * POST /api/referral/track
 * 
 * Increments the click counter for a referral code.
 * No auth required — called when someone visits a referral link.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
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

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Increment clicks atomically via RPC
        await supabase.rpc("increment_referral_clicks", { ref_code: code });

        return NextResponse.json({ ok: true }, { headers: corsHeaders });
    } catch {
        return NextResponse.json(
            { ok: false, error: "Internal error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
