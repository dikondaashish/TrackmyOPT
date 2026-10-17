import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { staffingConsultingCompaniesOptStemOptArticle } from '@/data/blog-series/platform-gaps/staffing-consulting-companies-opt-stem-opt';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = staffingConsultingCompaniesOptStemOptArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
