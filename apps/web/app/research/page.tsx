import Link from 'next/link';
import Image from 'next/image';
import { safeSerializeJsonLd } from '@/lib/safe-json-ld';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Chrome,
} from 'lucide-react';
import {
  RESEARCH_BRIEFS,
  RESEARCH_HUB_HERO_IMAGE,
  RESEARCH_POSTS,
  getDataResearchArticles,
  formatResearchDate,
} from '@/data/research-hub';

const CANONICAL = 'https://www.trackmyopt.com/research';

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'TrackMyOPT Research',
  description:
    'Honest hiring research for international students on OPT — what we have seen across thousands of applications, and where TrackMyOPT helps vs where you have to show up.',
  url: CANONICAL,
  publisher: {
    '@type': 'Organization',
    name: 'TrackMyOPT',
    url: 'https://www.trackmyopt.com',
  },
};

const POST_STYLES: Record<string, { ring: string }> = {
  'Hiring reality': {
    ring: 'hover:border-violet-300 dark:hover:border-violet-700',
  },
  Resume: {
    ring: 'hover:border-violet-300 dark:hover:border-violet-700',
  },
};

const SECTION_LINKS = [
  { href: '#this-week', label: 'This week' },
  { href: '#guides', label: 'Guides' },
  { href: '#data', label: 'Community data' },
] as const;

export default function ResearchPage() {
  const featured = RESEARCH_BRIEFS.find((b) => b.featured) ?? RESEARCH_BRIEFS[0];
  const dataArticles = getDataResearchArticles();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(collectionSchema) }}
      />

      {/* Hero */}
      <section className="-mt-4 border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Written by our team — not AI filler
              </p>

              <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                What we have actually seen
              </h1>
              <p className="mt-5 text-lg text-gray-600 dark:text-gray-300 sm:text-xl leading-relaxed">
                Hiring advice for OPT students, grounded in real application data — and honest about
                where TrackMyOPT helps vs where you still have to show up.
              </p>

              <nav
                aria-label="On this page"
                className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
              >
                {SECTION_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="inline-flex h-10 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground shadow-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
                <Image
                  src={RESEARCH_HUB_HERO_IMAGE}
                  alt="TrackMyOPT research — hiring data and career intelligence for OPT students"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>

          <div className="surface-card mx-auto mt-12 max-w-4xl p-6 sm:p-8 lg:max-w-none">
            <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 sm:text-lg">
              We built TrackMyOPT for international students navigating OPT — timelines,
              unemployment days, sponsor research, and the job search on top of all of it. Thousands
              of you use our tracker every month. Everyone online has a theory about why you are not
              getting interviews. A lot of it is nonsense. We made this page because you kept asking
              the same questions in support.
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Something wrong here?{' '}
              <Link
                href="/contact"
                className="font-semibold text-primary hover:underline"
              >
                Tell us
              </Link>{' '}
              — that is how we pick the next post.
            </p>
          </div>
        </div>
      </section>

      {/* Featured timing brief */}
      {featured && (
        <section
          id="this-week"
          className="scroll-mt-24 border-b border-border bg-background"
        >
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                Career intelligence
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Updated {formatResearchDate(featured.publishedDate)}
              </span>
            </div>

            <article className="overflow-hidden rounded-xl border border-border border-t-[3px] border-t-amber-500 bg-card shadow-elevated">
              {featured.image && (
                <div className="relative h-48 w-full border-b border-border sm:h-56">
                  <Image
                    src={featured.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 1152px"
                  />
                </div>
              )}
              <div className="grid lg:grid-cols-[1.4fr_1fr]">
                <div className="p-6 sm:p-8 lg:border-r lg:border-border">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-[1.65rem] leading-snug">
                    {featured.title}
                  </h3>
                  <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                    {featured.subtitle}
                  </p>
                  {featured.paragraphs && (
                    <div className="mt-5 space-y-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {featured.paragraphs.map((p) => (
                        <p key={p.slice(0, 48)}>{p}</p>
                      ))}
                    </div>
                  )}
                  {featured.cta && (
                    <Link
                      href={featured.cta.href}
                      className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-button transition-colors hover:bg-primary-hover"
                    >
                      {featured.cta.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                {featured.takeaways && featured.takeaways.length > 0 && (
                  <div className="border-t border-border bg-amber-50 p-6 sm:p-8 lg:border-t-0 dark:bg-amber-950">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      Do this now
                    </p>
                    <ul className="mt-4 space-y-3">
                      {featured.takeaways.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-sm text-gray-800 dark:text-gray-200"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                      {featured.readTime}
                    </p>
                  </div>
                )}
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Editorial guides */}
      <section id="guides" className="scroll-mt-24 border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                Hiring & resume guides
              </h2>
              <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
                Start with #1 if ATS myths are confusing you. Read #2 if applications are going out
                but interviews are not coming back.
              </p>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {RESEARCH_POSTS.length} guides
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {RESEARCH_POSTS.map((post) => {
              const style = POST_STYLES[post.category] ?? POST_STYLES['Hiring reality'];

              return (
                <Link
                  key={post.slug}
                  href={`/research/${post.slug}`}
                  className={`surface-card-interactive group relative flex h-full flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${style.ring}`}
                >
                  <div className="relative h-44 w-full overflow-hidden border-b border-border bg-muted">
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-lg font-bold text-foreground shadow-card">
                      {post.number}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{post.category}</span>
                        <span aria-hidden>·</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="mt-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-300">
                        {post.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {post.teaser}
                  </p>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {formatResearchDate(post.publishedDate)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 dark:text-violet-300">
                      Read guide
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community data */}
      <section id="data" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Numbers from our users
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
              Anonymized USCIS timelines, sponsor filings, and audit data — published with sample
              sizes and caveats, not hype.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dataArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="surface-card-interactive group flex h-full flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {article.category}
                </span>
                <h3 className="mt-2 flex-1 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                  {article.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span>{article.readTime}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 opacity-0 transition-all group-hover:opacity-100 dark:text-emerald-400">
                    Read
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="rounded-xl border border-ink-border bg-ink px-6 py-10 text-center shadow-elevated sm:px-10 sm:py-12">
            <div>
              <h2 className="text-2xl font-bold text-ink-foreground sm:text-3xl">
                Read the research, then use the tools
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-ink-muted leading-relaxed">
                Job tracker, sponsor search, unemployment clock — built for OPT, not generic job
                boards.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-button transition-colors hover:bg-blue-500"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/features/extension"
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-ink-border px-5 text-sm font-semibold text-ink-foreground transition-colors hover:bg-white hover:text-ink"
                >
                  <Chrome className="h-4 w-4" />
                  Chrome extension
                </Link>
                <Link
                  href="/features/job-tracker"
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-ink-border px-5 text-sm font-semibold text-ink-foreground transition-colors hover:bg-white hover:text-ink"
                >
                  <Briefcase className="h-4 w-4" />
                  Job tracker
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
