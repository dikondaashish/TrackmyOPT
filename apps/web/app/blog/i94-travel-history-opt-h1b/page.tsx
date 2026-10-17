import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { i94TravelHistoryOptH1bArticle } from '@/data/blog-series/platform-gaps/i94-travel-history-opt-h1b';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = i94TravelHistoryOptH1bArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
