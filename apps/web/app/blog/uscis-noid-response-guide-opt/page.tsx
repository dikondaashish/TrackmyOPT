import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { uscisNoidResponseGuideOptArticle } from '@/data/blog-series/topic-gaps/uscis-noid-response-guide-opt';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = uscisNoidResponseGuideOptArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
