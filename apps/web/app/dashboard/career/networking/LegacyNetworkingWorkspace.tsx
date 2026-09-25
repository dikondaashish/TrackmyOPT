'use client';

import { useState, type FormEvent } from 'react';
import { requestEmailLookup, requestNetworkingDraft, type FinderResult, type Draft } from '@/lib/career/networking/browser-lookup';
import {
  ArrowUpRight,
  Check,
  Copy,
  LoaderCircle,
  Mail,
  Plus,
  Search,
  Sparkles,
  XCircle,
} from 'lucide-react';

type ApplicationOption = {
  id: string;
  company_name: string;
  role_title: string;
};
const inputClass =
  'min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-900';
const primaryButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus-visible:ring-offset-slate-900';
const secondaryButton =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700';

function gmailComposeUrl(email: string, subject: string, body: string) {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: email,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function outlookComposeUrl(email: string, subject: string, body: string) {
  const params = new URLSearchParams({ to: email, subject, body });
  return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
}

function normalizeCompany(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function NetworkingWorkspace({
  applications,
  initialApplicationId,
  applicationsUnavailable,
}: {
  applications: ApplicationOption[];
  initialApplicationId: string;
  applicationsUnavailable: boolean;
}) {
  const initialApplication = applications.find(
    (application) => application.id === initialApplicationId
  );
  const [applicationId, setApplicationId] = useState(
    initialApplication?.id ?? ''
  );
  const [companyName, setCompanyName] = useState(
    initialApplication?.company_name ?? ''
  );
  const [roleTitle, setRoleTitle] = useState(
    initialApplication?.role_title ?? ''
  );
  const [messageIntent, setMessageIntent] = useState('');
  const [contactCount, setContactCount] = useState(1);

  function selectApplication(id: string) {
    setApplicationId(id);
    const selected = applications.find((application) => application.id === id);
    setCompanyName(selected?.company_name ?? '');
    setRoleTitle(selected?.role_title ?? '');
  }

  const peopleSearchUrl = companyName.trim()
    ? `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName.trim())}`
    : null;

  return (
    <div className="space-y-8">
      <section className="space-y-4" aria-labelledby="network-company-heading">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
            01 · Company
          </p>
          <h2
            id="network-company-heading"
            className="mt-1 text-xl font-semibold text-slate-950 dark:text-white"
          >
            Add company context (optional)
          </h2>
        </div>
        {applicationsUnavailable && (
          <p
            role="alert"
            className="text-sm text-amber-800 dark:text-amber-200"
          >
            Your applications could not be loaded. You can enter a company and
            role manually.
          </p>
        )}
        {applications.length > 0 && (
          <div className="space-y-2">
            <label
              htmlFor="network-application"
              className="block text-sm font-medium text-slate-900 dark:text-white"
            >
              Your tracked applications
            </label>
            <select
              id="network-application"
              value={applicationId}
              onChange={(event) => selectApplication(event.target.value)}
              className={inputClass}
            >
              <option value="">Enter a company manually</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.company_name} · {application.role_title}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="network-company"
              className="block text-sm font-medium text-slate-900 dark:text-white"
            >
              Company (optional)
            </label>
            <input
              id="network-company"
              value={companyName}
              onChange={(event) => {
                setCompanyName(event.target.value);
                setApplicationId('');
              }}
              maxLength={120}
              placeholder="Company name"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="network-role"
              className="block text-sm font-medium text-slate-900 dark:text-white"
            >
              Role (optional)
            </label>
            <input
              id="network-role"
              value={roleTitle}
              onChange={(event) => {
                setRoleTitle(event.target.value);
                setApplicationId('');
              }}
              maxLength={120}
              placeholder="Role you applied for"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section
        className="space-y-4 border-t border-slate-200 pt-7 dark:border-slate-700"
        aria-labelledby="network-intent-heading"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
            02 · Your message
          </p>
          <h2
            id="network-intent-heading"
            className="mt-1 text-xl font-semibold text-slate-950 dark:text-white"
          >
            What do you want to say?
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Tell AI what you want to communicate. Your instructions shape the
            drafts for each contact.
          </p>
        </div>
        <label htmlFor="network-message-intent" className="sr-only">
          What you want to say
        </label>
        <textarea
          id="network-message-intent"
          value={messageIntent}
          onChange={(event) => setMessageIntent(event.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="For example: I applied for the software engineer role. I would love to learn what the team looks for and ask for a short conversation."
          className={`${inputClass} resize-y py-3`}
        />
        <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
          Company, role, contact details, and this message are sent to our AI
          provider when you request a draft. Review every claim before using it.
        </p>
      </section>

      <section
        className="space-y-5 border-t border-slate-200 pt-7 dark:border-slate-700"
        aria-labelledby="network-contacts-heading"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
            03 · Contacts
          </p>
          <h2
            id="network-contacts-heading"
            className="mt-1 text-xl font-semibold text-slate-950 dark:text-white"
          >
            Prepare outreach for up to 3 contacts at{' '}
            {companyName.trim() || 'a company'}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Add LinkedIn profiles for hiring contacts or warm introductions. We
            check work email status and prepare an email when verified, plus a
            LinkedIn note for each contact.
          </p>
        </div>
        {peopleSearchUrl && (
          <a
            href={peopleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300"
          >
            Search people at {companyName.trim()} on LinkedIn{' '}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        )}
        <div className="space-y-5">
          {Array.from({ length: contactCount }, (_, index) => (
            <ContactCard
              key={index}
              index={index}
              companyName={companyName}
              roleTitle={roleTitle}
              messageIntent={messageIntent}
            />
          ))}
        </div>
        {contactCount < 3 && (
          <button
            type="button"
            onClick={() => setContactCount(contactCount + 1)}
            className={secondaryButton}
          >
            <Plus className="size-4" aria-hidden="true" /> Add another contact
          </button>
        )}
        <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
          You provide the profiles. We cannot automatically discover and verify
          the top three people from a company name alone. No message is sent
          automatically.
        </p>
      </section>
    </div>
  );
}

function ContactCard({
  index,
  companyName,
  roleTitle,
  messageIntent,
}: {
  index: number;
  companyName: string;
  roleTitle: string;
  messageIntent: string;
}) {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [result, setResult] = useState<FinderResult | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftContext, setDraftContext] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const contactId = `network-contact-${index}`;

  async function findEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lookupLoading) return;
    setLookupLoading(true);
    setError('');
    setResult(null);
    setDraft(null);
    try {
      const found = await requestEmailLookup(linkedinUrl);
      setResult(found);
      if (found.found) {
        setContactName(found.fullName ?? '');
        setContactTitle(found.jobTitle ?? '');
      }
    } catch (error) {
      setError(
        errorMessage(
          error,
          'Could not connect to the email finder. Please try again.'
        )
      );
    } finally {
      setLookupLoading(false);
    }
  }

  async function generateDraft() {
    if (draftLoading || !messageIntent.trim()) return;
    setDraftLoading(true);
    setDraft(null);
    setError('');
    try {
      const nextDraft = await requestNetworkingDraft({
        companyName:
          companyName.trim() || (result?.found ? result.company : null),
        roleTitle: roleTitle.trim() || null,
        contactName: contactName.trim() || null,
        contactTitle: contactTitle.trim() || null,
        messageIntent: messageIntent.trim(),
        includeEmail:
          result?.found === true && result.verified && !companyMismatch,
      });
      setDraft(nextDraft);
      setDraftContext(currentContext);
    } catch (error) {
      setError(
        errorMessage(
          error,
          'Could not connect to AI drafting. Please try again.'
        )
      );
    } finally {
      setDraftLoading(false);
    }
  }

  async function copyValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setError('');
    } catch {
      setError('Could not copy. Select the text and copy it manually.');
    }
  }

  const currentContext = JSON.stringify([
    companyName.trim(),
    roleTitle.trim(),
    messageIntent.trim(),
    linkedinUrl.trim(),
    contactName.trim(),
    contactTitle.trim(),
    result?.found ? result.email : null,
  ]);
  const companyMismatch =
    result?.found === true && result.company && companyName.trim()
      ? !normalizeCompany(result.company).includes(
          normalizeCompany(companyName)
        ) &&
        !normalizeCompany(companyName).includes(
          normalizeCompany(result.company)
        )
      : false;
  const email =
    result?.found === true && result.verified && !companyMismatch
      ? result.email
      : null;

  return (
    <article
      className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40 sm:p-5"
      aria-labelledby={`${contactId}-heading`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
          Contact {index + 1} of 3
        </p>
        <h3
          id={`${contactId}-heading`}
          className="mt-1 text-lg font-semibold text-slate-950 dark:text-white"
        >
          {result?.found && result.fullName
            ? result.fullName
            : 'Add a LinkedIn profile'}
        </h3>
      </div>
      <ContactLookupForm
        contactId={contactId}
        linkedinUrl={linkedinUrl}
        setLinkedinUrl={setLinkedinUrl}
        setResult={setResult}
        setDraft={setDraft}
        findEmail={findEmail}
        lookupLoading={lookupLoading}
      />
      <ContactLookupResult
        result={result}
        companyMismatch={companyMismatch}
        copied={copied}
        copyValue={copyValue}
      />
      <ContactIdentityFields
        contactId={contactId}
        contactName={contactName}
        contactTitle={contactTitle}
        setContactName={setContactName}
        setContactTitle={setContactTitle}
        setDraft={setDraft}
      />
      <DraftAction
        draftLoading={draftLoading}
        messageIntent={messageIntent}
        linkedinUrl={linkedinUrl}
        contactName={contactName}
        generateDraft={generateDraft}
      />
      <DraftEditor
        draft={draft}
        draftContext={draftContext}
        currentContext={currentContext}
        email={email}
        contactId={contactId}
        copied={copied}
        copyValue={copyValue}
        setDraft={setDraft}
      />
      <ErrorNotice error={error} />
    </article>
  );
}

function ContactLookupResult({
  result,
  companyMismatch,
  copied,
  copyValue,
}: {
  result: FinderResult | null;
  companyMismatch: boolean;
  copied: string;
  copyValue: (key: string, value: string) => Promise<void>;
}) {
  return (
    <>
      {result?.found === false && (
        <p
          role="status"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          No work email found. You can still draft a LinkedIn note.
        </p>
      )}
      {result?.found === true && (
        <div
          role="status"
          className="space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-700 dark:text-slate-200">
              {[result.jobTitle, result.company].filter(Boolean).join(' · ') ||
                'Review contact details below'}
            </p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${result.verified ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100' : 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100'}`}
            >
              {result.verified
                ? 'Verified at lookup'
                : 'Verification not confirmed'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Mail
              className="size-4 text-blue-700 dark:text-blue-300"
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 select-all break-all text-sm font-medium text-slate-950 dark:text-white">
              {result.email}
            </span>
            <button
              type="button"
              onClick={() => copyValue('address', result.email)}
              className={secondaryButton}
            >
              {copied === 'address' ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
              {copied === 'address' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
            Check the person, employer, and domain before contacting them.
            Verification does not guarantee delivery.
          </p>
          {companyMismatch && (
            <p className="text-xs font-medium leading-5 text-amber-800 dark:text-amber-200">
              The contact’s reported company differs from the selected company.
              Review their current employer before using this address.
            </p>
          )}
        </div>
      )}
    </>
  );
}

function DraftEditor({
  draft,
  draftContext,
  currentContext,
  email,
  contactId,
  copied,
  copyValue,
  setDraft,
}: {
  draft: Draft | null;
  draftContext: string;
  currentContext: string;
  email: string | null;
  contactId: string;
  copied: string;
  copyValue: (key: string, value: string) => Promise<void>;
  setDraft: (draft: Draft | null) => void;
}) {
  return (
    <>
      {draft && draftContext === currentContext && (
        <div className="space-y-5 border-t border-slate-200 pt-5 dark:border-slate-700">
          {draft.subject && draft.emailBody && email && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-semibold text-slate-950 dark:text-white">
                  Email draft
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    copyValue(
                      'emailDraft',
                      `Subject: ${draft.subject}\n\n${draft.emailBody}`
                    )
                  }
                  className={secondaryButton}
                >
                  <Copy className="size-4" aria-hidden="true" />
                  {copied === 'emailDraft' ? 'Copied' : 'Copy email'}
                </button>
              </div>
              <label
                htmlFor={`${contactId}-subject`}
                className="block text-sm font-medium text-slate-900 dark:text-white"
              >
                Subject
              </label>
              <input
                id={`${contactId}-subject`}
                value={draft.subject}
                onChange={(event) =>
                  setDraft({ ...draft, subject: event.target.value })
                }
                className={inputClass}
              />
              <label
                htmlFor={`${contactId}-body`}
                className="block text-sm font-medium text-slate-900 dark:text-white"
              >
                Message
              </label>
              <textarea
                id={`${contactId}-body`}
                value={draft.emailBody}
                onChange={(event) =>
                  setDraft({ ...draft, emailBody: event.target.value })
                }
                rows={7}
                className={`${inputClass} resize-y py-3`}
              />
              <div className="flex flex-wrap gap-2">
                <a
                  href={gmailComposeUrl(email, draft.subject, draft.emailBody)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={secondaryButton}
                >
                  Open in Gmail{' '}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
                <a
                  href={outlookComposeUrl(
                    email,
                    draft.subject,
                    draft.emailBody
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={secondaryButton}
                >
                  Open in Outlook{' '}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>
              <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                The compose window opens with recipient, subject, and body
                filled in. Review and press Send in your mail account.
              </p>
            </div>
          )}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-semibold text-slate-950 dark:text-white">
                LinkedIn connection note
              </h4>
              <button
                type="button"
                onClick={() => copyValue('linkedinNote', draft.linkedinNote)}
                className={secondaryButton}
              >
                <Copy className="size-4" aria-hidden="true" />
                {copied === 'linkedinNote' ? 'Copied' : 'Copy note'}
              </button>
            </div>
            <label htmlFor={`${contactId}-note`} className="sr-only">
              Edit LinkedIn connection note
            </label>
            <textarea
              id={`${contactId}-note`}
              value={draft.linkedinNote}
              onChange={(event) =>
                setDraft({ ...draft, linkedinNote: event.target.value })
              }
              rows={4}
              className={`${inputClass} resize-y py-3`}
            />
          </div>
          <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
            Review every name and claim before sending. No message is sent from
            TrackMyOPT.
          </p>
        </div>
      )}
    </>
  );
}

function ContactLookupForm({
  contactId,
  linkedinUrl,
  setLinkedinUrl,
  setResult,
  setDraft,
  findEmail,
  lookupLoading,
}: {
  contactId: string;
  linkedinUrl: string;
  setLinkedinUrl: (value: string) => void;
  setResult: (value: FinderResult | null) => void;
  setDraft: (value: Draft | null) => void;
  findEmail: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  lookupLoading: boolean;
}) {
  return (
    <form onSubmit={findEmail} className="space-y-3" aria-busy={lookupLoading}>
      <label
        htmlFor={`${contactId}-linkedin`}
        className="block text-sm font-medium text-slate-900 dark:text-white"
      >
        LinkedIn profile URL
      </label>
      <input
        id={`${contactId}-linkedin`}
        type="text"
        inputMode="url"
        autoComplete="url"
        required
        disabled={lookupLoading}
        maxLength={500}
        value={linkedinUrl}
        onChange={(event) => {
          setLinkedinUrl(event.target.value);
          setResult(null);
          setDraft(null);
        }}
        placeholder="https://www.linkedin.com/in/username"
        className={inputClass}
      />
      <button
        type="submit"
        disabled={!linkedinUrl.trim() || lookupLoading}
        className={primaryButton}
      >
        {lookupLoading ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Search className="size-4" aria-hidden="true" />
        )}
        {lookupLoading ? 'Checking profile…' : 'Find work email'}
      </button>
      <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
        This profile URL is sent to our email lookup provider. A lookup can take up to a minute.
      </p>
    </form>
  );
}

function ContactIdentityFields({
  contactId,
  contactName,
  contactTitle,
  setContactName,
  setContactTitle,
  setDraft,
}: {
  contactId: string;
  contactName: string;
  contactTitle: string;
  setContactName: (value: string) => void;
  setContactTitle: (value: string) => void;
  setDraft: (value: Draft | null) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-2">
        <label
          htmlFor={`${contactId}-name`}
          className="block text-sm font-medium text-slate-900 dark:text-white"
        >
          Contact name
        </label>
        <input
          id={`${contactId}-name`}
          value={contactName}
          onChange={(event) => {
            setContactName(event.target.value);
            setDraft(null);
          }}
          maxLength={120}
          placeholder="Name, if known"
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor={`${contactId}-title`}
          className="block text-sm font-medium text-slate-900 dark:text-white"
        >
          Contact title
        </label>
        <input
          id={`${contactId}-title`}
          value={contactTitle}
          onChange={(event) => {
            setContactTitle(event.target.value);
            setDraft(null);
          }}
          maxLength={120}
          placeholder="Recruiter, hiring manager…"
          className={inputClass}
        />
      </div>
    </div>
  );
}

function DraftAction({
  draftLoading,
  messageIntent,
  linkedinUrl,
  contactName,
  generateDraft,
}: {
  draftLoading: boolean;
  messageIntent: string;
  linkedinUrl: string;
  contactName: string;
  generateDraft: () => Promise<void>;
}) {
  return (
    <>
      <button
        type="button"
        onClick={generateDraft}
        disabled={
          draftLoading ||
          !messageIntent.trim() ||
          (!linkedinUrl.trim() && !contactName.trim())
        }
        className={primaryButton}
      >
        {draftLoading ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles className="size-4" aria-hidden="true" />
        )}
        {draftLoading ? 'Writing drafts…' : 'Draft outreach with AI'}
      </button>
      {!messageIntent.trim() && (
        <p className="text-xs text-slate-600 dark:text-slate-300">
          First tell us what you want to say in step 02.
        </p>
      )}
    </>
  );
}

function ErrorNotice({ error }: { error: string }) {
  return (
    <>
      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
        >
          <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </>
  );
}
