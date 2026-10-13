import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { researchArticleBySlug } from '@/data/blog-series';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = researchArticleBySlug.get(
  'september-2026-f1-fixed-admission-rule-opt'
)!;

export const metadata = createResearchArticleMetadata(article);

export default function PolicyBlogPage() {
  return <ResearchArticlePage article={article} />;
}
