import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, BriefcaseBusiness, Building2, CalendarDays, ExternalLink, MapPin, Sparkles } from 'lucide-react';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { POST_DOMAINS } from '@/lib/linkedin/daily-post';
import { loadJobLink } from '@/lib/linkedin/daily-post-service';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ code: string }> };

// Short-lived job pages shared on LinkedIn; kept out of search results.
export const metadata: Metadata = {
  title: { absolute: 'Job for OPT & STEM OPT job seekers | TrackMyOPT' },
  robots: { index: false, follow: false },
};

function postedLabel(postedAt: string | null): string | null {
  if (!postedAt) return null;
  const time = Date.parse(postedAt);
  if (!Number.isFinite(time)) return null;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' }).format(time);
}

export default async function SharedJobPage({ params }: PageProps) {
  const { code } = await params;
  const job = await loadJobLink(code);
  if (!job) notFound();

  const domain = POST_DOMAINS.find((item) => item.key === job.domain);
  const posted = postedLabel(job.posted_at);
  const signUpUrl = `/login?next=${encodeURIComponent('/dashboard/career/resume-generator')}`;

  return (
    <>
      <LandingNavbar />
      <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-28 text-slate-950 dark:bg-zinc-950 dark:text-white">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/opt-jobs/${job.first_featured_on}`}
            className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
          >
            ← All of this day&apos;s picks
          </Link>

          <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            {domain && (
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                {domain.emoji} {domain.label}
              </p>
            )}
            <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">{job.title}</h1>
            <dl className="mt-5 space-y-2 text-sm text-slate-600 dark:text-zinc-300">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0" aria-hidden />
                <dt className="sr-only">Company</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{job.company_name}</dd>
              </div>
              {job.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  <dt className="sr-only">Location</dt>
                  <dd>{job.location}</dd>
                </div>
              )}
              {posted && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
                  <dt className="sr-only">Posted</dt>
                  <dd>Posted {posted}</dd>
                </div>
              )}
            </dl>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={job.job_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700"
              >
                Apply on company site
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
              <Link
                href={signUpUrl}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 font-semibold hover:bg-slate-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Tailor my resume — free
              </Link>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
              TrackMyOPT does not verify an employer&apos;s visa policy for this role. Confirm sponsorship and E-Verify
              enrollment (required for STEM OPT) with the employer before you accept an offer.
            </p>
          </article>

          <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-950/30">
            <h2 className="flex items-center gap-2 font-semibold">
              <BriefcaseBusiness className="h-5 w-5" aria-hidden />
              Thousands more jobs, free
            </h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">
              TrackMyOPT&apos;s job board lists US openings from verified company career pages, with filters for
              location, role and sponsorship signals, plus an OPT unemployment-day tracker.
            </p>
            <Link
              href="/dashboard/career/jobs"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300"
            >
              Open the job board <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </section>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
