import { after, NextRequest } from 'next/server';
import { z } from 'zod';
import { apiFail, apiOk, apiUnauthorized } from '@/lib/api/response';
import { checkRateLimitByUser } from '@/lib/auth/api-rate-limit';
import { processNetworkingBundle } from '@/lib/career/networking/pipeline';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
const privateHeaders = { 'Cache-Control': 'private, no-store' };
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return apiUnauthorized('Sign in to view outreach', { headers: privateHeaders });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return apiFail('Invalid bundle', { headers: privateHeaders });
  const { data: bundle, error } = await db.from('networking_bundles').select('*')
    .eq('id', id).eq('user_id', user.id).maybeSingle();
  if (error || !bundle) return apiFail('Outreach bundle not found', { status: 404, headers: privateHeaders });
  const contacts = await db.from('networking_contacts').select('*').eq('bundle_id', id).order('position');
  if (contacts.error) return apiFail('Could not load contacts', { status: 503, headers: privateHeaders });
  return apiOk({
    bundle: {
      id: bundle.id, companyName: bundle.company_name, companyDomain: bundle.company_domain,
      targetRole: bundle.target_role, userIntent: bundle.user_intent, status: bundle.status,
      discoveryStatus: bundle.discovery_status, emailLookupStatus: bundle.email_lookup_status,
      draftStatus: bundle.draft_status, errorCode: bundle.error_code,
      createdAt: bundle.created_at, completedAt: bundle.completed_at,
      stale: bundle.usage_state === 'reserved' && new Date(bundle.lease_expires_at).getTime() < Date.now(),
    },
    contacts: (contacts.data ?? []).map((contact) => ({
      id: contact.id, name: contact.name, title: contact.title, company: contact.company,
      linkedinUrl: contact.linkedin_url, relevanceReason: contact.relevance_reason,
      evidence: contact.evidence_json, email: contact.email_status === 'verified' ? contact.email : null,
      emailStatus: contact.email_status, emailSubject: contact.email_subject,
      emailBody: contact.email_body, linkedinNote: contact.linkedin_note,
    })),
  }, { headers: privateHeaders });
}

export async function POST(_req: NextRequest, { params }: Ctx) {
  if (process.env.NETWORKING_BUNDLES_ENABLED === 'false') return apiFail('Outreach bundles are temporarily unavailable', { status: 503, headers: privateHeaders });
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return apiUnauthorized('Sign in to retry outreach', { headers: privateHeaders });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return apiFail('Invalid bundle', { headers: privateHeaders });
  const limit = await checkRateLimitByUser(user.id, { limit: 10, windowSeconds: 3600, name: 'networking-bundle-retry' });
  if (!limit.success) return apiFail('Please wait before retrying this bundle', {
    status: limit.unavailable ? 503 : 429, headers: privateHeaders,
  });
  const token = crypto.randomUUID();
  const result = await getSupabaseAdminClient().rpc('retry_networking_bundle', {
    p_user_id: user.id, p_bundle_id: id, p_token: token,
  });
  if (result.error) return apiFail('Could not retry outreach', { status: 503, headers: privateHeaders });
  if (result.data === 'not_found') return apiFail('Outreach bundle not found', { status: 404, headers: privateHeaders });
  if (result.data === 'daily_limit') return apiFail('You have used all 15 outreach bundles today.', { status: 429, code: 'daily_limit', headers: privateHeaders });
  if (result.data === 'started') after(() => processNetworkingBundle(id, user.id, token));
  return apiOk({ bundleId: id, state: result.data }, { headers: privateHeaders });
}

const EditSchema = z.object({ contactId: z.string().uuid(), subject: z.string().max(160).nullable(),
  emailBody: z.string().max(2000).nullable(), linkedinNote: z.string().min(1).max(300) }).strict();

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return apiUnauthorized('Sign in to edit outreach', { headers: privateHeaders });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return apiFail('Invalid bundle', { headers: privateHeaders });
  const raw = await req.text();
  if (raw.length > 5_000) return apiFail('Draft is too long', { status: 413, headers: privateHeaders });
  let parsed: ReturnType<typeof EditSchema.safeParse>;
  try { parsed = EditSchema.safeParse(JSON.parse(raw)); }
  catch { return apiFail('Invalid draft', { headers: privateHeaders }); }
  if (!parsed.success) return apiFail('Invalid draft', { headers: privateHeaders });
  const bundle = await db.from('networking_bundles').select('id,status').eq('id', id).eq('user_id', user.id).maybeSingle();
  if (!bundle.data || !['completed','partial'].includes(bundle.data.status)) return apiFail('Bundle is not ready', { status: 409, headers: privateHeaders });
  const contact = await db.from('networking_contacts').select('id,email_status').eq('id', parsed.data.contactId).eq('bundle_id', id).maybeSingle();
  if (!contact.data) return apiFail('Contact not found', { status: 404, headers: privateHeaders });
  const { error } = await getSupabaseAdminClient().from('networking_contacts').update({
    email_subject: contact.data.email_status === 'verified' ? parsed.data.subject : null,
    email_body: contact.data.email_status === 'verified' ? parsed.data.emailBody : null,
    linkedin_note: parsed.data.linkedinNote,
  }).eq('id', parsed.data.contactId).eq('bundle_id', id);
  if (error) return apiFail('Could not save draft', { status: 503, headers: privateHeaders });
  return apiOk({ saved: true }, { headers: privateHeaders });
}
