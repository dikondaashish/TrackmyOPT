import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { interviewPrepInternationalStudentsOptArticle } from '@/data/blog-series/platform-gaps/interview-prep-international-students-opt';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = interviewPrepInternationalStudentsOptArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
