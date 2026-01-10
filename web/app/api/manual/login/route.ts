/**
 * POST /api/manual/login
 * 
 * SECURITY HARDENED:
 * - Rate limiting: 5 attempts per 15 minutes per IP
 * - Input validation: Email + password schema validation
 * - No sensitive data in error messages
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  AUTH_RATE_LIMIT,
  checkRateLimitByIP,
  rateLimitResponse,
  addRateLimitHeaders
} from "@/lib/api-rate-limit";
import { loginRequestSchema, validateRequest } from "@/lib/validation";

export async function POST(req: NextRequest) {
  // SECURITY: Rate limit by IP to prevent brute force attacks
  const rateLimitResult = checkRateLimitByIP(req, AUTH_RATE_LIMIT);
  if (!rateLimitResult.success) {
    return rateLimitResponse(
      rateLimitResult,
      'Too many login attempts. Please try again later.'
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
  const validation = validateRequest(body, loginRequestSchema);
  if (!validation.success) {
    return NextResponse.json(
      { ok: false, error: validation.error },
      { status: 400 }
    );
  }

  const { email, password } = validation.data;

  // Authenticate with Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    // SECURITY: Generic error message to prevent user enumeration
    return NextResponse.json(
      { ok: false, error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  // Success - add rate limit headers for transparency
  const response = NextResponse.json({ ok: true });
  return addRateLimitHeaders(response, rateLimitResult);
}
