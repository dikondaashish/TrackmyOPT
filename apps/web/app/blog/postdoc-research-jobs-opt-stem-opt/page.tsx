import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { postdocResearchJobsOptStemOptArticle } from '@/data/blog-series/platform-gaps/postdoc-research-jobs-opt-stem-opt';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = postdocResearchJobsOptStemOptArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
