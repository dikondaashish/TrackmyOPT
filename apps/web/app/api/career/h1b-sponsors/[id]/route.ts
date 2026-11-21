import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { FREE_H1B_SPONSOR_LIMIT } from "@/lib/career/h1b/constants";
import {
  listOracleFilings,
  reportOracleFilingsFailure,
  type FilingRecord,
} from "@/lib/career/h1b/filings-store";
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

async function handleGET(_req: NextRequest, context: RouteContext) {
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

    let filings: FilingRecord[];
    try {
      filings = await listOracleFilings(sponsorId, sponsor.name);
    } catch (error) {
      reportOracleFilingsFailure("profile");
      throw error;
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

async function handleOPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export const GET = withSentryApiErrors(handleGET, '/api/career/h1b-sponsors/[id]', 'GET');
export const OPTIONS = withSentryApiErrors(handleOPTIONS, '/api/career/h1b-sponsors/[id]', 'OPTIONS');
