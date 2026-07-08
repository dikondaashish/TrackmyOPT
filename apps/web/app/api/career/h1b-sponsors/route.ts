import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { FREE_H1B_SPONSOR_LIMIT } from "@/lib/career/h1b/constants";
import { isPremiumH1bProfile } from "@/lib/career/h1b/free-tier-access";

export const dynamic = "force-dynamic";

const SPONSOR_SELECT =
  "id, name, industry, size, location, website, approvals_2021, approvals_2022, approvals_2023, approvals_2024, approvals_2025, total_approvals, sponsorship_strength, careers_url, is_virtual_office, top_law_firm, entry_level_percent";

const corsHeaders = {
  "Cache-Control": "no-store",
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("premium_status, plan_tier")
      .eq("user_id", user.id)
      .maybeSingle();

    const isPremium = isPremiumH1bProfile(profile);
    const admin = getSupabaseAdminClient();

    const { count: totalCount, error: countError } = await admin
      .from("h1b_sponsors")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    let sponsorQuery = admin
      .from("h1b_sponsors")
      .select(SPONSOR_SELECT)
      .order("total_approvals", { ascending: false });

    if (!isPremium) {
      sponsorQuery = sponsorQuery.limit(FREE_H1B_SPONSOR_LIMIT);
    } else {
      sponsorQuery = sponsorQuery.range(0, 9999);
    }

    const { data: sponsors, error: sponsorError } = await sponsorQuery;

    if (sponsorError) {
      return NextResponse.json({ error: sponsorError.message }, { status: 500 });
    }

    const highSponsorCount = (sponsors || []).filter(
      (s) => s.sponsorship_strength === "High"
    ).length;

    return NextResponse.json(
      {
        sponsors: sponsors || [],
        totalCount: totalCount ?? 0,
        highSponsorCount,
        isPremium,
        freeLimit: FREE_H1B_SPONSOR_LIMIT,
        cappedAt: !isPremium && (totalCount ?? 0) > FREE_H1B_SPONSOR_LIMIT,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("h1b-sponsors API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
