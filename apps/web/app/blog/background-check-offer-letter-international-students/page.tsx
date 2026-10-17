import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { backgroundCheckOfferLetterInternationalStudentsArticle } from '@/data/blog-series/platform-gaps/background-check-offer-letter-international-students';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = backgroundCheckOfferLetterInternationalStudentsArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
