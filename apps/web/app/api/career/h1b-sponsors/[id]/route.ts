import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseFilingsClient } from "@/lib/supabase/filings";
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

// Keep the sponsor profile payload bounded to fields rendered by the profile
// and its analytics. Query predicates/order fields (sponsor_id, employer_name,
// received_date) are included explicitly; raw import-only columns are not.
const FILING_PROFILE_COLUMNS = [
  "id", "case_number", "status", "received_date", "decision_date",
  "original_cert_date", "visa_class", "job_title", "soc_code", "soc_title",
  "full_time_position", "begin_date", "end_date", "total_workers",
  "employer_name", "employer_address1", "employer_city", "employer_state",
  "employer_postal_code", "employer_country", "employer_phone",
  "employer_phone_ext", "employer_province", "employer_fein", "naics_code",
  "employer_poc_name", "employer_poc_job_title", "employer_poc_email",
  "employer_poc_phone", "employer_poc_phone_ext", "employer_poc_address1",
  "employer_poc_city", "agent_attorney_name", "agent_attorney_email",
  "agent_attorney_phone", "agent_attorney_phone_ext", "agent_attorney_address1",
  "agent_attorney_city", "agent_representing_employer", "lawfirm_name",
  "lawfirm_business_fein", "worksite_address1", "worksite_address2",
  "worksite_city", "worksite_county", "worksite_state", "worksite_postal_code",
  "worksite_workers", "total_worksite_locations", "trade_name_dba",
  "secondary_entity", "secondary_entity_business_name", "wage_rate_from",
  "wage_rate_to", "wage_unit", "prevailing_wage", "pw_unit", "pw_wage_level",
  "pw_source", "pw_source_year", "pw_other_source", "pw_other_year",
  "pw_tracking_number", "pw_survey_name", "pw_survey_publisher", "sponsor_id",
  "state_of_highest_court", "name_of_highest_state_court",
  "new_employment", "continued_employment", "change_previous_employment",
  "new_concurrent_employment", "change_employer", "amended_petition",
  "h_1b_dependent", "willful_violator", "support_h1b", "appendix_a_attached",
  "public_disclosure", "agree_to_lc_statement", "statutory_basis",
  "preparer_first_name", "preparer_middle_initial", "preparer_last_name",
  "preparer_business_name", "preparer_email",
].join(", ");

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
    const filingsAdmin = getSupabaseFilingsClient();

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

    const { data: byId } = await filingsAdmin
      .from("h1b_filings")
      .select(FILING_PROFILE_COLUMNS)
      .eq("sponsor_id", sponsorId)
      .order("received_date", { ascending: false })
      .limit(500);

    if (byId && byId.length > 0) {
      filings = byId as unknown as Record<string, unknown>[];
    } else if (sponsor.name) {
      const { data: byName } = await filingsAdmin
        .from("h1b_filings")
        .select(FILING_PROFILE_COLUMNS)
        .eq("employer_name", sponsor.name)
        .order("received_date", { ascending: false })
        .limit(500);

      if (byName && byName.length > 0) {
        filings = byName as unknown as Record<string, unknown>[];
      } else {
        const { data: byNameLike } = await filingsAdmin
          .from("h1b_filings")
          .select(FILING_PROFILE_COLUMNS)
          .ilike("employer_name", sponsor.name)
          .order("received_date", { ascending: false })
          .limit(500);

        if (byNameLike) filings = byNameLike as unknown as Record<string, unknown>[];
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
