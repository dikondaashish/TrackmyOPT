import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { h1bChangeOfStatusVsConsularProcessingOptArticle } from '@/data/blog-series/topic-gaps/h1b-change-of-status-vs-consular-processing-opt';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = h1bChangeOfStatusVsConsularProcessingOptArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
