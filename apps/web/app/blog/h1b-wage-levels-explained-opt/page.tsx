import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { h1bWageLevelsExplainedOptArticle } from '@/data/blog-series/platform-gaps/h1b-wage-levels-explained-opt';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = h1bWageLevelsExplainedOptArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
