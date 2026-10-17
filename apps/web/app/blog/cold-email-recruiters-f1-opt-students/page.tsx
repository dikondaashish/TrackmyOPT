import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { coldEmailRecruitersF1OptStudentsArticle } from '@/data/blog-series/platform-gaps/cold-email-recruiters-f1-opt-students';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = coldEmailRecruitersF1OptStudentsArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
