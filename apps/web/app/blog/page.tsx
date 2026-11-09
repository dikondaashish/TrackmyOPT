import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { BlogPostImage } from '@/components/blog/BlogPostImage';
import { BLOG_HUBS, BLOG_HUB_SLUGS, blogHubPath } from '@/data/blog-hubs';
import { toBlogCard } from '@/data/blog-series';
import { loadPublishedAutoPosts } from '@/lib/policy-news/store';
import { blogPosts, getPostImage } from './blog-index-data';

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

export default async function BlogIndexPage() {
  const featured = blogPosts.filter((p) => p.featured);
  const autoArticles = await loadPublishedAutoPosts();
  // Newest first: automatic policy-news posts, then the existing guides.
  const rest = [
    ...autoArticles.map((article) => toBlogCard(article)),
    ...blogPosts.filter((p) => !p.featured),
  ];
  // Until an admin reviews them, automatic posts carry the News Desk byline.
  const hasUnreviewed = autoArticles.some((a) => a.byline === 'automated');

  return (
    <div className="-mt-4">
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-16 sm:pb-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-5 leading-tight">
                OPT & F-1 Visa Guides
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Expert guides on OPT timelines, STEM OPT extensions, H-1B sponsors,
                and USCIS tracking. Written by former F-1 students who've been through
                it all.
              </p>
            </div>

            {/* E-E-A-T / Editorial Density Section */}
            <div className="surface-card p-6 text-left">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary-soft border border-primary-muted flex items-center justify-center text-primary font-bold text-lg">
                    VK
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    Editorial Independence & Accuracy
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {hasUnreviewed ? 'Our guides are authored by' : 'Our content is exclusively authored by'}{' '}
                    <strong className="text-foreground">Vinay Kumar</strong>, our Lead Content Writer and former
                    F-1 student. We regularly consult with immigration attorneys and
                    review DHS/USCIS policy updates to ensure our guides remain
                    accurate, objective, and up-to-date.
                    {hasUnreviewed && (
                      <>
                        {' '}Posts bylined <strong className="text-foreground">TrackMyOPT News Desk</strong> are
                        generated automatically from official government notices.
                      </>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    TrackMyOPT is not a law firm. The guides below provide general
                    educational information about the F-1 visa lifecycle and
                    should not be construed as legal advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Topic hubs */}
        <section aria-labelledby="blog-hubs-heading" className="mb-14">
          <h2 id="blog-hubs-heading" className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Browse by topic
          </h2>
          <p className="text-muted-foreground mb-6">
            Every guide on one question, in reading order.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BLOG_HUB_SLUGS.map((slug) => {
              const hub = BLOG_HUBS[slug];
              return (
                <Link
                  key={slug}
                  href={blogHubPath(slug)}
                  className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <article className="surface-card-interactive flex h-full flex-col p-6 sm:p-7 border-l-4 border-l-primary">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                      Topic hub
                    </p>
                    <h3 className="text-xl font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                      {hub.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                      {hub.description}
                    </p>
                    <span className="mt-4 flex items-center gap-1 text-primary font-semibold text-sm">
                      Open hub <ArrowRight className="w-4 h-4" aria-hidden />
                    </span>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Posts */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {featured.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <article className="surface-card-interactive flex flex-col h-full overflow-hidden border-t-[3px] border-t-primary">
                <div className="relative w-full h-48 sm:h-56 bg-muted border-b border-border">
                  <BlogPostImage
                    src={getPostImage(post)}
                    alt={post.title}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col flex-grow">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mb-4">
                    <span className="font-medium text-primary">{post.category}</span>
                    <span aria-hidden>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime} · Featured
                    </span>
                  </p>
                  <h2 className="text-2xl font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed flex-grow">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                    <span className="text-sm text-muted-foreground">{post.date}</span>
                    <span className="flex items-center gap-1 text-primary font-semibold text-sm">
                      Read Guide <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* All Posts */}
      <section className="border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
            All Guides
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function PostCard({ post }: { post: (typeof blogPosts)[number] }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <article className="surface-card-interactive flex flex-col h-full overflow-hidden">
        <div className="relative w-full h-40 bg-muted border-b border-border">
          <BlogPostImage
            src={getPostImage(post)}
            alt={post.title}
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mb-3">
            <span className="font-medium text-primary">{post.category}</span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </p>
          <h3 className="text-lg font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
            {post.description}
          </p>
          <span className="text-sm text-muted-foreground border-t border-border pt-3 mt-auto">{post.date}</span>
        </div>
      </article>
    </Link>
  );
}
