import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Building2, CalendarDays, ExternalLink, MapPin, Sparkles } from 'lucide-react';
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
      <main className="min-h-screen bg-surface px-4 pb-20 pt-28 text-foreground">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/opt-jobs/${job.first_featured_on}`}
            className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
          >
            ← All of this day&apos;s picks
          </Link>

          <article className="mt-4 rounded-xl border border-border bg-card p-6 shadow-elevated sm:p-8">
            {domain && (
              <p className="text-sm text-muted-foreground">{domain.label}</p>
            )}
            <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">{job.title}</h1>
            <dl className="mt-5 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0" aria-hidden />
                <dt className="sr-only">Company</dt>
                <dd className="font-medium text-foreground">{job.company_name}</dd>
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
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground shadow-button transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Apply on company site
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
              <Link
                href={signUpUrl}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-input bg-background px-5 font-semibold text-foreground shadow-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Tailor my resume — free
              </Link>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              TrackMyOPT does not verify an employer&apos;s visa policy for this role. Confirm sponsorship and E-Verify
              enrollment (required for STEM OPT) with the employer before you accept an offer.
            </p>
          </article>

          <section className="mt-6 rounded-xl border border-primary-muted bg-primary-soft p-6">
            <h2 className="font-semibold">
              Thousands more jobs, free
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
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
