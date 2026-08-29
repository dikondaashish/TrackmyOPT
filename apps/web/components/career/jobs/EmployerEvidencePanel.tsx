import Link from 'next/link';
import { Building2, ChevronDown, ExternalLink, FileText, ShieldQuestion } from 'lucide-react';

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
      <section className="rounded-2xl border border-slate-200/90 bg-white/70 p-3.5 dark:border-slate-700 dark:bg-slate-950/60" aria-label="Employer evidence unavailable">
        <div className="flex gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><ShieldQuestion className="size-4.5" aria-hidden="true" /></span>
          <div className="space-y-1 text-sm leading-5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Employer identity not confirmed</h3>
            <p className="text-slate-600 dark:text-slate-300">
              TrackMyOPT has not linked this board to a canonical H-1B employer record. No sponsorship history is shown.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-blue-100 bg-white/75 p-3.5 shadow-[0_1px_0_rgba(255,255,255,0.8)] dark:border-blue-900/70 dark:bg-slate-950/60" aria-label="Employer evidence">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"><Building2 className="size-4.5" aria-hidden="true" /></span>
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-950 dark:text-white">Employer history found</h3>
            <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">
              Dated H-1B filing evidence is linked to {employerBoardName || 'this employer board'}.
            </p>
          </div>
        </div>
        <Link
          href={`/dashboard/career/h1b-sponsors/${match.canonical_h1b_sponsor_id}`}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-blue-800 dark:bg-slate-950 dark:text-blue-200 dark:hover:bg-blue-950"
        >
          Sponsor profile <ExternalLink className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <details className="group mt-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900/60">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:text-slate-100">
          <span className="inline-flex items-center gap-2"><FileText className="size-4 text-blue-700 dark:text-blue-300" aria-hidden="true" />Why this is a potential sponsor ({signals.length} evidence {signals.length === 1 ? 'item' : 'items'})</span>
          <ChevronDown className="size-4 shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-180 dark:text-slate-400" aria-hidden="true" />
        </summary>
        <div className="mt-3 grid gap-3 border-t border-slate-200 pt-3 dark:border-slate-800 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-3 text-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
            <p className="font-medium">Employer sponsorship history</p>
            <p className="mt-1 leading-6">Historical filing evidence is available below. Review role and location history in the sponsor profile.</p>
          </div>
          <div className="rounded-lg bg-white p-3 text-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
            <p className="font-medium">E-Verify status</p>
            <p className="mt-1 leading-6">Needs employer confirmation. No E-Verify evidence is attached to this listing.</p>
          </div>
        </div>
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
