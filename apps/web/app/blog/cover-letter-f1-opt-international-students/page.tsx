import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { coverLetterF1OptInternationalStudentsArticle } from '@/data/blog-series/platform-gaps/cover-letter-f1-opt-international-students';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = coverLetterF1OptInternationalStudentsArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
