import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { medicalLeaveMaternityOptStemRulesArticle } from '@/data/blog-series/topic-gaps/medical-leave-maternity-opt-stem-rules';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = medicalLeaveMaternityOptStemRulesArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
