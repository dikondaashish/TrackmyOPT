import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { unpaidInternshipOnOptArticle } from '@/data/blog-series/platform-gaps/unpaid-internship-on-opt';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = unpaidInternshipOnOptArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
