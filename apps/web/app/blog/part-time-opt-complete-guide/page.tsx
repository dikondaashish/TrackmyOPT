import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { partTimeOptCompleteGuideArticle } from '@/data/blog-series/topic-gaps/part-time-opt-complete-guide';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = partTimeOptCompleteGuideArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
