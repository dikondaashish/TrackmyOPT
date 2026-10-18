import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getUserId } from "@/lib/auth/get-user-id";
import { corsHeadersWebAndExtension } from "@/lib/api/cors-policy";
import {
  PRIVATE_APPLICATION_ANSWERS_PAYLOAD_VERSION,
  PrivateApplicationAnswersSchema,
  decryptPrivateApplicationAnswers,
  encryptPrivateApplicationAnswers,
} from "@/lib/private-application-answers";
import { secureLog } from "@/lib/secure-logger";
import * as Sentry from "@sentry/nextjs";
import rateLimit from "@/lib/auth/rate-limit";
import {
  applyVerifiedAuthorizationChange,
  parseVerifiedAuthorizationChange,
} from "../../../../extension/src/prefill/verified-authorization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_CHARACTERS = 12_000;
const SaveSchema = PrivateApplicationAnswersSchema.extend({
  consent: z.literal(true),
}).strict();
const verifiedLimiter = rateLimit({ interval: 60_000, name: "private-answers-verified" });
const MAX_PATCH_CHARACTERS = 2_000;


/**
 * Records why a database call failed, as its PostgreSQL/PostgREST code only
 * (for example 23514 for a CHECK violation), on the request's Sentry scope;
 * the HTTP 500 report then carries it. Never logs answers or messages.
 */
function noteStoreError(operation: string, error: { code?: string } | null | undefined) {
  const code = typeof error?.code === "string" ? error.code.slice(0, 16) : "unknown";
  Sentry.setTag("db_operation", operation);
  Sentry.setTag("db_error_code", code);
  secureLog.error(`Private application answers ${operation} failed (code ${code})`);
}

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

async function handleOPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: responseHeaders(req),
  });
}

async function handleGET(req: NextRequest) {
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
      noteStoreError("load", error);
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

async function handlePUT(req: NextRequest) {
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

    const clearVerified =
      !!value && typeof value === "object" &&
      (value as Record<string, unknown>).verifiedAuthorization === null;
    if (clearVerified) delete (value as Record<string, unknown>).verifiedAuthorization;
    const parsed = SaveSchema.safeParse(value);
    if (!parsed.success) {
      const consentInvalid = parsed.error.issues.some(
        (issue) => issue.path[0] === "consent"
      );
      const answerInvalid = parsed.error.issues.some(
        (issue) => issue.path[0] !== "consent"
      );
      const error = consentInvalid
        ? answerInvalid
          ? "Confirm the privacy notice and check the private application answers you entered"
          : "Confirm the privacy notice before saving"
        : "Check the private application answers you entered";
      return NextResponse.json(
        {
          error,
          code: "validation",
        },
        { status: 400, headers }
      );
    }

    const { consent: _consent, ...answers } = parsed.data;
    // Full-form saves from older clients do not carry verified authorization
    // answers; keep the stored ones unless this request explicitly clears them.
    if (clearVerified) {
      delete answers.verifiedAuthorization;
    } else if (answers.verifiedAuthorization === undefined) {
      const { data: existing, error: existingError } = await adminClient()
        .from("private_application_answers")
        .select("encrypted_payload")
        .eq("user_id", userId)
        .maybeSingle();
      if (existingError) {
        noteStoreError("read-before-save", existingError);
        return NextResponse.json(
          { error: "Could not save private answers" },
          { status: 500, headers }
        );
      }
      const stored = existing
        ? decryptPrivateApplicationAnswers(existing.encrypted_payload).verifiedAuthorization
        : undefined;
      if (stored) answers.verifiedAuthorization = stored;
    }
    const now = new Date().toISOString();
    const encryptedPayload = encryptPrivateApplicationAnswers(answers);
    const { error } = await adminClient()
      .from("private_application_answers")
      .upsert(
        {
          user_id: userId,
          encrypted_payload: encryptedPayload,
          payload_version: PRIVATE_APPLICATION_ANSWERS_PAYLOAD_VERSION,
          consented_at: now,
          updated_at: now,
        },
        { onConflict: "user_id" }
      );
    if (error) {
      noteStoreError("save", error);
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

/**
 * PATCH /api/private-application-answers
 * { consent: true, change: VerifiedAuthorizationChange }
 * Applies one applicant confirmation of a work-authorization or sponsorship
 * answer. The confirmation time is the server's; other answers are untouched.
 */
async function handlePATCH(req: NextRequest) {
  const headers = responseHeaders(req);
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401, headers });
    }
    const { isRateLimited, unavailable } = await verifiedLimiter.check(req, 30, `private-answers-verified:${userId}`);
    if (unavailable) return NextResponse.json({ error: "Temporarily unavailable" }, { status: 503, headers });
    if (isRateLimited) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers });
    const raw = await req.text();
    if (raw.length > MAX_PATCH_CHARACTERS) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413, headers });
    }
    let body: { consent?: unknown; change?: unknown };
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers });
    }
    if (body?.consent !== true) {
      return NextResponse.json({ error: "Confirm the privacy notice before saving", code: "validation" }, { status: 400, headers });
    }
    const change = parseVerifiedAuthorizationChange(body.change);
    if (!change) {
      return NextResponse.json({ error: "Check the answer you confirmed", code: "validation" }, { status: 400, headers });
    }

    const supabase = adminClient();
    // Compare-and-set on updated_at so concurrent confirmations never lose one.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data: row, error } = await supabase
        .from("private_application_answers")
        .select("encrypted_payload, updated_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        noteStoreError("read-before-confirm", error);
        return NextResponse.json({ error: "Could not save your answer" }, { status: 500, headers });
      }
      const current = row ? decryptPrivateApplicationAnswers(row.encrypted_payload) : {};
      const { legacyJobPortalLogins: _legacy, ...answers } = current as Record<string, unknown> & { legacyJobPortalLogins?: unknown };
      const next = applyVerifiedAuthorizationChange(
        (answers as { verifiedAuthorization?: never }).verifiedAuthorization,
        change,
        new Date().toISOString()
      );
      if ("error" in next) {
        return NextResponse.json(
          { error: next.error === "missing_answer" ? "Save each separate sponsorship answer first" : "That answer does not match this question", code: next.error },
          { status: 409, headers }
        );
      }
      const now = new Date().toISOString();
      const payload = encryptPrivateApplicationAnswers({ ...answers, verifiedAuthorization: next } as never);
      const result = row
        ? await supabase
            .from("private_application_answers")
            .update({ encrypted_payload: payload, payload_version: PRIVATE_APPLICATION_ANSWERS_PAYLOAD_VERSION, updated_at: now })
            .eq("user_id", userId)
            .eq("updated_at", row.updated_at)
            .select("user_id")
        : await supabase
            .from("private_application_answers")
            .insert({ user_id: userId, encrypted_payload: payload, payload_version: PRIVATE_APPLICATION_ANSWERS_PAYLOAD_VERSION, consented_at: now, updated_at: now })
            .select("user_id");
      if (result.error?.code === "23505") continue;
      if (result.error) {
        noteStoreError("confirm", result.error);
        return NextResponse.json({ error: "Could not save your answer" }, { status: 500, headers });
      }
      if (row && (!result.data || result.data.length === 0)) continue;
      return NextResponse.json({ ok: true, verifiedAuthorization: next }, { headers });
    }
    return NextResponse.json({ error: "Please try again" }, { status: 409, headers });
  } catch {
    secureLog.error("Private application answers PATCH failed");
    return NextResponse.json({ error: "Private answers are temporarily unavailable" }, { status: 503, headers });
  }
}

async function handleDELETE(req: NextRequest) {
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
      noteStoreError("delete", error);
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

export const OPTIONS = withSentryApiErrors(handleOPTIONS, '/api/private-application-answers', 'OPTIONS');
export const GET = withSentryApiErrors(handleGET, '/api/private-application-answers', 'GET');
export const PUT = withSentryApiErrors(handlePUT, '/api/private-application-answers', 'PUT');
export const PATCH = withSentryApiErrors(handlePATCH, '/api/private-application-answers', 'PATCH');
export const DELETE = withSentryApiErrors(handleDELETE, '/api/private-application-answers', 'DELETE');
