import type { Metadata } from 'next';
import { topicLabel } from '@/data/blog-categories';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock } from 'lucide-react';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { BlogProductCTA } from '@/components/blog/BlogProductCTA';
import { BLOG_HUBS, BLOG_HUB_SLUGS, blogHubPath, isBlogHubSlug } from '@/data/blog-hubs';
import { getHubPosts } from '@/app/blog/blog-index-data';

const SITE = 'https://www.trackmyopt.com';

type PageProps = { params: Promise<{ hub: string }> };

// Hubs are a fixed list; anything else is a 404, not a database lookup.
export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_HUB_SLUGS.map((hub) => ({ hub }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hub: slug } = await params;
  if (!isBlogHubSlug(slug)) return {};
  const hub = BLOG_HUBS[slug];
  const url = `${SITE}${blogHubPath(slug)}`;
  return {
    title: hub.seoTitle,
    description: hub.description,
    alternates: { canonical: url },
    openGraph: {
      title: hub.seoTitle,
      description: hub.description,
      url,
      siteName: 'TrackMyOPT',
      type: 'website',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: hub.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: hub.seoTitle,
      description: hub.description,
      images: ['/og-image.jpg'],
    },
  };
}

export default async function BlogHubPage({ params }: PageProps) {
  const { hub: slug } = await params;
  if (!isBlogHubSlug(slug)) notFound();
  const hub = BLOG_HUBS[slug];
  const posts = getHubPosts(slug);
  const path = blogHubPath(slug);
  const otherHubs = BLOG_HUB_SLUGS.filter((s) => s !== slug).map((s) => BLOG_HUBS[s]);

  return (
    <div className="-mt-4">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE },
          { name: 'Blog', url: `${SITE}/blog` },
          { name: hub.name, url: `${SITE}${path}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: hub.title,
            description: hub.description,
            url: `${SITE}${path}`,
            isPartOf: { '@type': 'Blog', name: 'TrackMyOPT Blog', url: `${SITE}/blog` },
            hasPart: posts.map((post) => ({
              '@type': 'BlogPosting',
              headline: post.title,
              url: `${SITE}/blog/${post.slug}`,
            })),
          }),
        }}
      />

      <section className="border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-16 sm:pb-14">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-5">
            <Link href="/blog" className="hover:text-primary">
              Blog
            </Link>
            <span aria-hidden className="mx-2">
              /
            </span>
            <span className="text-foreground">{hub.name}</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-5 leading-tight">
            {hub.title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            {hub.description}
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">{hub.intro}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            {posts.length} guides · Written by Vinay Kumar · Not legal advice
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <h2 className="text-2xl font-bold text-foreground mb-6">Guides in this hub</h2>
        <ol className="divide-y divide-border rounded-xl border border-border bg-surface">
          {posts.map((post, index) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex gap-4 p-5 sm:p-6 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
              >
                <span className="shrink-0 w-8 h-8 rounded-full bg-primary-soft text-primary text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground leading-relaxed">
                    {post.description}
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium text-primary">{topicLabel(post)}</span>
                    <span aria-hidden>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden />
                      {post.readTime}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{post.date}</span>
                  </span>
                </span>
                <ArrowRight
                  className="hidden sm:block shrink-0 w-5 h-5 text-muted-foreground group-hover:text-primary self-center"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ol>

        <BlogProductCTA variant={hub.cta} sourcePage={path} />

        {otherHubs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-foreground mb-3">More topic hubs</h2>
            <ul className="flex flex-wrap gap-3">
              {otherHubs.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={blogHubPath(other.slug)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
                  >
                    {other.name}
                    <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
                >
                  All guides
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
