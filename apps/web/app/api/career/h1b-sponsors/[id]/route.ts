import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { FREE_H1B_SPONSOR_LIMIT } from "@/lib/career/h1b/constants";
import {
  isPremiumH1bProfile,
  isSponsorInFreeTier,
} from "@/lib/career/h1b/free-tier-access";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Cache-Control": "no-store",
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id: sponsorId } = await context.params;
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

    const { data: sponsor, error: sponsorError } = await admin
      .from("h1b_sponsors")
      .select("*")
      .eq("id", sponsorId)
      .maybeSingle();

    if (sponsorError) {
      return NextResponse.json({ error: sponsorError.message }, { status: 500 });
    }

    if (!sponsor) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!isPremium) {
      const allowed = await isSponsorInFreeTier(admin, sponsorId);
      if (!allowed) {
        return NextResponse.json(
          {
            error: "H-1B sponsor profile requires Pro",
            code: "h1b_limit_reached",
            freeLimit: FREE_H1B_SPONSOR_LIMIT,
          },
          { status: 402, headers: corsHeaders }
        );
      }
    }

    let filings: Record<string, unknown>[] = [];

    const { data: byId } = await admin
      .from("h1b_filings")
      .select("*")
      .eq("sponsor_id", sponsorId)
      .order("received_date", { ascending: false })
      .limit(500);

    if (byId && byId.length > 0) {
      filings = byId;
    } else if (sponsor.name) {
      const { data: byName } = await admin
        .from("h1b_filings")
        .select("*")
        .eq("employer_name", sponsor.name)
        .order("received_date", { ascending: false })
        .limit(500);

      if (byName && byName.length > 0) {
        filings = byName;
      } else {
        const { data: byNameLike } = await admin
          .from("h1b_filings")
          .select("*")
          .ilike("employer_name", sponsor.name)
          .order("received_date", { ascending: false })
          .limit(500);

        if (byNameLike) filings = byNameLike;
      }
    }

    return NextResponse.json(
      { sponsor, filings, isPremium },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("h1b-sponsors/[id] API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
