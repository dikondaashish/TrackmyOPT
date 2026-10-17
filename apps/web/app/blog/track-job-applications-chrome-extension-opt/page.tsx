import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { trackJobApplicationsChromeExtensionOptArticle } from '@/data/blog-series/platform-gaps/track-job-applications-chrome-extension-opt';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = trackJobApplicationsChromeExtensionOptArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
