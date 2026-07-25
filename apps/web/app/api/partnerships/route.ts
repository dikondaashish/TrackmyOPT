import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import rateLimit from "@/lib/auth/rate-limit";
import { sendInternalPartnershipNotification } from "@/lib/notifications/transactional-emails";

const partnershipLimiter = rateLimit({ interval: 3_600_000, name: 'partnerships' });

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(320),
  university: z.string().min(1).max(200),
  role: z.string().min(1).max(100),
  message: z.string().max(50_000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { isRateLimited, unavailable } = await partnershipLimiter.check(req, 5, `partnerships:${ip}`);
    if (isRateLimited) {
      return NextResponse.json(
        { success: false, error: "Too many submissions. Please try again later." },
        { status: unavailable ? 503 : 429 }
      );
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { name, email, university, role, message } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: row, error: insertError } = await supabaseAdmin
      .from("partnership_inquiries")
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        university: university.trim(),
        role: role.trim(),
        message: message ? message.trim() : "",
        status: "open",
      })
      .select("id, created_at")
      .single();

    if (insertError || !row?.id) {
      console.error("partnership_inquiries insert:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "We couldn’t save your inquiry. Please try again later.",
        },
        { status: 500 }
      );
    }

    const createdAtIso =
      row.created_at && typeof row.created_at === "string"
        ? row.created_at
        : new Date().toISOString();

    // Send the alert to the TrackMyOPT team
    try {
      await sendInternalPartnershipNotification({
        submissionId: row.id,
        name: name.trim(),
        email: normalizedEmail,
        university: university.trim(),
        role: role.trim(),
        message: message ? message.trim() : "",
        createdAtIso,
      });
    } catch (e) {
      console.error("partnership internal notify:", e);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("POST /api/partnerships:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
