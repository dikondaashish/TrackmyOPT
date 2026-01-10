/**
 * POST /api/manual/signup
 * 
 * SECURITY HARDENED:
 * - Rate limiting: 5 attempts per 15 minutes per IP
 * - Input validation: Email + password schema validation
 * - Date format validation
 * - No sensitive data in error messages
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mmddyyyyToISO } from "@/lib/date";
import {
  AUTH_RATE_LIMIT,
  checkRateLimitByIP,
  rateLimitResponse,
  addRateLimitHeaders
} from "@/lib/api-rate-limit";
import { z } from "zod";
import { validateRequest, emailSchema, passwordSchema, sanitizeString } from "@/lib/validation";

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
});

export async function POST(req: NextRequest) {
  // SECURITY: Rate limit by IP to prevent abuse
  const rateLimitResult = checkRateLimitByIP(req, AUTH_RATE_LIMIT);
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
  } catch {
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
    programEnd, dsoReco, optEadEnd, optStart, stemStart, isStem
  } = validation.data;

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

  // Create profile
  await supabase.from("profiles").upsert({
    user_id: uid,
    timezone: "America/New_York",
    is_stem_eligible: !!isStem,
  });

  // Convert and validate dates
  const toISO = (x: string | undefined) => x ? mmddyyyyToISO(x) : null;
  const payload = {
    user_id: uid,
    program_end_date: toISO(programEnd),
    dso_recommendation_date: toISO(dsoReco),
    opt_ead_end_date: toISO(optEadEnd),
    opt_start_date: toISO(optStart),
    stem_start_date: toISO(stemStart) || null,
  };

  if (!payload.program_end_date || !payload.opt_ead_end_date || !payload.opt_start_date) {
    return NextResponse.json(
      { ok: false, error: 'Invalid date format. Please use MM/DD/YYYY.' },
      { status: 400 }
    );
  }

  // Create OPT status
  await supabase.from("opt_status").upsert(payload);

  // Success - add rate limit headers
  const response = NextResponse.json({ ok: true });
  return addRateLimitHeaders(response, rateLimitResult);
}
