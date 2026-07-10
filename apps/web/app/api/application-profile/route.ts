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

const ApplicationProfileSchema = z.object({
  phone: z.preprocess(EMPTY_TO_NULL, z.string().trim().max(40).nullable()).optional(),
  city: z.preprocess(EMPTY_TO_NULL, z.string().trim().max(120).nullable()).optional(),
  state: z.preprocess(EMPTY_TO_NULL, z.string().trim().max(120).nullable()).optional(),
  years_experience: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(0).max(80).nullable(),
  ).optional(),
  linkedin_url: z.preprocess(EMPTY_TO_NULL, z.string().trim().url().max(500).nullable()).optional(),
  portfolio_url: z.preprocess(EMPTY_TO_NULL, z.string().trim().url().max(500).nullable()).optional(),
});

const SELECT_COLUMNS = 'phone, city, state, years_experience, linkedin_url, portfolio_url';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const { data, error } = await supabase
    .from('application_profile')
    .select(SELECT_COLUMNS)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return apiFail('Failed to load application profile', { status: 500 });

  return apiOk(
    data ?? { phone: null, city: null, state: null, years_experience: null, linkedin_url: null, portfolio_url: null },
  );
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiFail('Invalid JSON body');
  }

  const parsed = ApplicationProfileSchema.safeParse(body);
  if (!parsed.success) {
    return apiFail('Invalid application profile', { code: 'validation', details: parsed.error.flatten() });
  }

  const { error } = await supabase
    .from('application_profile')
    .upsert({ user_id: user.id, ...parsed.data }, { onConflict: 'user_id' });

  if (error) return apiFail('Failed to save application profile', { status: 500 });

  const { data } = await supabase
    .from('application_profile')
    .select(SELECT_COLUMNS)
    .eq('user_id', user.id)
    .maybeSingle();

  return apiOk(data ?? parsed.data);
}
