import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { unemploymentBenefitsOnOptArticle } from '@/data/blog-series/platform-gaps/unemployment-benefits-on-opt';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = unemploymentBenefitsOnOptArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
