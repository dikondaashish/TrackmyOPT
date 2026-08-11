import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { researchArticleBySlug, researchArticles } from '@/data/blog-series';

const SITE = 'https://www.trackmyopt.com';

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return researchArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = researchArticleBySlug.get(slug);
  if (!article) return {};

  const canonical = `${SITE}/blog/${article.slug}`;
  const image =
    article.image ?? '/blog/international-student-guidance-library-2026.png';
  const imageUrl = image.startsWith('http') ? image : `${SITE}${image}`;
  const seoTitle = article.seoTitle ?? buildSeoTitle(article.title);
  const metaDescription = trimAtWord(article.description, 158);

  return {
    title: { absolute: seoTitle },
    description: metaDescription,
    keywords: article.tags,
    authors: [{ name: 'Vinay Kumar', url: `${SITE}/about` }],
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      url: canonical,
      publishedTime: article.publishedDate,
      modifiedTime: article.modifiedDate,
      authors: ['Vinay Kumar'],
      images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [imageUrl],
    },
  };
}

function buildSeoTitle(title: string) {
  if (title.length <= 62) return title;
  const [topic, detail] = title.split(':', 2);
  if (!detail || topic.length >= 42) return trimAtWord(title, 62);
  return trimAtWord(`${topic}: ${detail.trim()}`, 62);
}

function trimAtWord(value: string, limit: number) {
  if (value.length <= limit) return value;
  const trimmed = value.slice(0, limit - 1);
  const boundary = trimmed.lastIndexOf(' ');
  const end = boundary > limit * 0.7 ? boundary : trimmed.length;
  return `${trimmed.slice(0, end).trimEnd()}…`;
}

export default async function ResearchBlogPage({ params }: PageProps) {
  const { slug } = await params;
  const article = researchArticleBySlug.get(slug);
  if (!article) notFound();
  return <ResearchArticlePage article={article} />;
}
