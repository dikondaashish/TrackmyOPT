import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { displayPostDate, POST_DOMAINS } from '@/lib/linkedin/daily-post';
import { loadDailyPost } from '@/lib/linkedin/daily-post-service';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ date: string }> };

// Daily lists linked from LinkedIn; kept out of search results.
export const metadata: Metadata = {
  title: { absolute: "Today's jobs for OPT & STEM OPT job seekers | TrackMyOPT" },
  robots: { index: false, follow: true },
};

export default async function DailyOptJobsPage({ params }: PageProps) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00Z`))) notFound();
  const post = await loadDailyPost(date);
  if (!post || post.items.length === 0) notFound();

  const groups = POST_DOMAINS.map((domain) => ({
    ...domain,
    items: post.items.filter((item) => item.domain === domain.key),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <LandingNavbar />
      <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-28 text-slate-950 dark:bg-zinc-950 dark:text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{displayPostDate(date)}</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight">Jobs for OPT &amp; STEM OPT job seekers</h1>
          <p className="mt-3 text-slate-600 dark:text-zinc-300">
            {post.items.length} fresh US openings from verified company career pages. Roles that rule out visa
            holders (citizenship, clearance or &quot;no sponsorship&quot;) are left out.
          </p>

          {groups.map((group) => (
            <section key={group.key} className="mt-8">
              <h2 className="text-lg font-semibold">
                {group.emoji} {group.label}
              </h2>
              <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                {group.items.map((item) => (
                  <li key={item.code}>
                    <Link
                      href={`/j/${item.code}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{item.title}</span>
                        <span className="block truncate text-sm text-slate-500 dark:text-zinc-400">
                          {item.companyName}
                          {item.location ? ` · ${item.location}` : ''}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-950/30">
            <h2 className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-5 w-5" aria-hidden />
              Stand out for these roles
            </h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">
              Tailor your resume to a job description with TrackMyOPT&apos;s AI resume builder, and browse thousands
              more openings on the free job board.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
              <Link
                href={`/login?next=${encodeURIComponent('/dashboard/career/resume-generator')}`}
                className="text-blue-700 hover:underline dark:text-blue-300"
              >
                Tailor my resume — free
              </Link>
              <Link href="/dashboard/career/jobs" className="text-blue-700 hover:underline dark:text-blue-300">
                Open the job board
              </Link>
            </div>
          </section>

          <p className="mt-6 text-xs text-slate-500 dark:text-zinc-400">
            Always confirm visa sponsorship and E-Verify enrollment (required for STEM OPT) with the employer.
          </p>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
