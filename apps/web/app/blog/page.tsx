import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Bell, CalendarCheck, CalendarClock, Clock } from 'lucide-react';
import { BlogArchive } from '@/components/blog/BlogArchive';
import { BlogPostImage } from '@/components/blog/BlogPostImage';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { topicLabel } from '@/data/blog-categories';
import { BLOG_HUBS, BLOG_HUB_SLUGS, blogHubPath, type BlogHubSlug } from '@/data/blog-hubs';
import { toBlogCard } from '@/data/blog-series';
import { loadPublishedAutoPosts } from '@/lib/policy-news/store';
import {
  ESSENTIAL_GUIDE_SLUGS,
  blogPosts,
  getHubPosts,
  getPostImage,
  sortNewestFirst,
  type BlogIndexCard,
} from './blog-index-data';

export const metadata: Metadata = {
  title: 'OPT & F-1 Visa Blog — Guides for International Students',
  description:
    'Expert guides on OPT timelines, STEM OPT extensions, H-1B sponsors, USCIS case tracking, and unemployment day rules. Written by former F-1 students.',
  keywords: [
    'OPT blog',
    'F-1 visa guide',
    'STEM OPT blog',
    'H-1B guide',
    'international student blog',
    'OPT tips',
  ],
  alternates: {
    canonical: 'https://www.trackmyopt.com/blog',
  },
  openGraph: {
    title: 'OPT & F-1 Visa Blog — Guides for International Students',
    description:
      'Expert guides on OPT timelines, STEM OPT extensions, H-1B sponsors, USCIS case tracking, and unemployment day rules.',
    url: 'https://www.trackmyopt.com/blog',
    siteName: 'TrackMyOPT',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TrackMyOPT Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OPT & F-1 Visa Blog — Guides for International Students',
    description:
      'Expert guides on OPT timelines, STEM OPT extensions, H-1B sponsors, and USCIS case tracking.',
    images: ['/og-image.jpg'],
  },
};

// Automatic policy-news posts come from the database; the cron revalidates
// this page when it publishes one.
export const revalidate = 3600;

const NEWS = BLOG_HUBS['policy-news'].name;
const LATEST_COUNT = 6;
const NEWS_COUNT = 6;
const HUB_PREVIEW_COUNT = 3;

/** Reader situations, each pointing at the hub to open first. */
const START_HERE: { title: string; text: string; links: { hub: BlogHubSlug; label: string }[] }[] = [
  {
    title: 'Waiting on USCIS',
    text: 'You filed for OPT or STEM OPT and want to know how long it takes and what your status means.',
    links: [
      { hub: 'processing-times', label: 'Processing times' },
      { hub: 'case-status', label: 'Case status' },
    ],
  },
  {
    title: 'On OPT and job hunting',
    text: 'Count unemployment days, report changes, and find work that counts toward your OPT.',
    links: [
      { hub: 'opt-rules', label: 'OPT rules' },
      { hub: 'careers', label: 'Careers' },
    ],
  },
  {
    title: 'Moving to STEM OPT',
    text: 'The 24-month extension, Form I-983, E-Verify employers and validation reports.',
    links: [{ hub: 'stem-opt', label: 'STEM OPT' }],
  },
  {
    title: 'Planning what comes next',
    text: 'H-1B, cap-gap, green card routes and other work visas after OPT ends.',
    links: [
      { hub: 'after-opt', label: 'After OPT' },
      { hub: 'visa-bulletin', label: 'Visa Bulletin' },
    ],
  },
];

const TOOLS = [
  {
    icon: Bell,
    name: 'Case status checker',
    text: 'Save your receipt number and see plain-English status updates.',
    href: '/dashboard/case-status',
  },
  {
    icon: CalendarClock,
    name: 'OPT decision window',
    text: 'See when a decision may come, from community timelines.',
    href: '/tools/opt-decision-window',
  },
  {
    icon: Clock,
    name: 'OPT unemployment clock',
    text: 'Count the days you have used of your 90-day limit.',
    href: '/tools/opt-clock',
  },
  {
    icon: CalendarCheck,
    name: 'OPT filing window',
    text: 'Find the earliest and latest dates you can file Form I-765.',
    href: '/tools/opt-apply',
  },
];

const LANGUAGE_NAMES: Record<string, string> = { es: 'Español', ko: '한국어' };

export default async function BlogIndexPage() {
  const autoArticles = await loadPublishedAutoPosts();
  // Until an admin reviews them, automatic posts carry the News Desk byline.
  const hasUnreviewed = autoArticles.some((a) => a.byline === 'automated');

  const bySlug = new Map<string, BlogIndexCard>();
  for (const card of [...autoArticles.map((article) => toBlogCard(article)), ...blogPosts]) {
    if (!bySlug.has(card.slug)) bySlug.set(card.slug, card);
  }
  const allPosts = sortNewestFirst([...bySlug.values()]);
  const english = allPosts.filter((post) => (post.lang ?? 'en') === 'en');
  const otherLanguages = allPosts.filter((post) => (post.lang ?? 'en') !== 'en');
  const isNews = (post: BlogIndexCard) => topicLabel(post) === NEWS;

  const latest = english.filter((post) => !isNews(post)).slice(0, LATEST_COUNT);
  const news = english.filter(isNews).slice(0, NEWS_COUNT);
  const essentials = ESSENTIAL_GUIDE_SLUGS.flatMap((slug) => bySlug.get(slug) ?? []);
  const topicHubs = BLOG_HUB_SLUGS.filter((slug) => slug !== 'policy-news');

  const topicCounts = new Map<string, number>();
  for (const post of allPosts) {
    const label = topicLabel(post);
    topicCounts.set(label, (topicCounts.get(label) ?? 0) + 1);
  }
  const archiveTopics = BLOG_HUB_SLUGS.map((slug) => BLOG_HUBS[slug].name)
    .filter((label) => topicCounts.has(label))
    .map((label) => ({ label, count: topicCounts.get(label)! }));
  const archive = allPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    topic: topicLabel(post),
    date: post.date,
  }));

  return (
    <div className="-mt-4">
      {/* Header */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-16 sm:pb-14">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            OPT & F-1 Visa Guides
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
            Plain-language guides on OPT timelines, STEM OPT, USCIS case status and H-1B, written by
            former F-1 students.
          </p>
          <BlogSearch posts={archive.map(({ slug, title, topic }) => ({ slug, title, topic }))} />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Start here */}
        <section aria-labelledby="blog-start-heading">
          <h2 id="blog-start-heading" className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
            Start with your situation
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {START_HERE.map((item) => (
              <div key={item.title} className="surface-card flex flex-col p-6 border-l-4 border-l-primary">
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-grow">{item.text}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                  {item.links.map((link) => (
                    <Link
                      key={link.hub}
                      href={blogHubPath(link.hub)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      {link.label} <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Latest */}
        <section aria-labelledby="blog-latest-heading">
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <h2 id="blog-latest-heading" className="text-2xl sm:text-3xl font-bold text-foreground">
              Latest guides
            </h2>
            <a href="#all-guides" className="text-sm font-semibold text-primary hover:underline">
              All guides
            </a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        {/* Most useful */}
        <section aria-labelledby="blog-essential-heading">
          <h2 id="blog-essential-heading" className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Essential guides
          </h2>
          <p className="text-muted-foreground mb-6">
            Processing times, case status and the OPT rules to read first.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {essentials.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <article className="surface-card-interactive flex h-full flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                    {topicLabel(post)}
                  </p>
                  <h3 className="text-lg font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.description}</p>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section aria-labelledby="blog-tools-heading" className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 id="blog-tools-heading" className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            Free tools for your case
          </h2>
          <p className="text-sm text-muted-foreground mb-6">Check your own dates instead of working them out by hand.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex gap-3 rounded-xl border border-border bg-background p-4 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <tool.icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold text-foreground group-hover:text-primary">{tool.name}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground leading-snug">{tool.text}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Topics */}
        <section aria-labelledby="blog-topics-heading">
          <h2 id="blog-topics-heading" className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Browse by topic
          </h2>
          <p className="text-muted-foreground mb-6">Each topic page lists its key guides in reading order.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topicHubs.map((slug) => {
              const hub = BLOG_HUBS[slug];
              return (
                <div key={slug} className="surface-card flex flex-col p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    <Link href={blogHubPath(slug)} className="hover:text-primary">
                      {hub.name}
                    </Link>
                  </h3>
                  <ul className="space-y-2.5 flex-grow">
                    {getHubPosts(slug)
                      .filter((post) => (post.lang ?? 'en') === 'en')
                      .slice(0, HUB_PREVIEW_COUNT)
                      .map((post) => (
                        <li key={post.slug}>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="text-sm text-foreground leading-snug hover:text-primary hover:underline"
                          >
                            {post.title}
                          </Link>
                        </li>
                      ))}
                  </ul>
                  <Link
                    href={blogHubPath(slug)}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    Open {hub.name} <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Policy news */}
        <section aria-labelledby="blog-news-heading" className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] gap-8">
          <div>
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <h2 id="blog-news-heading" className="text-2xl sm:text-3xl font-bold text-foreground">
                Policy news
              </h2>
              <Link href={blogHubPath('policy-news')} className="text-sm font-semibold text-primary hover:underline">
                All policy news
              </Link>
            </div>
            <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
              {news.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-1 px-5 py-4 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <time className="text-xs text-muted-foreground">{post.date}</time>
                    <span className="font-medium text-foreground leading-snug group-hover:text-primary">
                      {post.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {otherLanguages.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Other languages</h2>
              <ul className="space-y-3">
                {otherLanguages.map((post) => (
                  <li key={post.slug} lang={post.lang}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block rounded-xl border border-border bg-surface p-4 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="block text-xs font-semibold text-primary mb-1">
                        {LANGUAGE_NAMES[post.lang ?? ''] ?? post.lang}
                      </span>
                      <span className="block text-sm font-medium text-foreground leading-snug">{post.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* Archive */}
      <section id="all-guides" aria-labelledby="blog-all-heading" className="border-t border-border bg-surface scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 id="blog-all-heading" className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            All guides
          </h2>
          <p className="text-muted-foreground mb-6">{allPosts.length} guides, newest first.</p>
          <BlogArchive posts={archive} topics={archiveTopics} />
        </div>
      </section>

      {/* Editorial note */}
      <section className="border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="font-semibold text-foreground text-lg mb-2">About these guides</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {hasUnreviewed ? 'Our guides are authored by' : 'Our content is exclusively authored by'}{' '}
            <strong className="text-foreground">Vinay Kumar</strong>, our Lead Content Writer and former F-1
            student. We regularly consult with immigration attorneys and review DHS/USCIS policy updates to
            ensure our guides remain accurate, objective, and up-to-date.
            {hasUnreviewed && (
              <>
                {' '}Posts bylined <strong className="text-foreground">TrackMyOPT News Desk</strong> are
                generated automatically from official government notices.
              </>
            )}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            TrackMyOPT is not a law firm. These guides provide general educational information about the F-1
            visa lifecycle and should not be construed as legal advice.
          </p>
        </div>
      </section>
    </div>
  );
}

function PostCard({ post }: { post: BlogIndexCard }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <article className="surface-card-interactive flex flex-col h-full overflow-hidden">
        <div className="relative w-full h-40 bg-muted border-b border-border">
          <BlogPostImage
            src={getPostImage(post)}
            alt=""
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mb-3">
            <span className="font-medium text-primary">{topicLabel(post)}</span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden />
              {post.readTime}
            </span>
          </p>
          <h3 className="text-lg font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow line-clamp-3">
            {post.description}
          </p>
          <time className="text-sm text-muted-foreground border-t border-border pt-3 mt-auto">{post.date}</time>
        </div>
      </article>
    </Link>
  );
}
