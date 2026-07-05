import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import {
  fetchUniversityPartnerByCode,
  normalizePartnerGroupKey,
  toPartnerGroupProperties,
  UNIVERSITY_PARTNER_GROUP_TYPE,
} from "@/lib/posthog/university-partner-groups";
import {
  associateUserWithServerGroup,
  identifyServerGroup,
} from "@/lib/posthog-server";

export const dynamic = "force-dynamic";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const referralCode =
      typeof body.referralCode === "string"
        ? normalizePartnerGroupKey(body.referralCode)
        : null;

    if (!referralCode) {
      return NextResponse.json({ ok: false, error: "Invalid referral code" }, { status: 400 });
    }

    const { data: profile } = await serviceSupabase
      .from("profiles")
      .select("referred_by")
      .eq("user_id", user.id)
      .maybeSingle();

    const profileCode = profile?.referred_by
      ? normalizePartnerGroupKey(profile.referred_by)
      : null;

    if (!profileCode || profileCode !== referralCode) {
      return NextResponse.json({ ok: false, error: "Referral mismatch" }, { status: 403 });
    }

    const partner = await fetchUniversityPartnerByCode(serviceSupabase, referralCode);
    const groupProps = partner
      ? toPartnerGroupProperties(partner)
      : { partner_name: referralCode };

    await identifyServerGroup(UNIVERSITY_PARTNER_GROUP_TYPE, referralCode, groupProps);
    await associateUserWithServerGroup(user.id, UNIVERSITY_PARTNER_GROUP_TYPE, referralCode);

    return NextResponse.json({ ok: true, code: referralCode });
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
