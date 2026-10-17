import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { h1bTransferPortabilityWhileOnOptArticle } from '@/data/blog-series/topic-gaps/h1b-transfer-portability-while-on-opt';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = h1bTransferPortabilityWhileOnOptArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
