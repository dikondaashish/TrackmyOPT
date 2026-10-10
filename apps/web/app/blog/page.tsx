import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock, TrendingUp, BookOpen } from 'lucide-react';
import { BlogPostImage } from '@/components/blog/BlogPostImage';
import { blogPosts, CATEGORY_COLORS, getPostImage } from './blog-index-data';

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

function CategoryBadge({ category }: { category: string }) {
  const colors = CATEGORY_COLORS;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[category] || 'bg-gray-100 text-gray-700'}`}
    >
      {category}
    </span>
  );
}

export default function BlogIndexPage() {
  const featured = blogPosts.filter((p) => p.featured);
  const rest = blogPosts.filter((p) => !p.featured);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
          <BookOpen className="w-4 h-4" />
          OPT Knowledge Hub
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          OPT & F-1 Visa Guides
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
          Expert guides on OPT timelines, STEM OPT extensions, H-1B sponsors,
          and USCIS tracking. Written by former F-1 students who've been through
          it all.
        </p>

        {/* E-E-A-T / Editorial Density Section */}
        <div className="max-w-3xl mx-auto bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 text-left border border-blue-100 dark:border-blue-900/30">
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
                Our content is exclusively authored by{' '}
                <strong>Vinay Kumar</strong>, our Lead Content Writer and former
                F-1 student. We regularly consult with immigration attorneys and
                review DHS/USCIS policy updates to ensure our guides remain
                accurate, objective, and up-to-date.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                <em>
                  TrackMyOPT is not a law firm. The guides below provide general
                  educational information about the F-1 visa lifecycle and
                  should not be construed as legal advice.
                </em>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Posts */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {featured.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <article className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl border border-blue-100 dark:border-zinc-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="relative w-full h-48 sm:h-56 bg-blue-100 dark:bg-zinc-800">
                <BlogPostImage
                  src={getPostImage(post)}
                  alt={post.title}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <CategoryBadge category={post.category} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
                    <TrendingUp className="w-3 h-3" />
                    Featured
                  </span>
                </div>
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
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
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
                <div className="flex items-center gap-3 mb-3">
                  <CategoryBadge category={post.category} />
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                  {post.description}
                </p>
                <span className="text-sm text-gray-400 mt-auto">
                  {post.date}
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
