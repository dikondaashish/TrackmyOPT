/**
 * POST /api/manual/signup
 * 
 * SECURITY HARDENED:
 * - Rate limiting: 5 attempts per 15 minutes per IP
 * - Input validation: Email + password schema validation
 * - Date format validation
 * - No sensitive data in error messages
 */

import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mmddyyyyToISO } from "@/lib/date";
import {
  AUTH_RATE_LIMIT,
  checkRateLimitByIP,
  checkRateLimitByAccount,
  rateLimitResponse,
  addRateLimitHeaders
} from "@/lib/auth/api-rate-limit";
import { z } from "zod";
import { validateRequest, emailSchema, passwordSchema, sanitizeString } from "@/lib/validation";
import { sendFreeWelcomeEmail } from "@/lib/notifications/transactional/onboarding";

// SECURITY: Custom signup schema with all required fields
const signupRequestSchema = z.object({
  firstName: z.string().min(1).max(50).transform(sanitizeString),
  lastName: z.string().min(1).max(50).transform(sanitizeString),
  email: emailSchema,
  password: passwordSchema,
  programEnd: z.string().min(1, 'Program end date is required'),
  dsoReco: z.string().optional(),
  optEadEnd: z.string().min(1, 'OPT EAD end date is required'),
  optStart: z.string().min(1, 'OPT start date is required'),
  stemStart: z.string().optional(),
  isStem: z.boolean().optional().default(false),
  referralCode: z.string().max(50).optional(),
});

export async function POST(req: NextRequest) {
  // SECURITY: Rate limit by IP to prevent abuse
  let rateLimitResult = await checkRateLimitByIP(req, AUTH_RATE_LIMIT);
  if (!rateLimitResult.success) {
    return rateLimitResponse(
      rateLimitResult,
      'Too many signup attempts. Please try again later.'
    );
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch (error) {
    console.error('[manual/signup] Error parsing JSON:', error);
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // SECURITY: Validate input schema
  const validation = validateRequest(body, signupRequestSchema);
  if (!validation.success) {
    return NextResponse.json(
      { ok: false, error: validation.error },
      { status: 400 }
    );
  }

  const {
    firstName, lastName, email, password,
    programEnd, dsoReco, optEadEnd, optStart, stemStart, isStem, referralCode
  } = validation.data;

  rateLimitResult = await checkRateLimitByAccount(email, AUTH_RATE_LIMIT);
  if (!rateLimitResult.success) {
    return rateLimitResponse(
      rateLimitResult,
      'Too many signup attempts. Please try again later.'
    );
  }

  // Validate all required dates before creating a confirmed auth user.
  const toISO = (value: string | undefined) =>
    value ? mmddyyyyToISO(value) : null;
  const datePayload = {
    program_end_date: toISO(programEnd),
    dso_recommendation_date: toISO(dsoReco),
    opt_ead_end_date: toISO(optEadEnd),
    opt_start_date: toISO(optStart),
    stem_start_date: toISO(stemStart),
  };
  if (
    !datePayload.program_end_date ||
    !datePayload.opt_ead_end_date ||
    !datePayload.opt_start_date
  ) {
    return NextResponse.json(
      { ok: false, error: 'Invalid date format. Please use MM/DD/YYYY.' },
      { status: 400 }
    );
  }

  // Use service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Create user
  const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { firstName, lastName },
  });

  if (signUpError || !signUpData.user) {
    // SECURITY: Generic error message
    console.error('Signup error:', signUpError?.message);
    return NextResponse.json(
      { ok: false, error: 'Unable to create account. Please try again.' },
      { status: 400 }
    );
  }

  const uid = signUpData.user.id;
  const rollbackCreatedUser = async (reason: string) => {
    console.error(`[manual/signup] ${reason}; rolling back auth user`);
    const { error: rollbackError } =
      await supabase.auth.admin.deleteUser(uid);
    if (rollbackError) {
      console.error('[manual/signup] Failed to roll back auth user');
    }
    return NextResponse.json(
      { ok: false, error: 'Unable to create account. Please try again.' },
      { status: 500 }
    );
  };

  // Create profile (with referral attribution if present)
  const sanitizedRef = referralCode
    ? referralCode.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()
    : null;

  try {
    const { error: profileError } = await supabase.from("profiles").upsert({
      user_id: uid,
      timezone: "America/New_York",
      is_stem_eligible: !!isStem,
      ...(sanitizedRef ? { referred_by: sanitizedRef } : {}),
    });
    if (profileError) {
      return rollbackCreatedUser('Required profile write failed');
    }

    const { error: optStatusError } = await supabase
      .from("opt_status")
      .upsert({
        user_id: uid,
        ...datePayload,
      });
    if (optStatusError) {
      return rollbackCreatedUser('Required OPT status write failed');
    }
  } catch {
    return rollbackCreatedUser('Required signup write threw');
  }

  // Referral attribution is non-critical to account consistency.
  if (sanitizedRef) {
    const { error: referralError } = await supabase.rpc(
      'increment_referral_signups',
      { ref_code: sanitizedRef }
    );
    if (referralError) {
      console.error('[manual/signup] Referral attribution failed');
    }
  }

  after(async () => {
    try {
      await sendFreeWelcomeEmail({
        supabase,
        userId: uid,
        toEmail: email,
        firstName: firstName,
      });
    } catch (err) {
      console.error("sendFreeWelcomeEmail:", err);
    }
  });

  // Success - add rate limit headers
  const response = NextResponse.json({ ok: true });
  return addRateLimitHeaders(response, rateLimitResult);
}
