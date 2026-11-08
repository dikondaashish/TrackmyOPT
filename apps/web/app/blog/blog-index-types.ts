import type { BlogHubSlug } from '@/data/blog-hubs';

export type BlogIndexCard = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  /** Display date, e.g. "November 8, 2026". */
  date: string;
  tags: string[];
  featured?: boolean;
  image?: string;
  /** Topic hub (/blog/hub/<hub>) that lists this post. */
  hub?: BlogHubSlug;
};
