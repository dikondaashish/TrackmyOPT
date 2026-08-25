import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import rateLimit from "@/lib/auth/rate-limit";
import { getDedicatedConsultationEligibility } from "@/lib/pricing/dedicated-consultation";
import { normalizeStatusCategory } from "@/lib/posthog/uscis-status-category";
import {
  sendDedicatedConsultationReceivedEmail,
  sendInternalDedicatedConsultationNotification,
} from "@/lib/notifications/transactional/internal";

export const dynamic = "force-dynamic";

const limiter = rateLimit({ interval: 86_400_000, name: "dedicated-consultation" });

const requestSchema = z.object({
  caseId: z.string().uuid().nullable().optional(),
  topic: z.enum([
    "rfe",
    "denial",
    "premium_processing_delay",
    "opt_stem",
    "employer_change",
    "other",
  ]),
  summary: z.string().trim().min(20).max(2000),
  availability: z.string().trim().max(500).optional(),
});

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

const safeRequestFields =
  "id, topic, status, case_status_id, scheduled_at, created_at, updated_at";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await getAdmin()
      .from("dedicated_consultation_requests")
      .select(safeRequestFields)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("consultation request lookup:", error);
      return NextResponse.json({ ok: false, error: "Could not load request" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, request: data ?? null });
  } catch (error) {
    console.error("GET /api/dedicated/consultation-request:", error);
    return NextResponse.json({ ok: false, error: "Could not load request" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const limited = await limiter.check(req, 3, `dedicated-consultation:${user.id}`);
    if (limited.isRateLimited) {
      return NextResponse.json(
        {
          ok: false,
          error: limited.unavailable
            ? "Request service is temporarily unavailable"
            : "Too many attempts. Please try again tomorrow.",
        },
        { status: limited.unavailable ? 503 : 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Add a topic and at least 20 characters describing what you need help with." },
        { status: 400 }
      );
    }

    const admin = getAdmin();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("premium_status, plan_tier, dedicated_started_at")
      .eq("user_id", user.id)
      .single();
    if (profileError || !profile) {
      return NextResponse.json({ ok: false, error: "Could not verify Dedicated eligibility" }, { status: 503 });
    }

    const isDedicated =
      profile.premium_status === true &&
      String(profile.plan_tier ?? "").toLowerCase() === "dedicated";
    const eligibility = getDedicatedConsultationEligibility(profile.dedicated_started_at);
    if (!isDedicated || !eligibility.eligible || !eligibility.eligibleAt) {
      return NextResponse.json(
        {
          ok: false,
          error: isDedicated
            ? `Consultation requests unlock after seven continuous days on Dedicated. ${eligibility.daysRemaining} day(s) remaining.`
            : "An active Dedicated membership is required.",
        },
        { status: 403 }
      );
    }

    const existing = await admin
      .from("dedicated_consultation_requests")
      .select(safeRequestFields)
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing.data) {
      return NextResponse.json(
        { ok: false, error: "Your account already has a consultation request.", request: existing.data },
        { status: 409 }
      );
    }

    let caseRow: { id: string; current_status: string | null } | null = null;
    if (parsed.data.caseId) {
      const ownedCase = await admin
        .from("case_status")
        .select("id, current_status")
        .eq("id", parsed.data.caseId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (ownedCase.error || !ownedCase.data) {
        return NextResponse.json({ ok: false, error: "Selected case was not found" }, { status: 404 });
      }
      caseRow = ownedCase.data;
    }

    const nowIso = new Date().toISOString();
    const { data: created, error: insertError } = await admin
      .from("dedicated_consultation_requests")
      .insert({
        user_id: user.id,
        case_status_id: caseRow?.id ?? null,
        topic: parsed.data.topic,
        summary: parsed.data.summary,
        availability: parsed.data.availability || null,
        status: "open",
        dedicated_started_at: profile.dedicated_started_at,
        eligible_at: eligibility.eligibleAt.toISOString(),
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select(safeRequestFields)
      .single();

    if (insertError || !created) {
      if (insertError?.code === "23505") {
        return NextResponse.json(
          { ok: false, error: "Your account already has a consultation request." },
          { status: 409 }
        );
      }
      console.error("consultation request insert:", insertError);
      return NextResponse.json({ ok: false, error: "Could not save request" }, { status: 500 });
    }

    const topicLabel = parsed.data.topic.replaceAll("_", " ");
    await Promise.allSettled([
      sendInternalDedicatedConsultationNotification({
        requestId: created.id,
        userId: user.id,
        email: user.email ?? "Email unavailable",
        topic: topicLabel,
        summary: parsed.data.summary,
        availability: parsed.data.availability || null,
        caseId: caseRow?.id ?? null,
        caseCategory: caseRow ? normalizeStatusCategory(caseRow.current_status) : null,
        createdAtIso: created.created_at ?? nowIso,
      }),
      ...(user.email
        ? [
            sendDedicatedConsultationReceivedEmail({
              supabase: admin,
              userId: user.id,
              toEmail: user.email,
              topic: topicLabel,
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ ok: true, request: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/dedicated/consultation-request:", error);
    return NextResponse.json({ ok: false, error: "Could not submit request" }, { status: 500 });
  }
}
