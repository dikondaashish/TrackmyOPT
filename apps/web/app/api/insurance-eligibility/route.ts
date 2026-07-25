/**
 * Insurance Eligibility API — saves and retrieves eligibility check data.
 * GET requires authenticated session (own records only).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import rateLimit from "@/lib/auth/rate-limit";

const eligibilityLimiter = rateLimit({ interval: 3_600_000, name: 'insurance-eligibility' });

async function getSessionUserId(): Promise<string | null> {
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
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            /* read-only context */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            /* read-only context */
          }
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const { isRateLimited, unavailable } = await eligibilityLimiter.check(
      request,
      20,
      `insurance-eligibility:${ip}`
    );
    if (isRateLimited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: unavailable ? 503 : 429 }
      );
    }

    const body = await request.json();
    const {
      state,
      monthly_income,
      visa_type,
      date_of_birth,
      gender,
      is_pregnant,
      has_employer_insurance,
    } = body;

    if (!state || !visa_type) {
      return NextResponse.json(
        { error: "State and visa type are required" },
        { status: 400 }
      );
    }

    // Derive user_id ONLY from the verified session. Anonymous submissions
    // (lead-gen) are allowed and stored with user_id = null. A client can never
    // attribute a check to another user by supplying user_id in the body.
    const userId = await getSessionUserId();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("insurance_eligibility_checks")
      .insert({
        user_id: userId,
        state,
        monthly_income: monthly_income || 0,
        visa_type,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        is_pregnant: is_pregnant ?? false,
        has_employer_insurance: has_employer_insurance ?? false,
        checked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving eligibility check:", error);
      return NextResponse.json(
        { error: "Failed to save eligibility check" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("user_id");

    if (requestedUserId && requestedUserId !== sessionUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("insurance_eligibility_checks")
      .select("*")
      .eq("user_id", sessionUserId)
      .order("checked_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching eligibility check:", error);
      return NextResponse.json(
        { error: "Failed to fetch eligibility check" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data?.[0] || null });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
