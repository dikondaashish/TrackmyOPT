import { after, NextRequest } from 'next/server';
import { apiFail, apiOk, apiUnauthorized } from '@/lib/api/response';
import { checkRateLimitByUser } from '@/lib/auth/api-rate-limit';
import { processNetworkingBundle } from '@/lib/career/networking/pipeline';
import { BundleInputSchema, normalizeDomain } from '@/lib/career/networking/validation';
import { captureServerEvent } from '@/lib/posthog-server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
const privateHeaders = { 'Cache-Control': 'private, no-store' };

export async function GET() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return apiUnauthorized('Sign in to view outreach', { headers: privateHeaders });
  const today = new Date().toISOString().slice(0, 10);
  const [history, usage] = await Promise.all([
    db.from('networking_bundles').select('id,company_name,company_domain,target_role,status,error_code,created_at,completed_at,networking_contacts(id)')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
    db.from('networking_bundles').select('usage_state,lease_expires_at')
      .eq('user_id', user.id).eq('usage_date', today).in('usage_state', ['reserved','committed']),
  ]);
  if (history.error || usage.error) return apiFail('Could not load saved outreach', { status: 503, headers: privateHeaders });
  const used = (usage.data ?? []).filter((row) => row.usage_state === 'committed').length;
  const reserved = (usage.data ?? []).filter((row) => row.usage_state === 'reserved' && new Date(row.lease_expires_at).getTime() > Date.now()).length;
  return apiOk({
    remaining: Math.max(0, 15 - used - reserved), used, reserved,
    history: (history.data ?? []).map((row) => ({
      id: row.id, companyName: row.company_name, companyDomain: row.company_domain,
      targetRole: row.target_role, status: row.status, errorCode: row.error_code,
      createdAt: row.created_at, completedAt: row.completed_at,
      contactCount: row.networking_contacts?.length ?? 0,
    })),
  }, { headers: privateHeaders });
}

export async function POST(req: NextRequest) {
  if (process.env.NETWORKING_BUNDLES_ENABLED === 'false') return apiFail('Outreach bundles are temporarily unavailable', { status: 503, headers: privateHeaders });
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return apiUnauthorized('Sign in to build outreach', { headers: privateHeaders });
  const raw = await req.text();
  if (raw.length > 6_000) return apiFail('Request is too large', { status: 413, headers: privateHeaders });
  let parsed: ReturnType<typeof BundleInputSchema.safeParse>;
  try { parsed = BundleInputSchema.safeParse(JSON.parse(raw)); }
  catch { return apiFail('Enter a company and target role', { headers: privateHeaders }); }
  if (!parsed.success) return apiFail('Enter a valid company and target role', { headers: privateHeaders });
  const input = parsed.data;
  const domain = input.companyDomain ? normalizeDomain(input.companyDomain) : null;
  if (input.companyDomain && !domain) return apiFail('Enter a valid company website', { headers: privateHeaders });
  const limit = await checkRateLimitByUser(user.id, { limit: 20, windowSeconds: 3600, name: 'networking-bundle-start' });
  if (!limit.success) return apiFail('Please wait before starting another search', {
    status: limit.unavailable ? 503 : 429, headers: privateHeaders,
  });
  const token = crypto.randomUUID();
  const admin = getSupabaseAdminClient();
  const reservation = await admin.rpc('reserve_networking_bundle', {
    p_user_id: user.id, p_key: input.idempotencyKey, p_company: input.companyName,
    p_domain: domain, p_role: input.targetRole, p_intent: input.userIntent, p_token: token,
  });
  if (reservation.error) return apiFail('Could not start outreach. Please try again.', { status: 503, headers: privateHeaders });
  const state = reservation.data?.[0];
  if (!state?.allowed) {
    if (state?.denial === 'daily_limit') {
      void captureServerEvent(user.id, 'networking_daily_limit_reached');
      return apiFail('You have used all 15 outreach bundles today. Come back tomorrow.', { status: 429, code: 'daily_limit', headers: privateHeaders });
    }
    return apiFail('That search already ended. Start a new search to try again.', { status: 409, headers: privateHeaders });
  }
  const bundleId = state.bundle_id as string;
  const { data: bundle } = await admin.from('networking_bundles').select('processing_token,status')
    .eq('id', bundleId).maybeSingle();
  if (bundle?.processing_token === token && bundle?.status === 'queued') {
    after(() => processNetworkingBundle(bundleId, user.id, token));
    void captureServerEvent(user.id, 'networking_bundle_started');
  }
  return apiOk({ bundleId }, { headers: privateHeaders });
}
