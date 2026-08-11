import { currentUpdateArticles } from './current-updates';
import { dataResearchArticles } from './data-research';
import { statusAndEmploymentArticles } from './status-and-employment';
import { taxArticles } from './tax';
import type { ResearchArticle } from './types';

export const researchArticles: ResearchArticle[] = [
  ...currentUpdateArticles,
  ...statusAndEmploymentArticles,
  ...taxArticles,
  ...dataResearchArticles,
];

export const researchArticleBySlug = new Map(
  researchArticles.map((article) => [article.slug, article])
);

export const researchBlogCards = researchArticles.map((article, index) => ({
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
