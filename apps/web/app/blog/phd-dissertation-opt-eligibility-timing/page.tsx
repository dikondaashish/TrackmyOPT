import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { phdDissertationOptEligibilityTimingArticle } from '@/data/blog-series/topic-gaps/phd-dissertation-opt-eligibility-timing';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = phdDissertationOptEligibilityTimingArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
