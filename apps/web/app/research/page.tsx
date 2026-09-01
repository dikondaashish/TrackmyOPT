import Link from 'next/link';
import { safeSerializeJsonLd } from '@/lib/safe-json-ld';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Chrome,
  Clock,
} from 'lucide-react';
import {
  RESEARCH_BRIEFS,
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

export default function ResearchPage() {
  const featured = RESEARCH_BRIEFS.find((b) => b.featured) ?? RESEARCH_BRIEFS[0];
  const dataArticles = getDataResearchArticles();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(collectionSchema) }}
      />

      {/* Intro — human, TrackMyOPT-only */}
      <section className="border-b border-gray-200 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">
            Research
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl leading-tight">
            What we have actually seen
          </h1>

          <div className="mt-8 space-y-5 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              We built TrackMyOPT for international students navigating OPT — timelines, unemployment
              days, sponsor research, and the job search that runs on top of all of it. Thousands of
              you use our tracker every month. We see where applications go, which companies actually
              file for H-1B, and which resume advice is worth following.
            </p>
            <p>
              Everyone online has a theory about why you are not getting interviews. A lot of it is
              nonsense. We made this page to share what we have learned — and to be clear about where
              TrackMyOPT genuinely helps and where you still have to do the work yourself.
            </p>
            <p className="text-base text-gray-500 dark:text-gray-400 border-l-2 border-indigo-500 pl-4">
              None of this is AI-generated filler. We wrote it because our users kept asking the same
              questions in support and in the community. If something here is wrong,{' '}
              <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                tell us
              </Link>{' '}
              — that is how the next post gets picked.
            </p>
          </div>
        </div>
      </section>

      {/* Numbered deep dives */}
      <section className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-8">
            All research
          </h2>

          <div className="space-y-4">
            {RESEARCH_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/research/${post.slug}`}
                className="group flex gap-5 rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                  {post.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                      {post.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {post.teaser}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured timing brief */}
      {featured && (
        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-4">
            This week
          </p>
          <article className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-800/50 dark:bg-amber-950/20">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{featured.title}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{featured.subtitle}</p>
            {featured.paragraphs && (
              <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {featured.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)}>{p}</p>
                ))}
              </div>
            )}
            {featured.cta && (
              <Link
                href={featured.cta.href}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200 hover:underline"
              >
                {featured.cta.label} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              {formatResearchDate(featured.publishedDate)} · {featured.readTime}
            </p>
          </article>
        </section>
      )}

      {/* Community data */}
      <section className="border-t border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Numbers from our community
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Anonymized USCIS timelines, sponsor filings, and audit data — published with sample sizes
            and caveats, not hype.
          </p>

          <div className="space-y-3">
            {dataArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group block rounded-xl border border-gray-200 p-4 hover:border-emerald-300 dark:border-zinc-800 dark:hover:border-emerald-700"
              >
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {article.category}
                </span>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {article.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Read the research. Then use the tools.
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            Job tracker, sponsor search, unemployment clock — built for OPT, not generic job boards.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features/extension"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold dark:border-zinc-700 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              <Chrome className="h-4 w-4" />
              Chrome extension
            </Link>
            <Link
              href="/features/job-tracker"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold dark:border-zinc-700 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              <Briefcase className="h-4 w-4" />
              Job tracker
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
