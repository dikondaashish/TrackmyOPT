'use client';

import { useState, type FormEvent } from 'react';
import { Check, Copy, LoaderCircle, Mail, Search, UserRound, XCircle } from 'lucide-react';

type FinderResult =
  | { found: false }
  | {
      found: true;
      email: string;
      fullName: string | null;
      company: string | null;
      jobTitle: string | null;
      verified: boolean;
    };

type FinderResponse =
  | { ok: true; data: FinderResult }
  | { ok: false; error: string };

export function EmailFinderForm() {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [result, setResult] = useState<FinderResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch('/api/career/email-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: linkedinUrl.trim() }),
      });
      const payload = await response.json() as FinderResponse;
      if (!response.ok || !payload.ok) {
        setError(payload.ok ? 'Email lookup failed. Please try again.' : payload.error);
        return;
      }
      setResult(payload.data);
    } catch {
      setError('Could not connect to the email finder. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setError('');
    } catch {
      setError('Could not copy the address. Select and copy it manually.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Find a work email</h2>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">Use a profile for a person who currently works at the company.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} aria-busy={loading}>
        <div className="space-y-2">
          <label htmlFor="linkedin-profile-url" className="block text-sm font-medium text-slate-900 dark:text-white">LinkedIn profile URL</label>
          <input
            id="linkedin-profile-url"
            name="linkedinUrl"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="https://www.linkedin.com/in/username"
            value={linkedinUrl}
            onChange={(event) => {
              setLinkedinUrl(event.target.value);
              setResult(null);
              setError('');
              setCopied(false);
            }}
            aria-describedby="linkedin-profile-help"
            required
            maxLength={500}
            disabled={loading}
            className="min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-900"
          />
          <p id="linkedin-profile-help" className="text-xs leading-5 text-slate-600 dark:text-slate-300">Paste a linkedin.com/in/ profile. You can include or omit https://.</p>
        </div>

        <button
          type="submit"
          disabled={loading || !linkedinUrl.trim()}
          className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus-visible:ring-offset-slate-900 sm:w-auto"
        >
          {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Search className="size-4" aria-hidden="true" />}
          {loading ? 'Finding work email…' : 'Find work email'}
        </button>
        <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
          Your profile URL is sent to ApplyBolt to run this lookup.
        </p>
      </form>

      {loading && (
        <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
          Checking the profile and work address. Some lookups can take up to a minute.
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
          <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {result?.found === false && (
        <div role="status" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="font-semibold text-slate-900 dark:text-white">No work email found</p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Check that the profile lists a current employer, or try another contact at the company.</p>
        </div>
      )}

      {result?.found === true && <EmailResultCard result={result} copied={copied} onCopy={copyEmail} />}
    </div>
  );
}

function EmailResultCard({
  result,
  copied,
  onCopy,
}: {
  result: Extract<FinderResult, { found: true }>;
  copied: boolean;
  onCopy: (email: string) => void;
}) {
  return (
    <div role="status" className="space-y-5 rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900 dark:bg-blue-950/30 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 dark:bg-slate-900 dark:text-blue-300">
            <UserRound className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="break-words text-lg font-semibold text-slate-950 dark:text-white">{result.fullName || 'Contact found'}</h3>
            {(result.jobTitle || result.company) && (
              <p className="break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                {[result.jobTitle, result.company].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${result.verified ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100' : 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100'}`}>
          {result.verified ? <Check className="size-3.5" aria-hidden="true" /> : null}
          {result.verified ? 'Verified at lookup' : 'Verification not confirmed'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <Mail className="size-5 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" />
        <span className="min-w-0 flex-1 select-all break-all font-medium text-slate-950 dark:text-white">{result.email}</span>
        <button
          type="button"
          onClick={() => onCopy(result.email)}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">Check the name, employer, and domain before sending a message. Verification cannot guarantee delivery.</p>
    </div>
  );
}
