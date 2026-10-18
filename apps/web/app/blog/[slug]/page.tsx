import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { researchArticleBySlug, researchArticles } from '@/data/blog-series';
import { loadAutoPost } from '@/lib/policy-news/store';

import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

type PageProps = { params: Promise<{ slug: string }> };

// Slugs outside generateStaticParams are automatic policy-news posts, rendered
// on first visit and cached. The cron revalidates a slug when it publishes.
export const dynamicParams = true;
export const revalidate = 3600;

export function generateStaticParams() {
  return researchArticles.map(({ slug }) => ({ slug }));
}

async function findArticle(slug: string) {
  return researchArticleBySlug.get(slug) ?? (await loadAutoPost(slug));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await findArticle(slug);
  if (!article) return {};

  return createResearchArticleMetadata(article);
}

export default async function ResearchBlogPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await findArticle(slug);
  if (!article) notFound();
  return <ResearchArticlePage article={article} />;
}
