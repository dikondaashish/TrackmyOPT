import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, MailSearch, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { EmailFinderForm } from './EmailFinderForm';

export const dynamic = 'force-dynamic';

export default async function EmailFinderPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main className="mx-auto max-w-6xl space-y-7 px-3 py-5 sm:px-6 sm:py-8">
      <Link
        href="/dashboard/career"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-slate-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300 dark:hover:text-blue-300"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Career Hub
      </Link>

      <header className="flex flex-wrap items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
          <MailSearch className="size-7" aria-hidden="true" />
        </div>
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">Career tools</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Work Email Finder</h1>
          <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
            Reach out to a recruiter or hiring manager after you apply. Paste their public LinkedIn profile to look for a work email.
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.9fr)] lg:items-start">
        <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <EmailFinderForm />
        </section>

        <aside className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50 sm:p-6">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <ShieldCheck className="size-5 text-blue-700 dark:text-blue-300" aria-hidden="true" />
            <h2 className="font-semibold">How it works</h2>
          </div>
          <ol className="space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <li><span className="mr-2 font-semibold text-blue-700 dark:text-blue-300">01</span>Find a relevant person at the company.</li>
            <li><span className="mr-2 font-semibold text-blue-700 dark:text-blue-300">02</span>Paste their LinkedIn profile URL.</li>
            <li><span className="mr-2 font-semibold text-blue-700 dark:text-blue-300">03</span>Review the company and work email before reaching out.</li>
          </ol>
          <div className="border-t border-slate-200 pt-4 text-xs leading-5 text-slate-600 dark:border-slate-700 dark:text-slate-300">
            This tool looks for work addresses tied to a current employer. A verification check cannot guarantee delivery or a reply.
          </div>
          <Link
            href="/dashboard/career/job-tracker"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300"
          >
            View your applications
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </main>
  );
}
