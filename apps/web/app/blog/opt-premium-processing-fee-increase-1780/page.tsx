import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { editorialRefreshes } from '@/data/blog-series/editorial-refreshes';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = editorialRefreshes.find(
  (item) => item.slug === 'opt-premium-processing-fee-increase-1780'
)!;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
