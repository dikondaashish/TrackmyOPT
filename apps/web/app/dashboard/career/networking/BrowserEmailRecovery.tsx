'use client';

import { useState } from 'react';
import { requestEmailLookup, requestNetworkingDraft } from '@/lib/career/networking/browser-lookup';
import { parseWorkEmailResult, type EmailResult } from '@/lib/career/networking/email-result';

const buttonClass = 'inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

// The browser receives the email provider's response directly, as in the manual tool.
// Keep this recovery local: the API must not persist client claims as verified.
export function BrowserEmailRecovery({ contact, targetRole, userIntent }: {
  contact: { id: string; linkedinUrl: string; company: string; name: string; title: string };
  targetRole: string;
  userIntent: string;
}) {
  const [result, setResult] = useState<EmailResult | null>(null);
  const [busy, setBusy] = useState<'lookup' | 'draft' | null>(null);
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);

  async function lookup() {
    if (busy) return;
    setBusy('lookup'); setNotice('');
    try {
      const found = await requestEmailLookup(contact.linkedinUrl);
      setResult(parseWorkEmailResult(found.found ? {
        found: true, email: found.email, company: found.company,
        validation: found.verified ? 'valid' : 'unknown',
      } : found, contact.company));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Email lookup failed. Please try again.');
    } finally { setBusy(null); }
  }

  async function generateDraft() {
    if (busy || result?.status !== 'verified') return;
    setBusy('draft'); setNotice('');
    try {
      const next = await requestNetworkingDraft({
        companyName: contact.company, roleTitle: targetRole, contactName: contact.name,
        contactTitle: /not publicly confirmed/i.test(contact.title) ? null : contact.title,
        messageIntent: userIntent.trim() || `I am interested in a ${targetRole} role and would appreciate a short conversation.`,
        includeEmail: true,
      });
      if (!next.subject || !next.emailBody) throw new Error('The email draft was incomplete. Please try again.');
      setDraft({ subject: next.subject, body: next.emailBody });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not draft the email. Please try again.');
    } finally { setBusy(null); }
  }

  async function copy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
      setNotice('Copied');
    } catch { setNotice('Could not copy. Select the text and copy it manually.'); }
  }

  const email = result?.status === 'verified' ? result.email : null;
  const canCompose = Boolean(email && draft?.subject.trim() && draft.body.trim());
  return <div className="mt-3 space-y-3" aria-label={`Email recovery for ${contact.name}`}>
    {!result && <p className="text-sm text-slate-600 dark:text-slate-300">Try the direct lookup used by “Use a LinkedIn profile” for this contact.</p>}
    {!email && <button type="button" disabled={Boolean(busy)} onClick={lookup} className={buttonClass}>{busy === 'lookup' ? 'Checking email…' : 'Retry email lookup'}</button>}
    {result && !email && <p role="status" className="text-sm text-slate-700 dark:text-slate-200">{result.status === 'not_found' ? 'No work email was found for this profile.' : result.status === 'provider_error' ? 'The email lookup returned an unexpected response. Please try again.' : 'We could not verify a work email at this company.'}</p>}
    {email && <>
      <p role="status" className="break-all text-sm text-slate-800 dark:text-slate-100"><a href={`mailto:${email}`} className="font-medium text-blue-700 underline dark:text-blue-300">{email}</a> · Work email verified for this visit</p>
      <p className="text-xs text-slate-600 dark:text-slate-300">This email and its draft are available for this visit. They are not saved to the bundle; recheck the email when you reopen it.</p>
      {!draft && <button type="button" onClick={generateDraft} disabled={Boolean(busy)} className={buttonClass}>{busy === 'draft' ? 'Writing email…' : 'Draft email with AI'}</button>}
    </>}
    {draft && <div className="space-y-3">
      <div><label htmlFor={`recovery-subject-${contact.id}`} className="mb-1 block text-sm font-medium">Subject</label><input id={`recovery-subject-${contact.id}`} value={draft.subject} maxLength={160} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} className={fieldClass} /></div>
      <div><label htmlFor={`recovery-body-${contact.id}`} className="mb-1 block text-sm font-medium">Message</label><textarea id={`recovery-body-${contact.id}`} value={draft.body} rows={6} maxLength={2000} onChange={(event) => setDraft({ ...draft, body: event.target.value })} className={fieldClass} /></div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={copy} className={buttonClass}>Copy email draft</button>
        {canCompose && <><a href={`https://mail.google.com/mail/?${new URLSearchParams({ view: 'cm', fs: '1', to: email!, su: draft.subject, body: draft.body })}`} target="_blank" rel="noopener noreferrer" className={buttonClass}>Open Gmail</a>
          <a href={`https://outlook.office.com/mail/deeplink/compose?${new URLSearchParams({ to: email!, subject: draft.subject, body: draft.body })}`} target="_blank" rel="noopener noreferrer" className={buttonClass}>Open Outlook</a></>}
      </div>
    </div>}
    {notice && <p role="status" className="text-sm text-slate-700 dark:text-slate-200">{notice}</p>}
  </div>;
}
