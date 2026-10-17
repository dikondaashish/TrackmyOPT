import { trackingGuides } from './tracking-guides';
import { editorialRefreshes } from './editorial-refreshes';
import { currentUpdateArticles } from './current-updates';
import { dataResearchArticles } from './data-research';
import { statusAndEmploymentArticles } from './status-and-employment';
import { taxArticles } from './tax';
import { topicGapGuidesOctober2026 } from './topic-gaps';
import type { ResearchArticle } from './types';

/** Served by `app/blog/[slug]` — exclude articles that have their own static page.tsx */
export const researchArticles: ResearchArticle[] = [
  ...trackingGuides,
  ...currentUpdateArticles,
  ...statusAndEmploymentArticles,
  ...taxArticles,
  ...dataResearchArticles,
];

export const researchArticleBySlug = new Map(
  [
    ...researchArticles,
    ...editorialRefreshes,
    ...topicGapGuidesOctober2026,
  ].map((article) => [article.slug, article])
);

export const researchBlogCards = [
  ...topicGapGuidesOctober2026,
  ...researchArticles,
  ...editorialRefreshes,
].map((article, index) => ({
  slug: article.slug,
  title: article.title,
  description: article.description,
  category: article.category,
  readTime: article.readTime,
  date: new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${article.publishedDate}T00:00:00Z`)),
  tags: article.tags,
  featured: index < 4,
  image:
    article.image ?? '/blog/international-student-guidance-library-2026.png',
}));

export type { ResearchArticle } from './types';
export { topicGapGuidesOctober2026 } from './topic-gaps';
