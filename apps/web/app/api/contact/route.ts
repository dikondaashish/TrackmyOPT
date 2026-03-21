import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";
import { sendContactReceivedEmail } from "@/lib/notifications/transactional-emails";

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(320),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(50_000),
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
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

  let userId: string | null = sessionUser?.id ?? null;
  let firstName: string | null = null;

  if (userId) {
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("first_name")
      .eq("user_id", userId)
      .maybeSingle();
    firstName = prof?.first_name ?? null;
  }

  if (!userId) {
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("user_id, first_name")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (prof?.user_id) {
      userId = prof.user_id;
      firstName = prof.first_name;
    }
  }

  if (!userId) {
    console.warn("contact: no user_id for auto-reply (profile or session), skipping email_queue");
    return NextResponse.json({ ok: true });
  }

  const displayFirst = firstName || name.split(/\s+/)[0] || null;
  const toEmail =
    sessionUser?.email?.trim().toLowerCase() && sessionUser.id === userId
      ? sessionUser.email.trim().toLowerCase()
      : normalizedEmail;

  const result = await sendContactReceivedEmail({
    supabase: supabaseAdmin,
    userId,
    toEmail,
    firstName: displayFirst,
  });

  if (!result.ok && "error" in result) {
    console.error("contact auto-reply:", result.error, { subject: subject.slice(0, 80), messageLen: message.length });
  }

  return NextResponse.json({ ok: true });
}
