import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
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
      <main className="min-h-screen bg-surface px-4 pb-20 pt-28 text-foreground">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-muted-foreground">{displayPostDate(date)}</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Jobs for OPT &amp; STEM OPT job seekers</h1>
          <p className="mt-3 text-muted-foreground">
            {post.items.length} fresh US openings from verified company career pages. Roles that rule out visa
            holders (citizenship, clearance or &quot;no sponsorship&quot;) are left out.
          </p>

          {groups.map((group) => (
            <section key={group.key} className="mt-8">
              <h2 className="text-lg font-semibold text-foreground">{group.label}</h2>
              <ul className="mt-3 divide-y divide-border overflow-hidden surface-card">
                {group.items.map((item) => (
                  <li key={item.code}>
                    <Link
                      href={`/j/${item.code}`}
                      className="group flex min-h-14 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">{item.title}</span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {item.companyName}
                          {item.location ? ` · ${item.location}` : ''}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="mt-10 rounded-xl border border-primary-muted bg-primary-soft p-6">
            <h2 className="font-semibold">
              Stand out for these roles
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
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

          <p className="mt-6 text-xs text-muted-foreground">
            Always confirm visa sponsorship and E-Verify enrollment (required for STEM OPT) with the employer.
          </p>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
