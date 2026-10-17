import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { howToReadH1bSponsorDataLcaArticle } from '@/data/blog-series/platform-gaps/how-to-read-h1b-sponsor-data-lca';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = howToReadH1bSponsorDataLcaArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
