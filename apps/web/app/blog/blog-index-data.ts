import type { BlogHubSlug } from '@/data/blog-hubs';
import type { BlogIndexCard } from './blog-index-types';
import { researchBlogCards } from '@/data/blog-series';
import { blogPostsPartOne } from './blog-index-posts-a';
import { blogPostsPartTwo } from './blog-index-posts-b';

export type { BlogIndexCard } from './blog-index-types';

const structuredSlugs = new Set(researchBlogCards.map((post) => post.slug));

/**
 * Hub membership for posts written before their hub existed (Careers and
 * F-1 status were added on 2026-11-09). Posts in these lists carry no `hub`
 * field of their own; the test in data/blog-hubs.test.ts checks that each
 * slug exists and is not already in another hub. New posts set `hub` on the
 * post itself instead.
 */
export const LATER_HUB_MEMBERS: Partial<Record<BlogHubSlug, readonly string[]>> = {
  'f1-status': [
    'isss-dso-pdso-meaning',
    'sevis-id-where-to-find',
    'opt-travel-signature-i20',
    'renewing-f1-visa-on-opt',
    'i94-travel-history-opt-h1b',
    'fall-out-of-f1-status-options',
    'sevis-terminated-reasons-recovery-options',
    'f1-reinstatement-i539-vs-reentry',
    'f1-visa-status-i20-i94-differences',
    'f1-five-month-rule-travel-study-break',
    'wrong-i94-f1-student-correction',
    'automatic-visa-revalidation-f1-canada-mexico',
    'cbp-secondary-inspection-f1-students',
    'f1-visa-221g-administrative-processing-2026',
    'reduced-course-load-f1-opt-impact',
  ],
  careers: [
    'how-to-answer-sponsorship-question',
    'ats-resume-international-students-2026',
    'f1-visa-jobs-guide',
    'cold-email-recruiters-f1-opt-students',
    'cover-letter-f1-opt-international-students',
    'interview-prep-international-students-opt',
    'linkedin-optimization-f1-h1b-sponsorship',
    'networking-international-student-sponsorship',
    'salary-negotiation-international-workers-opt',
    'background-check-offer-letter-international-students',
    'organize-opt-job-search-tracker-unemployment-days',
    'track-job-applications-chrome-extension-opt',
    'opt-non-stem-majors-guide',
    'opt-mba-students-career-paths',
    'longest-opt-job-searches-by-major',
  ],
};

const laterHubBySlug = new Map<string, BlogHubSlug>(
  Object.entries(LATER_HUB_MEMBERS).flatMap(([hub, slugs]) =>
    (slugs ?? []).map((slug) => [slug, hub as BlogHubSlug] as const)
  )
);

function withLaterHub(post: BlogIndexCard): BlogIndexCard {
  const hub = laterHubBySlug.get(post.slug);
  return hub && !post.hub ? { ...post, hub } : post;
}

export const blogPosts: BlogIndexCard[] = [
  ...researchBlogCards,
  ...blogPostsPartOne.filter((post) => !structuredSlugs.has(post.slug)),
  ...blogPostsPartTwo.filter((post) => !structuredSlugs.has(post.slug)),
].map(withLaterHub);

export function getPostImage(post: Pick<BlogIndexCard, 'slug' | 'image'>) {
  if (typeof post.image === 'string') return post.image;
  return `/blog/${post.slug}.png`;
}

export function cardTime(card: Pick<BlogIndexCard, 'date'>) {
  const time = new Date(`${card.date} UTC`).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/** Newest first; posts with the same date keep their input order. */
export function sortNewestFirst<T extends Pick<BlogIndexCard, 'date'>>(cards: readonly T[]): T[] {
  return [...cards].sort((a, b) => cardTime(b) - cardTime(a));
}

/** Posts that belong to a hub, newest first. Hub pages read this, not a hand-written list. */
export function getHubPosts(hub: BlogHubSlug): BlogIndexCard[] {
  return sortNewestFirst(blogPosts.filter((post) => post.hub === hub));
}

/**
 * "Most useful" guides on the blog index. These are the waiting-on-USCIS
 * pages that bring most sign-ups (see the Nov 2026 search-gap plan), plus
 * the two rule guides readers ask about most. Keep it to six.
 */
export const ESSENTIAL_GUIDE_SLUGS = [
  'opt-processing-time-2026',
  'stem-opt-processing-time-2026',
  'uscis-case-status-tracking-guide',
  'opt-premium-processing-timeline-2026',
  '90-day-unemployment-rule-opt',
  'opt-to-h1b-transition',
] as const;
