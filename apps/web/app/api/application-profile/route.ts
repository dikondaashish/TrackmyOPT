/**
 * Application profile — user-provided data for job-application autofill.
 *
 * GET  /api/application-profile   -> the caller's row (or nulls if none yet)
 * PUT  /api/application-profile   -> upsert the caller's row
 *
 * Scoped to the authenticated user via getUser() (token revalidated server-side)
 * and RLS. NEVER accepts work-authorization / visa / EEO / demographic data —
 * the table has no such columns and this route only reads the fields below.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { apiOk, apiFail, apiUnauthorized } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

const EMPTY_TO_NULL = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v);
const PRIVATE_RESPONSE_HEADERS = {
  'Cache-Control': 'no-store, private, max-age=0',
  Pragma: 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};

const ApplicationProfileSchema = z.object({
  first_name: z.preprocess(EMPTY_TO_NULL, z.string().trim().max(120).nullable()).optional(),
  last_name: z.preprocess(EMPTY_TO_NULL, z.string().trim().max(120).nullable()).optional(),
  application_email: z.preprocess(
    EMPTY_TO_NULL,
    z.string().trim().email().max(320).nullable(),
  ).optional(),
  phone: z.preprocess(EMPTY_TO_NULL, z.string().trim().max(40).nullable()).optional(),
  country: z.preprocess(EMPTY_TO_NULL, z.string().trim().max(120).nullable()).optional(),
  street_address: z.preprocess(EMPTY_TO_NULL, z.string().trim().max(300).nullable()).optional(),
  city: z.preprocess(EMPTY_TO_NULL, z.string().trim().max(120).nullable()).optional(),
  state: z.preprocess(EMPTY_TO_NULL, z.string().trim().max(120).nullable()).optional(),
  zip_code: z.preprocess(EMPTY_TO_NULL, z.string().trim().max(30).nullable()).optional(),
  county_district: z.preprocess(EMPTY_TO_NULL, z.string().trim().max(120).nullable()).optional(),
  years_experience: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(0).max(80).nullable(),
  ).optional(),
  linkedin_url: z.preprocess(EMPTY_TO_NULL, z.string().trim().url().max(500).nullable()).optional(),
  github_url: z.preprocess(EMPTY_TO_NULL, z.string().trim().url().max(500).nullable()).optional(),
  portfolio_url: z.preprocess(EMPTY_TO_NULL, z.string().trim().url().max(500).nullable()).optional(),
});

const SELECT_COLUMNS =
  'first_name, last_name, application_email, phone, country, street_address, city, state, zip_code, county_district, years_experience, linkedin_url, github_url, portfolio_url';

const EMPTY_PROFILE = {
  first_name: null,
  last_name: null,
  application_email: null,
  phone: null,
  country: null,
  street_address: null,
  city: null,
  state: null,
  zip_code: null,
  county_district: null,
  years_experience: null,
  linkedin_url: null,
  github_url: null,
  portfolio_url: null,
};

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return apiUnauthorized('Unauthorized', {
      headers: PRIVATE_RESPONSE_HEADERS,
    });
  }

  const { data, error } = await supabase
    .from('application_profile')
    .select(SELECT_COLUMNS)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return apiFail('Failed to load application profile', {
      status: 500,
      headers: PRIVATE_RESPONSE_HEADERS,
    });
  }

  return apiOk(
    data ?? EMPTY_PROFILE,
    { headers: PRIVATE_RESPONSE_HEADERS },
  );
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return apiUnauthorized('Unauthorized', {
      headers: PRIVATE_RESPONSE_HEADERS,
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiFail('Invalid JSON body', {
      headers: PRIVATE_RESPONSE_HEADERS,
    });
  }

  const parsed = ApplicationProfileSchema.safeParse(body);
  if (!parsed.success) {
    return apiFail('Invalid application profile', {
      code: 'validation',
      details: parsed.error.flatten(),
      headers: PRIVATE_RESPONSE_HEADERS,
    });
  }

  const { error } = await supabase
    .from('application_profile')
    .upsert({ user_id: user.id, ...parsed.data }, { onConflict: 'user_id' });

  if (error) {
    return apiFail('Failed to save application profile', {
      status: 500,
      headers: PRIVATE_RESPONSE_HEADERS,
    });
  }

  const { data } = await supabase
    .from('application_profile')
    .select(SELECT_COLUMNS)
    .eq('user_id', user.id)
    .maybeSingle();

  return apiOk(data ?? parsed.data, { headers: PRIVATE_RESPONSE_HEADERS });
}
