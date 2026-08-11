import type { BlogProductCtaVariant } from '@/components/blog/BlogProductCTA';

export type ArticleSource = {
  label: string;
  url: string;
  publisher: string;
};

export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  numbered?: string[];
  note?: string;
};

export type ResearchArticle = {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  category: string;
  tags: string[];
  readTime: string;
  publishedDate: string;
  modifiedDate: string;
  directAnswer: string;
  keyTakeaways: string[];
  sections: ArticleSection[];
  checklist: string[];
  mistakes: string[];
  faq: Array<{ question: string; answer: string }>;
  sources: ArticleSource[];
  related: Array<{ label: string; href: string }>;
  cta: BlogProductCtaVariant;
  statusNote?: string;
  dataNote?: string;
  image?: string;
};
