import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getUserId } from "@/lib/auth/getUserId";
import { corsHeadersWebAndExtension } from "@/lib/api/cors-policy";
import {
  PrivateApplicationAnswersSchema,
  decryptPrivateApplicationAnswers,
  encryptPrivateApplicationAnswers,
} from "@/lib/private-application-answers";
import { secureLog } from "@/lib/secure-logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_CHARACTERS = 12_000;
const SaveSchema = PrivateApplicationAnswersSchema.extend({
  consent: z.literal(true),
}).strict();

function responseHeaders(req: NextRequest): Record<string, string> {
  return {
    ...corsHeadersWebAndExtension(req),
    "Cache-Control": "no-store, private, max-age=0",
    Pragma: "no-cache",
    "X-Content-Type-Options": "nosniff",
  };
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: responseHeaders(req),
  });
}

export async function GET(req: NextRequest) {
  const headers = responseHeaders(req);
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401, headers }
      );
    }

    const { data, error } = await adminClient()
      .from("private_application_answers")
      .select("encrypted_payload, consented_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      return NextResponse.json(
        { error: "Could not load private answers" },
        { status: 500, headers }
      );
    }
    if (!data) {
      return NextResponse.json({ ok: true, data: null }, { headers });
    }

    const answers = decryptPrivateApplicationAnswers(data.encrypted_payload);
    return NextResponse.json(
      {
        ok: true,
        data: answers,
        consentedAt: data.consented_at ?? null,
        updatedAt: data.updated_at ?? null,
      },
      { headers }
    );
  } catch {
    secureLog.error("Private application answers GET failed");
    return NextResponse.json(
      { error: "Private answers are temporarily unavailable" },
      { status: 503, headers }
    );
  }
}

export async function PUT(req: NextRequest) {
  const headers = responseHeaders(req);
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401, headers }
      );
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_CHARACTERS) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413, headers }
      );
    }

    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers }
      );
    }

    const parsed = SaveSchema.safeParse(value);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Confirm consent and check the private application answers you entered",
          code: "validation",
        },
        { status: 400, headers }
      );
    }

    const { consent: _consent, ...answers } = parsed.data;
    const now = new Date().toISOString();
    const encryptedPayload = encryptPrivateApplicationAnswers(answers);
    const { error } = await adminClient()
      .from("private_application_answers")
      .upsert(
        {
          user_id: userId,
          encrypted_payload: encryptedPayload,
          payload_version: 1,
          consented_at: now,
          updated_at: now,
        },
        { onConflict: "user_id" }
      );
    if (error) {
      return NextResponse.json(
        { error: "Could not save private answers" },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      { ok: true, data: answers, consentedAt: now },
      { headers }
    );
  } catch {
    secureLog.error("Private application answers PUT failed");
    return NextResponse.json(
      { error: "Private answers are temporarily unavailable" },
      { status: 503, headers }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const headers = responseHeaders(req);
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401, headers }
      );
    }

    const { error } = await adminClient()
      .from("private_application_answers")
      .delete()
      .eq("user_id", userId);
    if (error) {
      return NextResponse.json(
        { error: "Could not delete private answers" },
        { status: 500, headers }
      );
    }

    return NextResponse.json({ ok: true }, { headers });
  } catch {
    secureLog.error("Private application answers DELETE failed");
    return NextResponse.json(
      { error: "Private answers are temporarily unavailable" },
      { status: 503, headers }
    );
  }
}
