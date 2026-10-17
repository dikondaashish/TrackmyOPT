import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { reducedCourseLoadF1OptImpactArticle } from '@/data/blog-series/topic-gaps/reduced-course-load-f1-opt-impact';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = reducedCourseLoadF1OptImpactArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
