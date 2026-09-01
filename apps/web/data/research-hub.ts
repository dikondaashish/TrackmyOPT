import { researchArticles } from '@/data/blog-series';

export type ResearchPost = {
  slug: string;
  number: number;
  category: string;
  title: string;
  teaser: string;
  readTime: string;
  publishedDate: string;
  image: string;
};

export const RESEARCH_POSTS: ResearchPost[] = [
  {
    slug: 'biggest-ats-myths',
    number: 1,
    category: 'Hiring reality',
    title: 'The biggest ATS myths',
    teaser:
      'No, most resumes are not auto-rejected. Here is what actually happens after you hit submit — and which advice to ignore.',
    readTime: '5 min read',
    publishedDate: '2026-09-01',
    image: '/research/biggest-ats-myths.png',
  },
  {
    slug: 'not-getting-interviews',
    number: 2,
    category: 'Resume',
    title: 'Read this if you are not getting interviews',
    teaser:
      'What recruiters actually screen for, what only you can put on the page, and how to use the hours TrackMyOPT saves you.',
    readTime: '8 min read',
    publishedDate: '2026-09-01',
    image: '/research/not-getting-interviews.png',
  },
];

export const RESEARCH_HUB_HERO_IMAGE = '/research/research-hub-hero.png';

export type ResearchBrief = {
  id: string;
  slug?: string;
  title: string;
  subtitle: string;
  category: string;
  publishedDate: string;
  readTime: string;
  featured?: boolean;
  image?: string;
  paragraphs?: string[];
  takeaways?: string[];
  cta?: { label: string; href: string };
};

/** Short on-page briefs — deep dives live at /research/[slug] */
export const RESEARCH_BRIEFS: ResearchBrief[] = [
  {
    id: 'september-hiring-surge-2026',
    slug: 'september-hiring-surge-2026',
    title: 'The September surge is your prep week',
    subtitle:
      'Hiring picks up after Labor Day. If listings feel quiet now, that is normal — use this week to get ready before everyone else floods in.',
    category: 'Career intelligence',
    publishedDate: '2026-09-01',
    readTime: '3 min read',
    featured: true,
    image: '/research/september-hiring-surge-2026.png',
    paragraphs: [
      'If you are on OPT and job hunting right now, you are roughly a week out from the September surge — when managers are back, budgets are fresh, and recruiters try to fill seats before November slows everything down.',
      'Quiet August does not mean a dead market. It means prep week, not panic week. When volume returns, the bottleneck is speed: tailoring, sponsor checks, unemployment tracking, and follow-ups all compete for the same evening.',
      'We built the Chrome extension and job tracker because mass applying from scratch every night does not scale. Save the listing once, track it in one place, and spend the saved time on the resume work in post #2 below.',
    ],
    takeaways: [
      'Prep your target list and sponsor filters now.',
      'Set up your tracker before the surge, not during it.',
      'Unemployment days keep ticking — plan compliance alongside volume.',
    ],
    cta: { label: 'Set up Job Tracker', href: '/features/job-tracker' },
  },
];

export const DATA_RESEARCH_SLUGS = [
  'monthly-opt-ead-processing-times-receipt-date',
  'opt-premium-processing-real-case-timelines-2026',
  'h1b-sponsors-international-new-graduates-2026-2027',
  'longest-opt-job-searches-by-major',
  'common-opt-deadline-mistakes-trackmyopt-audit',
  'f1-221g-social-media-review-tracker-consulate-2026',
] as const;

export function getDataResearchArticles() {
  const bySlug = new Map(researchArticles.map((a) => [a.slug, a]));
  return DATA_RESEARCH_SLUGS.flatMap((slug) => {
    const article = bySlug.get(slug);
    return article ? [article] : [];
  });
}

export function formatResearchDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
}
