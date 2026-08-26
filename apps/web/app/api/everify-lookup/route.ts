import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  addRateLimitHeaders,
  checkRateLimitByUser,
  rateLimitResponse,
} from "@/lib/auth/api-rate-limit";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 240;

const companySchema = z
  .string()
  .trim()
  .min(2, "Enter at least 2 characters")
  .max(120, "Company name is too long")
  .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), {
    message: "Company name contains invalid characters",
  });

const lookupRateLimit = {
  limit: 20,
  windowSeconds: 60 * 60,
  name: "everify-lookup",
};

const responseHeaders = {
  "Cache-Control": "private, no-store",
};

export async function GET(request: NextRequest) {
  const rawCompany = request.nextUrl.searchParams.get("company");
  const parsed = companySchema.safeParse(rawCompany);
  if (!parsed.success) {
    return NextResponse.json(
      {
        company: rawCompany?.trim() ?? "",
        found: false,
        error: "invalid_company",
        message: parsed.error.issues[0]?.message ?? "Company name is required",
      },
      { status: 400, headers: responseHeaders }
    );
  }

  const company = parsed.data.replace(/\s+/g, " ");
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        {
          company,
          found: false,
          error: "unauthorized",
          message: "Sign in to check an employer's E-Verify status.",
        },
        { status: 401, headers: responseHeaders }
      );
    }

    const limit = await checkRateLimitByUser(user.id, lookupRateLimit);
    if (!limit.success) {
      return rateLimitResponse(
        limit,
        "Too many employer lookups. Please try again later."
      );
    }

    // Keep browser automation out of the route's startup path. If its optional
    // runtime dependencies fail to load, this request still returns JSON below
    // instead of Next.js replacing the API response with an HTML 500 page.
    const { lookupEVerifyCompany } = await import("@/lib/everify/lookup-service");
    const result = await lookupEVerifyCompany(company);
    return addRateLimitHeaders(
      NextResponse.json(result, { headers: responseHeaders }),
      limit
    );
  } catch (error) {
    console.error("[everify-lookup] Live lookup unavailable", {
      company,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        company,
        found: false,
        error: "lookup_unavailable",
        message:
          "The public E-Verify lookup is temporarily unavailable. Please try again later.",
      },
      { status: 503, headers: responseHeaders }
    );
  }
}
