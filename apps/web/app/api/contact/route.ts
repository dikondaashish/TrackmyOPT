import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  sendContactReceivedEmail,
  sendInternalContactFormNotification,
} from "@/lib/notifications/transactional-emails";
import rateLimit from "@/lib/auth/rate-limit";

// 5 contact submissions per hour per IP
const contactLimiter = rateLimit({ interval: 3_600_000 });

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(320),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(50_000),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 submissions per hour per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { isRateLimited } = contactLimiter.check(req, 5, `contact:${ip}`);
    if (isRateLimited) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again later.' },
        { status: 429 }
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
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const cookieStore = await cookies();
    const supabaseUser = createServerClient(
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
              /* ignore */
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch {
              /* ignore */
            }
          },
        },
      }
    );

    const {
      data: { user: sessionUser },
    } = await supabaseUser.auth.getUser();

    const userId: string | null = sessionUser?.id ?? null;

    const { data: row, error: insertError } = await supabaseAdmin
      .from("contact_submissions")
      .insert({
        user_id: userId,
        name: name.trim(),
        email: normalizedEmail,
        subject: subject.trim(),
        message: message.trim(),
        status: "open",
      })
      .select("id, created_at")
      .single();

    if (insertError || !row?.id) {
      console.error("contact_submissions insert:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "We couldn’t save your message. Please try again later.",
        },
        { status: 500 }
      );
    }

    const createdAtIso =
      row.created_at && typeof row.created_at === "string"
        ? row.created_at
        : new Date().toISOString();

    try {
      const autoReply = await sendContactReceivedEmail({
        supabase: supabaseAdmin,
        userId,
        name: name.trim(),
        toEmail: normalizedEmail,
      });
      if (!autoReply.ok && "error" in autoReply) {
        console.error("contact auto-reply:", autoReply.error);
      }
    } catch (e) {
      console.error("contact auto-reply exception:", e);
    }

    try {
      await sendInternalContactFormNotification({
        submissionId: row.id,
        name: name.trim(),
        email: normalizedEmail,
        subject: subject.trim(),
        message: message.trim(),
        createdAtIso,
        userId,
      });
    } catch (e) {
      console.error("contact internal notify:", e);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("POST /api/contact:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
