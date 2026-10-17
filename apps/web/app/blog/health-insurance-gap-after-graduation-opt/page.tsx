import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { healthInsuranceGapAfterGraduationOptArticle } from '@/data/blog-series/platform-gaps/health-insurance-gap-after-graduation-opt';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = healthInsuranceGapAfterGraduationOptArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
