import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { immigrationDocumentsToKeepOnOptArticle } from '@/data/blog-series/platform-gaps/immigration-documents-to-keep-on-opt';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = immigrationDocumentsToKeepOnOptArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
