import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { captureServerEvent } from '@/lib/posthog-server';
import { configuredDiscoveryProvider, discoverContacts, lookupWorkEmail, roleFamily, writeOutreach } from './providers';
import { normalizeKey, parseCachedDiscovery, type ValidContact } from './validation';

type BundleRow = {
  id: string; user_id: string; company_name: string; company_domain: string | null;
  target_role: string; user_intent: string; status: string; discovery_status: string;
  email_lookup_status: string; draft_status: string; usage_state: string;
  processing_token: string | null; metrics: Record<string, number | boolean>;
};
type ContactRow = {
  id: string; bundle_id: string; name: string; title: string; company: string;
  linkedin_url: string; relevance_reason: string; email: string | null;
  email_status: string; linkedin_note: string | null;
};

const admin = () => getSupabaseAdminClient();

async function updateBundle(id: string, patch: Record<string, unknown>) {
  const { error } = await admin().from('networking_bundles').update({
    ...patch, lease_expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
  }).eq('id', id);
  if (error) throw error;
}

async function loadContacts(bundleId: string): Promise<ContactRow[]> {
  const { data, error } = await admin().from('networking_contacts').select('*')
    .eq('bundle_id', bundleId).order('position');
  if (error) throw error;
  return (data ?? []) as ContactRow[];
}

async function personalContext(userId: string) {
  const db = admin();
  const [application, resume] = await Promise.all([
    db.from('application_profile').select('first_name,last_name,years_experience').eq('user_id', userId).maybeSingle(),
    db.from('resumes').select('structured_data').eq('user_id', userId)
      .not('structured_data', 'is', null).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const data = resume.data?.structured_data;
  const snapshot = data && typeof data === 'object' && !Array.isArray(data)
    ? (data as Record<string, unknown>).jobMatchProfile : null;
  const skillsProfile = snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot)
    ? (snapshot as Record<string, unknown>).profile : null;
  const skills = skillsProfile && typeof skillsProfile === 'object' && !Array.isArray(skillsProfile)
    ? skillsProfile as Record<string, unknown> : {};
  const strings = (value: unknown) => Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').slice(0, 25).map((item) => item.slice(0, 80)) : [];
  const education = Array.isArray(skills.education) ? skills.education.slice(0, 3).flatMap((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
    const entry = value as Record<string, unknown>;
    return typeof entry.level === 'string' && typeof entry.field === 'string'
      ? [`${entry.level} in ${entry.field.slice(0, 160)}`] : [];
  }) : [];
  return {
    name: [application.data?.first_name, application.data?.last_name].filter(Boolean).join(' ').slice(0, 120),
    yearsExperience: application.data?.years_experience ??
      (typeof skills.yearsExperience === 'number' ? skills.yearsExperience : null),
    skills: strings(skills.skills), roleTitles: strings(skills.roleTitles), education,
  };
}

async function track(userId: string, event: string, props: Record<string, string | number | boolean | null> = {}) {
  await captureServerEvent(userId, event, props);
}

export async function processNetworkingBundle(bundleId: string, userId: string, token: string): Promise<void> {
  const db = admin();
  const initial = await db.from('networking_bundles').select('*').eq('id', bundleId).eq('user_id', userId).maybeSingle();
  if (initial.error || !initial.data) return;
  let bundle = initial.data as BundleRow;
  if (bundle.processing_token !== token || bundle.usage_state !== 'reserved') return;
  const metrics = { ...(bundle.metrics || {}) };
  try {
    if (bundle.discovery_status !== 'completed') {
      await updateBundle(bundleId, { status: 'discovering_contacts' });
      const provider = configuredDiscoveryProvider();
      metrics.discovery_openai = provider === 'openai';
      const companyKey = normalizeKey(bundle.company_domain || bundle.company_name);
      const roleKey = `${provider}:${roleFamily(bundle.target_role)}`;
      const cached = await db.from('networking_discovery_cache').select('discovery_json,company_domain')
        .eq('company_key', companyKey).eq('role_key', roleKey)
        .gt('expires_at', new Date().toISOString()).maybeSingle();
      let result: { companyName: string; companyDomain: string | null; contacts: ValidContact[] };
      const cachedResult = parseCachedDiscovery(cached.data?.discovery_json,
        bundle.company_name, bundle.company_domain);
      if (cachedResult) {
        result = cachedResult;
        metrics.cache_hit = true;
        await track(userId, 'networking_cache_hit');
      } else {
        metrics.cache_hit = false;
        await track(userId, 'networking_cache_miss');
        const requestKey = provider === 'openai' ? 'openai_requests' : 'gemini_requests';
        metrics[requestKey] = Number(metrics[requestKey] || 0) + 1;
        await updateBundle(bundleId, { metrics });
        const discovered = await discoverContacts({
          companyName: bundle.company_name, companyDomain: bundle.company_domain,
          targetRole: bundle.target_role, userId,
        }, provider);
        result = { companyName: discovered.companyName, companyDomain: discovered.companyDomain,
          contacts: discovered.contacts };
        Object.assign(metrics, discovered.metrics);
      }
      await updateBundle(bundleId, { status: 'validating_contacts', metrics });
      if (!result.contacts.length) {
        await updateBundle(bundleId, { discovery_status: 'zero_contacts' });
        await db.rpc('finish_networking_bundle', {
          p_user_id: userId, p_bundle_id: bundleId, p_token: token,
          p_success: false, p_partial: false, p_error: 'zero_contacts',
        });
        await track(userId, 'networking_bundle_failed', { reason: 'zero_contacts' });
        return;
      }
      // A previous attempt can have stopped partway through saving contacts.
      // Discovery is not marked complete until all rows are present.
      const cleared = await db.from('networking_contacts').delete().eq('bundle_id', bundleId);
      if (cleared.error) throw cleared.error;
      for (const [index, contact] of result.contacts.entries()) {
        const { error } = await db.from('networking_contacts').insert({
          bundle_id: bundleId, position: index + 1, name: contact.name,
          title: contact.title, company: contact.company, linkedin_url: contact.linkedinUrl,
          relevance_reason: contact.relevanceReason, evidence_json: contact.evidence,
        });
        if (error) throw error;
      }
      metrics.contacts_found = result.contacts.length;
      await updateBundle(bundleId, {
        company_name: result.companyName, company_domain: result.companyDomain,
        discovery_status: 'completed', status: 'checking_emails', metrics,
      });
      await track(userId, 'networking_contact_found', { count: result.contacts.length });
      // Cache only the validated public research, never personal context or email results.
      if (!cachedResult && result.companyDomain) {
        const keys = [...new Set([normalizeKey(bundle.company_name), normalizeKey(result.companyDomain)])];
        await db.from('networking_discovery_cache').upsert(keys.map((key) => ({
          company_key: key, role_key: roleKey, company_domain: result.companyDomain!,
          discovery_json: result, expires_at: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
        })));
      }
      bundle = { ...bundle, company_name: result.companyName,
        company_domain: result.companyDomain, discovery_status: 'completed' };
    }

    if (bundle.email_lookup_status === 'pending') {
      await updateBundle(bundleId, { status: 'checking_emails' });
      const contacts = await loadContacts(bundleId);
      await Promise.all(contacts.filter((c) => c.email_status === 'pending').map(async (contact) => {
        const result = await lookupWorkEmail(contact.linkedin_url, bundle.company_name);
        const { error } = await db.from('networking_contacts').update({
          email: result.email, email_status: result.status,
        }).eq('id', contact.id).eq('bundle_id', bundleId);
        if (error) throw error;
        if (result.status === 'verified') await track(userId, 'networking_email_verified');
        if (result.status === 'not_found') await track(userId, 'networking_email_not_found');
      }));
      const checked = await loadContacts(bundleId);
      metrics.applybolt_verified = checked.filter((c) => c.email_status === 'verified').length;
      metrics.applybolt_errors = checked.filter((c) => c.email_status === 'provider_error').length;
      await updateBundle(bundleId, {
        email_lookup_status: metrics.applybolt_errors ? 'partial' : 'completed',
        status: 'generating_outreach', metrics,
      });
    }

    if (bundle.draft_status !== 'completed') {
      await updateBundle(bundleId, { status: 'generating_outreach' });
      const contacts = await loadContacts(bundleId);
      const context = await personalContext(userId);
      metrics.gemini_requests = Number(metrics.gemini_requests || 0) + 1;
      await updateBundle(bundleId, { metrics });
      const result = await writeOutreach({
        userId, companyName: bundle.company_name, targetRole: bundle.target_role,
        userIntent: bundle.user_intent, profile: context,
        contacts: contacts.map((c) => ({
          id: c.id, name: c.name, title: c.title, relevanceReason: c.relevance_reason,
          linkedinUrl: c.linkedin_url, email: c.email_status === 'verified' ? c.email : null,
          emailStatus: c.email_status,
        })),
      });
      for (const draft of result.drafts) {
        const contact = contacts.find((c) => c.id === draft.contactId);
        if (!contact) continue;
        const { error } = await db.from('networking_contacts').update({
          email_subject: contact.email_status === 'verified' ? draft.subject : null,
          email_body: contact.email_status === 'verified' ? draft.emailBody : null,
          linkedin_note: draft.linkedinNote,
        }).eq('id', draft.contactId).eq('bundle_id', bundleId);
        if (error) throw error;
      }
      metrics.input_tokens = Number(metrics.input_tokens || 0) + result.metrics.input_tokens;
      metrics.output_tokens = Number(metrics.output_tokens || 0) + result.metrics.output_tokens;
      await updateBundle(bundleId, { draft_status: 'completed', metrics });
    }
    const contacts = await loadContacts(bundleId);
    const partial = contacts.some((c) => c.email_status === 'provider_error');
    const finish = await db.rpc('finish_networking_bundle', {
      p_user_id: userId, p_bundle_id: bundleId, p_token: token,
      p_success: true, p_partial: partial, p_error: partial ? 'email_provider_partial' : null,
    });
    if (finish.error || finish.data !== true) throw new Error('quota_commit_failed');
    await track(userId, partial ? 'networking_bundle_partial' : 'networking_bundle_completed', {
      contact_count: contacts.length, cache_hit: Boolean(metrics.cache_hit),
      google_search_queries: Number(metrics.google_search_queries || 0),
      input_tokens: Number(metrics.input_tokens || 0),
      output_tokens: Number(metrics.output_tokens || 0),
      applybolt_verified: Number(metrics.applybolt_verified || 0),
    });
  } catch (error) {
    const last = await db.from('networking_bundles').select('discovery_status,email_lookup_status')
      .eq('id', bundleId).maybeSingle();
    const reason = last.data?.discovery_status === 'pending' ? 'discovery_unavailable'
      : last.data?.email_lookup_status === 'pending' ? 'email_provider_unavailable'
      : 'outreach_unavailable';
    console.error('[networking-bundle]', reason, error instanceof Error ? error.message : String(error));
    await updateBundle(bundleId, {
      discovery_status: reason === 'discovery_unavailable' ? 'failed' : last.data?.discovery_status,
      draft_status: reason === 'outreach_unavailable' ? 'failed' : 'pending',
      metrics,
    }).catch(() => undefined);
    await db.rpc('finish_networking_bundle', {
      p_user_id: userId, p_bundle_id: bundleId, p_token: token,
      p_success: false, p_partial: false, p_error: reason,
    });
    await track(userId, 'networking_bundle_failed', { reason });
  }
}
