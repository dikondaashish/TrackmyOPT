import Link from 'next/link';
import { Building2, ExternalLink, ShieldQuestion } from 'lucide-react';

type VisaSignal = {
  signal_type: string;
  evidence_snippet: string;
  source_url: string;
  observed_date: string;
  confidence: number;
  source: string;
};

type EmployerMatch = {
  canonical_h1b_sponsor_id: string | null;
  confidence: number;
  review_status: string;
};

export function EmployerEvidencePanel({
  employerBoardName,
  match,
  signals,
}: {
  employerBoardName: string | null;
  match: EmployerMatch | null;
  signals: VisaSignal[];
}) {
  if (!match?.canonical_h1b_sponsor_id || !['auto', 'confirmed'].includes(match.review_status)) {
    return (
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40" aria-label="Employer evidence unavailable">
        <div className="flex gap-3">
          <ShieldQuestion className="mt-0.5 size-5 shrink-0 text-slate-600 dark:text-slate-300" aria-hidden="true" />
          <div className="space-y-1 text-sm">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Employer identity not confirmed</h3>
            <p className="leading-6 text-slate-700 dark:text-slate-300">
              TrackMyOPT has not linked this board to a canonical H-1B employer record. No sponsorship history is shown.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/70 dark:bg-blue-950/30" aria-label="Employer evidence">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <Building2 className="mt-0.5 size-5 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" />
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-950 dark:text-white">Employer history found</h3>
            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
              Evidence is linked to {employerBoardName || 'this employer board'}; it does not guarantee sponsorship for this role.
            </p>
          </div>
        </div>
        <Link
          href={`/dashboard/career/h1b-sponsors/${match.canonical_h1b_sponsor_id}`}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-blue-800 dark:bg-slate-950 dark:text-blue-200 dark:hover:bg-blue-950"
        >
          Sponsor profile <ExternalLink className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg bg-white/80 p-3 text-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
          <p className="font-medium">Employer sponsorship history</p>
          <p className="mt-1 leading-6">Historical filing evidence is available below. Review role and location history in the sponsor profile.</p>
        </div>
        <div className="rounded-lg bg-white/80 p-3 text-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
          <p className="font-medium">E-Verify status</p>
          <p className="mt-1 leading-6">Needs employer confirmation. No E-Verify evidence is attached to this listing.</p>
        </div>
      </div>

      <details className="mt-3 rounded-lg border border-blue-200 bg-white/80 p-3 text-sm dark:border-blue-900/70 dark:bg-slate-950/60">
        <summary className="cursor-pointer font-semibold text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:text-blue-100">
          Why this is a potential sponsor ({signals.length} evidence {signals.length === 1 ? 'item' : 'items'})
        </summary>
        <ul className="mt-3 space-y-3">
          {signals.map((signal) => (
            <li key={`${signal.signal_type}-${signal.source_url}`} className="border-l-2 border-blue-300 pl-3 dark:border-blue-700">
              <p className="font-medium text-slate-900 dark:text-slate-100">{signal.signal_type.replaceAll('_', ' ')}</p>
              <p className="mt-1 leading-6 text-slate-700 dark:text-slate-300">{signal.evidence_snippet}</p>
              <a href={signal.source_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex text-blue-800 underline underline-offset-2 hover:text-blue-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:text-blue-200 dark:hover:text-blue-100">
                Source · observed {signal.observed_date}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
