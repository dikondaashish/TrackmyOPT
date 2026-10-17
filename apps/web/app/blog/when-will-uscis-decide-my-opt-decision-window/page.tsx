import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { whenWillUscisDecideMyOptDecisionWindowArticle } from '@/data/blog-series/platform-gaps/when-will-uscis-decide-my-opt-decision-window';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = whenWillUscisDecideMyOptDecisionWindowArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
