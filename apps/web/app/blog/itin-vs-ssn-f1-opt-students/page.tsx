import { ResearchArticlePage } from '@/components/blog/ResearchArticlePage';
import { itinVsSsnF1OptStudentsArticle } from '@/data/blog-series/topic-gaps/itin-vs-ssn-f1-opt-students';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';

const article = itinVsSsnF1OptStudentsArticle;

export const metadata = createResearchArticleMetadata(article);

export default function BlogPage() {
  return <ResearchArticlePage article={article} />;
}
