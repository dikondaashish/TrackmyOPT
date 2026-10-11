import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { researchArticleBySlug, researchArticles } from '@/data/blog-series';

import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

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

  return createResearchArticleMetadata(article);
}

export default async function ResearchBlogPage({ params }: PageProps) {
  const { slug } = await params;
  const article = researchArticleBySlug.get(slug);
  if (!article) notFound();
  return <ResearchArticlePage article={article} />;
}
