import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { optOnlineHybridProgramEligibilityArticle } from '@/data/blog-series/topic-gaps/opt-online-hybrid-program-eligibility';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = optOnlineHybridProgramEligibilityArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
