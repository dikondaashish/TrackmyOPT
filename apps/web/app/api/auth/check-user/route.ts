import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimitByIP,
  rateLimitResponse,
} from "@/lib/auth/api-rate-limit";

/** Targeted email lookup via profiles — never lists all auth users. */
export async function POST(req: NextRequest) {
  const rateLimitResult = checkRateLimitByIP(req, {
    limit: 10,
    windowSeconds: 60,
    name: "check-user",
  });
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult, "Too many requests");
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { ok: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Invalid email" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", normalized)
      .maybeSingle();

    if (error) {
      console.error("Error checking user:", error);
      return NextResponse.json(
        { ok: false, error: "Failed to check user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      exists: !!data?.user_id,
    });
  } catch (error) {
    console.error("Check user error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to check user" },
      { status: 500 }
    );
  }
}
