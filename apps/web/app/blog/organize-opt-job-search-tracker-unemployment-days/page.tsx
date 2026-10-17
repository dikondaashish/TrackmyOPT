import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { organizeOptJobSearchTrackerUnemploymentDaysArticle } from '@/data/blog-series/platform-gaps/organize-opt-job-search-tracker-unemployment-days';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = organizeOptJobSearchTrackerUnemploymentDaysArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
