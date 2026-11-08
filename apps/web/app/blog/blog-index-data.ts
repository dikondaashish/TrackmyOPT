import type { BlogHubSlug } from '@/data/blog-hubs';
import type { BlogIndexCard } from './blog-index-types';
import { researchBlogCards } from '@/data/blog-series';
import { blogPostsPartOne } from './blog-index-posts-a';
import { blogPostsPartTwo } from './blog-index-posts-b';

export type { BlogIndexCard } from './blog-index-types';

const structuredSlugs = new Set(researchBlogCards.map((post) => post.slug));

export const blogPosts: BlogIndexCard[] = [
  ...researchBlogCards,
  ...blogPostsPartOne.filter((post) => !structuredSlugs.has(post.slug)),
  ...blogPostsPartTwo.filter((post) => !structuredSlugs.has(post.slug)),
];

export function getPostImage(post: Pick<BlogIndexCard, 'slug' | 'image'>) {
  if (typeof post.image === 'string') return post.image;
  return `/blog/${post.slug}.png`;
}

function cardTime(card: BlogIndexCard) {
  const time = new Date(`${card.date} UTC`).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/** Posts that belong to a hub, newest first. Hub pages read this, not a hand-written list. */
export function getHubPosts(hub: BlogHubSlug): BlogIndexCard[] {
  return blogPosts
    .filter((post) => post.hub === hub)
    .sort((a, b) => cardTime(b) - cardTime(a));
}
