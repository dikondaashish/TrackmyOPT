'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, ChevronRight, Copy, LoaderCircle, Mail, Search, Send, Sparkles } from 'lucide-react';
import { captureClientEvent } from '@/lib/posthog-client';
import { BrowserEmailRecovery } from './BrowserEmailRecovery';

type Application = { id: string; company_name: string; role_title: string };
type Company = { id: string; name: string; domain: string | null };
type Contact = {
  id: string; name: string; title: string; company: string; linkedinUrl: string;
  relevanceReason: string; evidence: Array<{ url: string; title: string; description: string }>;
  email: string | null; emailStatus: 'pending' | 'verified' | 'unverified' | 'not_found' | 'provider_error';
  emailSubject: string | null; emailBody: string | null; linkedinNote: string | null;
};
type Bundle = {
  id: string; companyName: string; companyDomain: string | null; targetRole: string;
  userIntent: string; status: string; discoveryStatus: string; emailLookupStatus: string;
  draftStatus: string; errorCode: string | null; stale: boolean;
};
type History = { id: string; companyName: string; companyDomain: string | null;
  targetRole: string; status: string; errorCode: string | null; createdAt: string;
  completedAt: string | null; contactCount: number };
type Api<T> = { ok: true; data: T } | { ok: false; error: string };

const fieldClass = 'w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-500 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-950';
const primaryClass = 'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500';
const subtleClass = 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800';
const activeStatuses = ['queued','discovering_contacts','validating_contacts','checking_emails','generating_outreach'];
const stages = [
  ['discovering_contacts', 'Finding relevant people'],
  ['validating_contacts', 'Checking current roles and LinkedIn profiles'],
  ['checking_emails', 'Checking available work emails'],
  ['generating_outreach', 'Writing personalized outreach'],
] as const;

function gmailUrl(email: string, subject: string, body: string) {
  return `https://mail.google.com/mail/?${new URLSearchParams({ view: 'cm', fs: '1', to: email, su: subject, body })}`;
}
function outlookUrl(email: string, subject: string, body: string) {
  return `https://outlook.office.com/mail/deeplink/compose?${new URLSearchParams({ to: email, subject, body })}`;
}
async function readApi<T>(response: Response): Promise<T> {
  const payload = await response.json() as Api<T>;
  if (!response.ok || !payload.ok) throw new Error(payload.ok ? 'Please try again.' : payload.error);
  return payload.data;
}
function stageIndex(status: string) { return stages.findIndex(([key]) => key === status); }
function errorText(code: string | null): string {
  switch (code) {
    case 'zero_contacts': return "We couldn't find a reliable current contact for this company yet. Try another role or company.";
    case 'gemini_unavailable':
    case 'discovery_unavailable': return "Contact search is temporarily unavailable. Your daily bundle wasn't used.";
    case 'email_provider_unavailable': return "Email verification is temporarily unavailable. Your daily bundle wasn't used.";
    case 'outreach_unavailable': return "Writing is temporarily unavailable. Your contacts are saved; retry writing when you're ready.";
    case 'processing_expired': return 'This search was interrupted. Resume it from the saved stage.';
    default: return 'This bundle could not be completed. Your daily bundle was not used.';
  }
}

export function NetworkingWorkspace({ applications, initialApplicationId, initialBundleId, applicationsUnavailable }: {
  applications: Application[]; initialApplicationId: string; initialBundleId: string; applicationsUnavailable: boolean;
}) {
  const selectedApplication = applications.find((a) => a.id === initialApplicationId);
  const [companyName, setCompanyName] = useState(selectedApplication?.company_name ?? '');
  const [companyDomain, setCompanyDomain] = useState('');
  const [role, setRole] = useState(selectedApplication?.role_title ?? '');
  const [intent, setIntent] = useState('');
  const [applicationId, setApplicationId] = useState(selectedApplication?.id ?? '');
  const [suggestions, setSuggestions] = useState<Company[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [bundleId, setBundleId] = useState(initialBundleId);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const requestKey = useRef<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const data = await readApi<{ remaining: number; history: History[] }>(await fetch('/api/career/networking/bundles', { cache: 'no-store' }));
      setRemaining(data.remaining); setHistory(data.history);
    } catch { /* The editor remains usable when history is unavailable. */ }
  }, []);
  const loadBundle = useCallback(async (id: string) => {
    const data = await readApi<{ bundle: Bundle; contacts: Contact[] }>(await fetch(`/api/career/networking/bundles/${id}`, { cache: 'no-store' }));
    setBundle(data.bundle); setContacts(data.contacts);
    if (!activeStatuses.includes(data.bundle.status) || data.bundle.stale) void loadHistory();
    return data.bundle;
  }, [loadHistory]);

  useEffect(() => { const timer = window.setTimeout(() => void loadHistory(), 0); return () => window.clearTimeout(timer); }, [loadHistory]);
  useEffect(() => {
    if (!bundleId) return;
    let cancelled = false;
    async function poll() {
      try {
        const next = await loadBundle(bundleId);
        if (!cancelled && activeStatuses.includes(next.status) && !next.stale) timer = window.setTimeout(poll, 1800);
      } catch { if (!cancelled) setError('Could not load this bundle. Please refresh.'); }
    }
    let timer: number | undefined;
    void poll();
    return () => { cancelled = true; if (timer) window.clearTimeout(timer); };
  }, [bundleId, loadBundle]);

  useEffect(() => {
    if (companyName.trim().length < 2 || !showSuggestions) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const data = await readApi<{ companies: Company[] }>(await fetch(`/api/career/networking/companies?q=${encodeURIComponent(companyName)}`, { signal: controller.signal }));
        setSuggestions(data.companies);
      } catch { if (!controller.signal.aborted) setSuggestions([]); }
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [companyName, showSuggestions]);

  function openBundle(id: string) {
    setError(''); setBundleId(id); setBundle(null); setContacts([]);
    const url = new URL(window.location.href); url.searchParams.set('bundle', id);
    window.history.replaceState(null, '', url);
  }
  function newBundle() {
    setBundleId(''); setBundle(null); setContacts([]); setError(''); requestKey.current = null;
    const url = new URL(window.location.href); url.searchParams.delete('bundle');
    window.history.replaceState(null, '', url);
  }
  function chooseApplication(id: string) {
    requestKey.current = null;
    setApplicationId(id);
    const found = applications.find((item) => item.id === id);
    if (found) { setCompanyName(found.company_name); setRole(found.role_title); setCompanyDomain(''); }
  }
  async function build(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !companyName.trim() || !role.trim()) return;
    setBusy(true); setError('');
    requestKey.current ??= crypto.randomUUID();
    try {
      const data = await readApi<{ bundleId: string }>(await fetch('/api/career/networking/bundles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: companyName.trim(), companyDomain: companyDomain.trim() || null,
          targetRole: role.trim(), userIntent: intent.trim(), idempotencyKey: requestKey.current }),
      }));
      requestKey.current = null;
      openBundle(data.bundleId); void loadHistory();
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Could not start outreach.'); }
    finally { setBusy(false); }
  }
  async function retry() {
    if (!bundle || busy) return;
    setBusy(true); setError('');
    try {
      await readApi(await fetch(`/api/career/networking/bundles/${bundle.id}`, { method: 'POST' }));
      setBundleId(''); window.setTimeout(() => setBundleId(bundle.id), 0);
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Could not retry outreach.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
      <div className="min-w-0 space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          {bundleId && bundle ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-blue-700 dark:text-blue-300">Outreach workspace</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white sm:text-2xl">{bundle.companyName}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{bundle.companyDomain || 'Company website not confirmed'} · {bundle.targetRole}</p>
                </div>
                <button type="button" onClick={newBundle} className={subtleClass}>New bundle</button>
              </div>
              <div className="ml-auto max-w-xl rounded-2xl rounded-tr-sm bg-blue-700 px-4 py-3 text-sm leading-6 text-white">
                Find relevant contacts at {bundle.companyName} for a {bundle.targetRole} role, check work emails, and prepare personal outreach.
                {bundle.userIntent && <p className="mt-2 text-blue-50">“{bundle.userIntent}”</p>}
              </div>
            </div>
          ) : (
            <form onSubmit={build} className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-blue-700 dark:text-blue-300">Start here</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white sm:text-2xl">Build an outreach bundle</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Choose a company and the role you want. We’ll research up to three relevant contacts.</p>
              </div>
              {applicationsUnavailable && <p role="alert" className="text-sm text-amber-800 dark:text-amber-200">Applications could not be loaded. Enter company and role manually.</p>}
              {applications.length > 0 && <div>
                <label htmlFor="network-application" className="mb-1.5 block text-sm font-medium text-slate-900 dark:text-white">Use a tracked application</label>
                <select id="network-application" value={applicationId} onChange={(event) => chooseApplication(event.target.value)} className={fieldClass}>
                  <option value="">Enter company manually</option>
                  {applications.map((item) => <option key={item.id} value={item.id}>{item.company_name} · {item.role_title}</option>)}
                </select>
              </div>}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <label htmlFor="network-company" className="mb-1.5 block text-sm font-medium text-slate-900 dark:text-white">Search company</label>
                  <div className="relative"><Search className="absolute left-3.5 top-3.5 size-4 text-slate-500" aria-hidden="true" />
                    <input id="network-company" required maxLength={120} autoComplete="off" value={companyName}
                      onChange={(event) => { requestKey.current = null; setCompanyName(event.target.value); setCompanyDomain(''); setApplicationId(''); setSuggestions([]); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)} onKeyDown={(event) => { if (event.key === 'Escape') setShowSuggestions(false); }}
                      placeholder="Microsoft" className={`${fieldClass} pl-10`} />
                  </div>
                  {showSuggestions && suggestions.length > 0 && <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900" role="listbox" aria-label="Company suggestions">
                    {suggestions.map((item) => <button type="button" role="option" aria-selected={false} key={item.id}
                      onClick={() => { requestKey.current = null; setCompanyName(item.name); setCompanyDomain(item.domain ?? ''); setShowSuggestions(false); }}
                      className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 text-left text-sm text-slate-900 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-white dark:hover:bg-slate-800">
                      <span className="truncate">{item.name}</span><span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{item.domain}</span>
                    </button>)}
                  </div>}
                </div>
                <div><label htmlFor="network-role" className="mb-1.5 block text-sm font-medium text-slate-900 dark:text-white">Target role</label>
                  <input id="network-role" required maxLength={120} value={role} onChange={(event) => { requestKey.current = null; setRole(event.target.value); setApplicationId(''); }} placeholder="Software Engineer" className={fieldClass} /></div>
              </div>
              <div><label htmlFor="network-domain" className="mb-1.5 block text-sm font-medium text-slate-900 dark:text-white">Company website <span className="font-normal text-slate-500">(helps distinguish similar names)</span></label>
                <input id="network-domain" maxLength={253} value={companyDomain} onChange={(event) => { requestKey.current = null; setCompanyDomain(event.target.value); }} placeholder="microsoft.com" className={fieldClass} />
                {companyDomain && <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">Selected: {companyName} · {companyDomain}</p>}
              </div>
              <div><label htmlFor="network-intent" className="mb-1.5 block text-sm font-medium text-slate-900 dark:text-white">What do you want to say? <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea id="network-intent" rows={3} maxLength={1000} value={intent} onChange={(event) => { requestKey.current = null; setIntent(event.target.value); }} placeholder="I’m exploring backend engineering roles and would value a short conversation about the team." className={`${fieldClass} resize-y`} /></div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-300">Search starts only when you build. {remaining === null ? 'Loading allowance…' : `${remaining} of 15 bundles remaining today`}</p>
                <button type="submit" disabled={busy || remaining === 0} className={primaryClass}>{busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Sparkles className="size-4" aria-hidden="true" />}Build outreach bundle</button>
              </div>
            </form>
          )}
        </div>

        {bundleId && !bundle && !error && <div role="status" className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"><LoaderCircle className="mr-2 inline size-4 animate-spin" aria-hidden="true" />Loading saved outreach…</div>}
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
        {bundle && <section className="space-y-5" aria-label="Outreach results">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center gap-2"><Sparkles className="size-5 text-blue-700 dark:text-blue-300" aria-hidden="true" /><h3 className="font-semibold text-slate-950 dark:text-white">Research progress</h3></div>
            <ol className="mt-4 space-y-3" aria-live="polite" aria-atomic="true">
              {stages.map(([key, label], index) => {
                const current = stageIndex(bundle.status);
                const emailIncomplete = key === 'checking_emails' && bundle.emailLookupStatus === 'partial';
                const done = !emailIncomplete && (['completed','partial'].includes(bundle.status) || current > index ||
                  (bundle.status === 'failed' && (key === 'discovering_contacts' ? bundle.discoveryStatus === 'completed' : key === 'checking_emails' ? ['completed','partial'].includes(bundle.emailLookupStatus) : key === 'generating_outreach' ? bundle.draftStatus === 'completed' : bundle.discoveryStatus === 'completed')));
                return <li key={key} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                  <span className={`flex size-6 shrink-0 items-center justify-center rounded-full ${done ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : current === index ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {done ? <Check className="size-3.5" aria-hidden="true" /> : current === index ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> : index + 1}</span>
                  <span>{label}{emailIncomplete ? ' — incomplete' : current === index ? '…' : done ? ' — done' : ''}</span>
                </li>;
              })}
            </ol>
            {['completed','partial'].includes(bundle.status) && <p role="status" className="mt-4 border-t border-slate-200 pt-4 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">{bundle.status === 'partial' ? 'Your LinkedIn outreach is ready.' : 'Your outreach bundle is ready.'} {contacts.length} relevant {contacts.length === 1 ? 'contact' : 'contacts'} found.</p>}
            {(bundle.status === 'failed' || bundle.stale) && <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800"><p role="alert" className="text-sm text-amber-800 dark:text-amber-200">{errorText(bundle.errorCode)}</p><button type="button" disabled={busy || bundle.errorCode === 'zero_contacts'} onClick={retry} className={subtleClass}>Retry from saved stage</button></div>}
            {bundle.status === 'partial' && <p className="mt-3 text-sm text-amber-800 dark:text-amber-200">Some saved email checks failed. Use “Retry email lookup” on the affected contacts. LinkedIn outreach is ready.</p>}
          </div>
          {contacts.map((contact, index) => <ContactCard key={`${contact.id}-${contact.emailSubject}-${contact.emailBody}-${contact.linkedinNote}`} contact={contact} index={index} bundleId={bundle.id} targetRole={bundle.targetRole} userIntent={bundle.userIntent} />)}
        </section>}
      </div>
      <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-6" aria-label="Recent outreach">
        <div className="flex items-center justify-between gap-2"><h2 className="font-semibold text-slate-950 dark:text-white">Recent outreach</h2><span className="text-xs text-slate-500 dark:text-slate-400">Saved</span></div>
        {history.length === 0 ? <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">Your completed bundles will appear here. Reopening them is free.</p> :
          <ul className="mt-4 space-y-1">{history.map((item) => <li key={item.id}><button type="button" onClick={() => openBundle(item.id)} className={`flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800 ${item.id === bundleId ? 'bg-blue-50 dark:bg-blue-950/40' : ''}`}>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-950 dark:text-white">{item.companyName}</span><span className="block truncate text-xs text-slate-600 dark:text-slate-300">{item.targetRole} · {item.contactCount} {item.contactCount === 1 ? 'contact' : 'contacts'}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{item.createdAt.slice(0, 10)}</span></span><ChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          </button></li>)}</ul>}
      </aside>
    </div>
  );
}

function ContactCard({ contact, index, bundleId, targetRole, userIntent }: { contact: Contact; index: number; bundleId: string; targetRole: string; userIntent: string }) {
  const [subject, setSubject] = useState(contact.emailSubject ?? '');
  const [body, setBody] = useState(contact.emailBody ?? '');
  const [note, setNote] = useState(contact.linkedinNote ?? '');
  const [savedDraft, setSavedDraft] = useState({ subject: contact.emailSubject ?? '', body: contact.emailBody ?? '', note: contact.linkedinNote ?? '' });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const verified = contact.emailStatus === 'verified' && Boolean(contact.email);
  const canCompose = verified && Boolean(subject.trim()) && Boolean(body.trim());
  const dirty = subject !== savedDraft.subject || body !== savedDraft.body || note !== savedDraft.note;
  async function save() {
    if (!dirty || saving) return;
    setSaving(true); setNotice('');
    try {
      await readApi(await fetch(`/api/career/networking/bundles/${bundleId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: contact.id, subject: verified ? subject : null, emailBody: verified ? body : null, linkedinNote: note }) }));
      setSavedDraft({ subject, body, note });
      setNotice('Saved');
    } catch { setNotice('Could not save changes. Try again.'); }
    finally { setSaving(false); }
  }
  async function copy(value: string, kind: string) {
    try { await navigator.clipboard.writeText(value); setNotice('Copied');
      captureClientEvent(kind, { contact_position: index + 1 });
    } catch { setNotice('Could not copy. Select the text and copy manually.'); }
  }
  return <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6" aria-labelledby={`contact-${contact.id}`}>
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
      <div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-blue-700 dark:text-blue-300">Relevant contact {index + 1}</p><h3 id={`contact-${contact.id}`} className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">{contact.name}</h3><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{contact.title} · {contact.company}</p></div>
      <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={() => captureClientEvent('networking_linkedin_opened', { contact_position: index + 1 })} className={subtleClass}>LinkedIn <ArrowUpRight className="size-4" aria-hidden="true" /></a>
    </div>
    <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-200"><span className="font-semibold text-slate-950 dark:text-white">Why relevant:</span> {contact.relevanceReason}</p>
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40"><p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Work email</p>
      {verified ? <div className="mt-1 flex flex-wrap items-center gap-2"><Mail className="size-4 text-emerald-700 dark:text-emerald-300" aria-hidden="true" /><a href={`mailto:${contact.email}`} className="min-w-0 break-all text-sm font-medium text-blue-700 hover:underline dark:text-blue-300">{contact.email}</a><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">Verified by ApplyBolt</span><button type="button" onClick={() => copy(contact.email!, 'networking_email_copied')} className={subtleClass}><Copy className="size-3.5" aria-hidden="true" />Copy email</button></div> :
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{contact.emailStatus === 'provider_error' ? 'The saved bundle could not check this email.' : contact.emailStatus === 'pending' ? 'Checking email…' : 'No verified work email found. You can still reach out on LinkedIn.'}</p>}
      {contact.emailStatus === 'provider_error' && <BrowserEmailRecovery contact={contact} targetRole={targetRole} userIntent={userIntent} />}
    </div>
    {verified && contact.emailSubject && <div className="mt-5 space-y-3"><h4 className="font-semibold text-slate-950 dark:text-white">Email draft</h4><div><label htmlFor={`subject-${contact.id}`} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Subject</label><input id={`subject-${contact.id}`} maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} className={fieldClass} /></div><div><label htmlFor={`body-${contact.id}`} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Message</label><textarea id={`body-${contact.id}`} rows={6} maxLength={2000} value={body} onChange={(event) => setBody(event.target.value)} className={`${fieldClass} resize-y`} /></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => copy(`${subject}\n\n${body}`, 'networking_email_copied')} className={subtleClass}><Copy className="size-4" aria-hidden="true" />Copy draft</button>{canCompose && <><a href={gmailUrl(contact.email!, subject, body)} target="_blank" rel="noopener noreferrer" onClick={() => captureClientEvent('networking_gmail_opened', { contact_position: index + 1 })} className={subtleClass}>Open Gmail <ArrowUpRight className="size-4" aria-hidden="true" /></a><a href={outlookUrl(contact.email!, subject, body)} target="_blank" rel="noopener noreferrer" onClick={() => captureClientEvent('networking_outlook_opened', { contact_position: index + 1 })} className={subtleClass}>Open Outlook <ArrowUpRight className="size-4" aria-hidden="true" /></a></>}</div></div>}
    {contact.linkedinNote && <div className="mt-5 space-y-3"><h4 className="font-semibold text-slate-950 dark:text-white">LinkedIn connection note</h4><label htmlFor={`note-${contact.id}`} className="sr-only">LinkedIn note for {contact.name}</label><textarea id={`note-${contact.id}`} rows={3} maxLength={300} value={note} onChange={(event) => setNote(event.target.value)} className={`${fieldClass} resize-y`} /><div className="flex flex-wrap gap-2"><button type="button" onClick={() => copy(note, 'networking_linkedin_note_copied')} className={subtleClass}><Copy className="size-4" aria-hidden="true" />Copy note</button><a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={() => captureClientEvent('networking_linkedin_opened', { contact_position: index + 1 })} className={subtleClass}>Open LinkedIn <ArrowUpRight className="size-4" aria-hidden="true" /></a></div></div>}
    {dirty && <button type="button" disabled={saving || !note.trim()} onClick={save} className={`${primaryClass} mt-4`}>{saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}Save changes</button>}
    {notice && <p role="status" className="mt-3 text-sm text-slate-700 dark:text-slate-200">{notice}</p>}
    {contact.evidence?.length > 0 && <details className="mt-5 border-t border-slate-200 pt-4 text-sm dark:border-slate-800"><summary className="cursor-pointer font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-200">Sources for this contact</summary><ul className="mt-2 space-y-1">{contact.evidence.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-blue-700 hover:underline dark:text-blue-300">{source.title || 'Source'} <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" /></a></li>)}</ul></details>}
  </article>;
}
