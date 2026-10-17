import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { checkEmployerEVerifyStemOptOfferArticle } from '@/data/blog-series/platform-gaps/check-employer-e-verify-stem-opt-offer';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = checkEmployerEVerifyStemOptOfferArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
