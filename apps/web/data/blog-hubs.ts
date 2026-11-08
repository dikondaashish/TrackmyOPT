/**
 * Blog hubs: topic index pages under /blog/hub/<slug> that list the posts
 * carrying the matching `hub` field. See
 * docs/marketing/blog-strategy/2026-11-08-search-gaps-and-blog-architecture.md,
 * section 3. Add a hub here, then set `hub` on the posts that belong to it;
 * the hub page and the blog index read everything else from this record.
 */
export type BlogHubSlug = 'processing-times' | 'case-status';

export type BlogHub = {
  slug: BlogHubSlug;
  /** Short name used in navigation and breadcrumbs. */
  name: string;
  /** H1 on the hub page. */
  title: string;
  /** Title tag (keep under 60 characters). */
  seoTitle: string;
  /** Meta description and the lead paragraph. */
  description: string;
  /** A second paragraph that tells the reader what to open first. */
  intro: string;
  /** Hub pages always end on the case-status sign-up CTA (the one that converts). */
  cta: 'case-status';
};

export const BLOG_HUBS: Record<BlogHubSlug, BlogHub> = {
  'processing-times': {
    slug: 'processing-times',
    name: 'Processing times',
    title: 'Waiting on USCIS: OPT and EAD processing times',
    seoTitle: 'OPT & EAD Processing Times 2026: Every Guide in One Place',
    description:
      'How long OPT, STEM OPT and other I-765 cases take in 2026, what happens after biometrics, when premium processing is worth it, and what to do when a case is late.',
    intro:
      'Start with the monthly processing-time update for the current wait, then open the guide that matches your situation: a biometrics notice, a myProgress estimate that keeps moving, a pending case while you move, or a start date that USCIS may miss.',
    cta: 'case-status',
  },
  'case-status': {
    slug: 'case-status',
    name: 'Case status',
    title: 'USCIS case status: receipt numbers, status messages and card tracking',
    seoTitle: 'USCIS Case Status Guides: Receipts, Statuses, EAD Cards',
    description:
      'Check an I-765, I-140, H-4 EAD or other USCIS case by receipt number, understand IOE and service-center receipts, decode every status message, and track the card to your door.',
    intro:
      'Begin with the case status tracking guide, then use the receipt-number and EAD card guides when a number will not work or a card is late. The I-140 and H-4 guides cover the cases that follow OPT.',
    cta: 'case-status',
  },
};

export const BLOG_HUB_SLUGS = Object.keys(BLOG_HUBS) as BlogHubSlug[];

export function isBlogHubSlug(value: string): value is BlogHubSlug {
  return value in BLOG_HUBS;
}

export function blogHubPath(slug: BlogHubSlug) {
  return `/blog/hub/${slug}`;
}
