import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { changeAddressOnOptSevpPortalUscisArticle } from '@/data/blog-series/platform-gaps/change-address-on-opt-sevp-portal-uscis';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = changeAddressOnOptSevpPortalUscisArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
