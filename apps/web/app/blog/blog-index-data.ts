import { researchBlogCards } from '@/data/blog-series';
import { blogPostsPartOne } from './blog-index-posts-a';
import { blogPostsPartTwo } from './blog-index-posts-b';

const structuredSlugs = new Set(researchBlogCards.map((post) => post.slug));

export const blogPosts = [
  ...researchBlogCards,
  ...blogPostsPartOne.filter((post) => !structuredSlugs.has(post.slug)),
  ...blogPostsPartTwo.filter((post) => !structuredSlugs.has(post.slug)),
];

export function getPostImage(post: (typeof blogPosts)[number]) {
  if ('image' in post && typeof post.image === 'string') return post.image;
  const slugPath = `/blog/${post.slug}.png`;
  return slugPath;
}
