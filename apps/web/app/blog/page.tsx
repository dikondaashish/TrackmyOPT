import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { BlogPostImage } from '@/components/blog/BlogPostImage';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          OPT & F-1 Visa Guides
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
          Expert guides on OPT timelines, STEM OPT extensions, H-1B sponsors,
          and USCIS tracking. Written by former F-1 students who've been through
          it all.
        </p>

        {/* E-E-A-T / Editorial Density Section */}
        <div className="max-w-3xl mx-auto bg-blue-50 dark:bg-blue-950 rounded-xl p-6 text-left">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xl">
                VK
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                Editorial Independence & Accuracy
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                {hasUnreviewed ? 'Our guides are authored by' : 'Our content is exclusively authored by'}{' '}
                <strong>Vinay Kumar</strong>, our Lead Content Writer and former
                F-1 student. We regularly consult with immigration attorneys and
                review DHS/USCIS policy updates to ensure our guides remain
                accurate, objective, and up-to-date.
                {hasUnreviewed && (
                  <>
                    {' '}Posts bylined <strong>TrackMyOPT News Desk</strong> are
                    generated automatically from official government notices.
                  </>
                )}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                TrackMyOPT is not a law firm. The guides below provide general
                educational information about the F-1 visa lifecycle and
                should not be construed as legal advice.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Posts */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {featured.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <article className="flex flex-col h-full bg-blue-50 dark:bg-zinc-900 rounded-xl hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="relative w-full h-48 sm:h-56 bg-blue-100 dark:bg-zinc-800">
                <BlogPostImage
                  src={getPostImage(post)}
                  alt={post.title}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  {post.category} · {post.readTime} · Featured
                </p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed flex-grow">
                  {post.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm text-gray-500">{post.date}</span>
                  <span className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-2 transition-all">
                    Read Guide <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* All Posts */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        All Guides
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {rest.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: (typeof blogPosts)[number] }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="relative w-full h-40 bg-gray-100 dark:bg-zinc-800">
          <BlogPostImage
            src={getPostImage(post)}
            alt={post.title}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Clock className="w-3.5 h-3.5" />
            {post.category} · {post.readTime}
          </p>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-grow">
            {post.description}
          </p>
          <span className="text-sm text-gray-400 mt-auto">{post.date}</span>
        </div>
      </article>
    </Link>
  );
}
