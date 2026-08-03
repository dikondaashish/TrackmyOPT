/**
 * POST /api/referral/signup
 * 
 * Records a successful referral signup:
 * 1. Sets `referred_by` on the user's profile
 * 2. Increments the referral's `signups` counter
 * 
 * Called after OTP verification (successful signup).
 * Requires authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserId } from "@/lib/auth/get-user-id";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json(
                { ok: false, error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

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

        // Check if this user already has a referred_by (prevent double-counting)
        const { data: profile } = await supabase
            .from("profiles")
            .select("referred_by")
            .eq("user_id", userId)
            .single();

        if (profile?.referred_by) {
            // Already attributed — don't double-count
            return NextResponse.json({ ok: true, alreadyReferred: true }, { headers: corsHeaders });
        }

        // Verify the referral code exists and is active
        const { data: referral } = await supabase
            .from("referrals")
            .select("id, code")
            .eq("code", code)
            .eq("is_active", true)
            .single();

        if (!referral) {
            // Invalid code — silently ignore (don't error out the signup)
            return NextResponse.json({ ok: true, codeInvalid: true }, { headers: corsHeaders });
        }

        // Set referred_by on the user's profile
        await supabase
            .from("profiles")
            .update({ referred_by: code })
            .eq("user_id", userId);

        // Increment signups counter atomically
        await supabase.rpc("increment_referral_signups", { ref_code: code });

        return NextResponse.json({ ok: true }, { headers: corsHeaders });
    } catch (error) {
        console.error('[referral/signup] Error:', error);
        return NextResponse.json(
            { ok: false, error: "Internal error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
