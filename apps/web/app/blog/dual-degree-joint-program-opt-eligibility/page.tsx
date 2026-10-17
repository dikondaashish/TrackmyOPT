import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { dualDegreeJointProgramOptEligibilityArticle } from '@/data/blog-series/topic-gaps/dual-degree-joint-program-opt-eligibility';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = dualDegreeJointProgramOptEligibilityArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
