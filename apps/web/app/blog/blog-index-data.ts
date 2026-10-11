import { researchBlogCards } from '@/data/blog-series';
import { blogPostsPartOne } from './blog-index-posts-a';
import { blogPostsPartTwo } from './blog-index-posts-b';

const structuredSlugs = new Set(researchBlogCards.map((post) => post.slug));

export const blogPosts = [
  ...researchBlogCards,
  ...blogPostsPartOne.filter((post) => !structuredSlugs.has(post.slug)),
  ...blogPostsPartTwo.filter((post) => !structuredSlugs.has(post.slug)),
];

export const CATEGORY_COLORS: Record<string, string> = {
  'OPT Basics':
    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  USCIS: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'STEM OPT':
    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'H-1B':
    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  Careers:
    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  Important: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'Tax & Finance':
    'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  Health: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  'Finance & Compliance':
    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
};

export function getPostImage(post: (typeof blogPosts)[number]) {
  if ('image' in post && typeof post.image === 'string') return post.image;
  const slugPath = `/blog/${post.slug}.png`;
  return slugPath;
}
