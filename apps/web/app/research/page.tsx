import Link from 'next/link';
import Image from 'next/image';
import { safeSerializeJsonLd } from '@/lib/safe-json-ld';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Chrome,
  Clock,
  FileText,
  Sparkles,
  TrendingUp,
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

const POST_STYLES: Record<string, { icon: typeof Briefcase; accent: string; ring: string }> = {
  'Hiring reality': {
    icon: Briefcase,
    accent: 'text-indigo-600 dark:text-indigo-400',
    ring: 'ring-indigo-100 dark:ring-indigo-900/50 group-hover:border-indigo-300 dark:group-hover:border-indigo-700',
  },
  Resume: {
    icon: FileText,
    accent: 'text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-100 dark:ring-violet-900/50 group-hover:border-violet-300 dark:group-hover:border-violet-700',
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
      <section className="relative overflow-hidden border-b border-gray-200/80 dark:border-zinc-800">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.14),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.22),transparent)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-800/60 dark:bg-zinc-900/80 dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                Written by our team — not AI filler
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
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
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-indigo-300 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300 dark:hover:border-indigo-600 dark:hover:text-indigo-300"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-indigo-100 shadow-2xl shadow-indigo-500/10 dark:border-indigo-900/50">
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

          <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-8 lg:max-w-none">
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
                className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
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
          className="scroll-mt-24 border-b border-gray-200 dark:border-zinc-800 bg-amber-50/40 dark:bg-amber-950/10"
        >
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  This week
                </p>
                <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Career intelligence
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                <TrendingUp className="h-3.5 w-3.5" />
                Updated {formatResearchDate(featured.publishedDate)}
              </span>
            </div>

            <article className="overflow-hidden rounded-2xl border border-amber-200/80 bg-white shadow-sm dark:border-amber-800/40 dark:bg-zinc-900">
              {featured.image && (
                <div className="relative h-48 w-full sm:h-56">
                  <Image
                    src={featured.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 1152px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent dark:from-zinc-900/90 dark:via-zinc-900/20" />
                </div>
              )}
              <div className="grid lg:grid-cols-[1.4fr_1fr]">
                <div className="p-6 sm:p-8 lg:border-r lg:border-amber-100 dark:lg:border-amber-900/30">
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
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                    >
                      {featured.cta.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                {featured.takeaways && featured.takeaways.length > 0 && (
                  <div className="bg-amber-50/80 p-6 sm:p-8 dark:bg-amber-950/20">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
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
                    <p className="mt-6 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
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
      <section id="guides" className="scroll-mt-24 bg-gray-50 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Deep dives
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                Hiring & resume guides
              </h2>
              <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
                Start with #1 if ATS myths are confusing you. Read #2 if applications are going out
                but interviews are not coming back.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200 dark:bg-zinc-900 dark:text-gray-300 dark:ring-zinc-700">
              <BookOpen className="h-3.5 w-3.5" />
              {RESEARCH_POSTS.length} guides
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {RESEARCH_POSTS.map((post) => {
              const style = POST_STYLES[post.category] ?? POST_STYLES['Hiring reality'];
              const Icon = style.icon;

              return (
                <Link
                  key={post.slug}
                  href={`/research/${post.slug}`}
                  className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 ${style.ring}`}
                >
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-lg font-bold text-gray-900 shadow-sm dark:bg-zinc-900 dark:text-white">
                      {post.number}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wide ${style.accent}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {post.category}
                        </span>
                        <span aria-hidden>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="mt-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                        {post.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {post.teaser}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
                    <span className="text-xs text-gray-400">
                      {formatResearchDate(post.publishedDate)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-all group-hover:gap-2 dark:text-indigo-400">
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
      <section id="data" className="scroll-mt-24 border-t border-gray-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-10 max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
              <BarChart3 className="h-3.5 w-3.5" />
              Community data
            </div>
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
                className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  {article.category}
                </span>
                <h3 className="mt-2 flex-1 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                  {article.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
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
      <section className="border-t border-gray-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-10 text-center shadow-xl sm:px-10 sm:py-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl"
            />
            <div className="relative">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Read the research. Then use the tools.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-indigo-100 leading-relaxed">
                Job tracker, sponsor search, unemployment clock — built for OPT, not generic job
                boards.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/features/extension"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  <Chrome className="h-4 w-4" />
                  Chrome extension
                </Link>
                <Link
                  href="/features/job-tracker"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
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
