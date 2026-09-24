import { NextRequest } from 'next/server';
import { apiFail, apiOk, apiUnauthorized } from '@/lib/api/response';
import { checkRateLimitByUser } from '@/lib/auth/api-rate-limit';
import { normalizeDomain } from '@/lib/career/networking/validation';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return apiUnauthorized('Sign in to search companies');
  const query = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (query.length < 2 || query.length > 80) return apiOk({ companies: [] });
  const limit = await checkRateLimitByUser(user.id, { limit: 120, windowSeconds: 3_600, name: 'networking-company-search' });
  if (!limit.success) return apiFail('Company search is temporarily unavailable', { status: limit.unavailable ? 503 : 429 });
  const safe = query.replace(/[%_,()]/g, '');
  if (safe.length < 2) return apiOk({ companies: [] });
  const results = await getSupabaseAdminClient().from('h1b_sponsors')
    .select('id,name,website').ilike('name', `${safe}%`).order('total_approvals', { ascending: false }).limit(8);
  if (results.error) return apiFail('Company search is unavailable', { status: 503 });
  return apiOk({ companies: (results.data ?? []).map((row) => ({
    id: row.id, name: row.name, domain: normalizeDomain(row.website),
  })) });
}
