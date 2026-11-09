import { BLOG_HUBS, type BlogHubSlug } from '@/data/blog-hubs';

/**
 * One topic label per post (plan section 3, rule 1).
 *
 * Posts were written over months with about 70 free-text category labels.
 * Readers see one of the ten hub names instead. The original `category` field is left
 * untouched in the data; this module only decides what is displayed.
 *
 * Order of precedence: the post's hub, then a per-slug override, then the
 * label map. Non-English posts keep their own label. The test in
 * data/blog-categories.test.ts fails when a post uses a label that is not
 * mapped here, so a new label has to be placed deliberately.
 */

const hub = (slug: BlogHubSlug) => BLOG_HUBS[slug].name;

export const CAREERS = hub('careers');

const LABEL_TO_TOPIC: Record<string, string> = {
  // Waiting on USCIS
  'USCIS Timing': hub('processing-times'),
  'TrackMyOPT Data': hub('processing-times'),
  USCIS: hub('case-status'),
  'USCIS and EAD': hub('case-status'),
  'USCIS Online Filing': hub('case-status'),
  'Case Tracking': hub('case-status'),
  // Visa Bulletin
  'Green Card Outlook': hub('visa-bulletin'),
  // F-1 status, visas and travel
  Academics: hub('f1-status'),
  'F-1 Basics': hub('f1-status'),
  'F-1 Compliance': hub('f1-status'),
  'F-1 Employment': hub('f1-status'),
  'F-1 Status': hub('f1-status'),
  'F-1 Travel': hub('f1-status'),
  'F-1 Visa': hub('f1-status'),
  Travel: hub('f1-status'),
  'Visa Types': hub('f1-status'),
  'J-1 Visa': hub('f1-status'),
  'Dependent Visas': hub('f1-status'),
  // OPT rules
  'OPT Basics': hub('opt-rules'),
  OPT: hub('opt-rules'),
  'OPT Rules': hub('opt-rules'),
  'OPT Application': hub('opt-rules'),
  'OPT Deadline': hub('opt-rules'),
  'OPT Employment': hub('opt-rules'),
  'OPT Employment Rules': hub('opt-rules'),
  'OPT Work Authorization': hub('opt-rules'),
  'OPT Recordkeeping': hub('opt-rules'),
  'OPT Compliance': hub('opt-rules'),
  'Work Rules': hub('opt-rules'),
  Compliance: hub('opt-rules'),
  'Visa Rules': hub('opt-rules'),
  Layoffs: hub('opt-rules'),
  // STEM OPT
  'STEM OPT': hub('stem-opt'),
  'STEM OPT Compliance': hub('stem-opt'),
  'STEM OPT Employer Issues': hub('stem-opt'),
  // After OPT
  'H-1B': hub('after-opt'),
  'Work Visas': hub('after-opt'),
  'Green Card': hub('after-opt'),
  // Money and life
  'Tax & Finance': hub('money-and-life'),
  'F-1 Taxes': hub('money-and-life'),
  'OPT Taxes': hub('money-and-life'),
  Finance: hub('money-and-life'),
  'Finance & Compliance': hub('money-and-life'),
  'Life in US': hub('money-and-life'),
  'Student Life': hub('money-and-life'),
  Health: hub('money-and-life'),
  'Health Insurance': hub('money-and-life'),
  'Mental Health': hub('money-and-life'),
  // Policy news
  'Breaking News': hub('policy-news'),
  'Critical USCIS Update': hub('policy-news'),
  'Compliance Update': hub('policy-news'),
  'Visa Policy Update': hub('policy-news'),
  'Visa Screening Update': hub('policy-news'),
  'Travel Update': hub('policy-news'),
  'F-1 Policy Update': hub('policy-news'),
  'H-1B Policy Update': hub('policy-news'),
  'H-1B Policy': hub('policy-news'),
  'Green Card Update': hub('policy-news'),
  'Green Card News': hub('policy-news'),
  'USCIS Fees': hub('policy-news'),
  // Careers
  Careers: CAREERS,
  Career: CAREERS,
  'Career Search': CAREERS,
  'Career Planning': CAREERS,
  'Career Paths': CAREERS,
  'Career Advice': CAREERS,
  'TrackMyOPT Research': CAREERS,
  'Research Launch': hub('policy-news'),
};

/** "Important" was used for unrelated posts, so each one is placed by slug. */
const SLUG_OVERRIDES: Record<string, string> = {
  'hsi-opt-fraud-crackdown-legitimate-students-guide': hub('opt-rules'),
  'is-opt-ending-dhs-rule-2026': hub('policy-news'),
  'uscis-green-card-adjustment-of-status-update-2026': hub('policy-news'),
  'opt-stem-opt-legislation-congress-2026': hub('policy-news'),
  'opt-cpt-enforcement-scrutiny-2026': hub('policy-news'),
  'day-1-cpt-vs-opt': hub('opt-rules'),
  'fall-out-of-f1-status-options': hub('f1-status'),
};

/** Labels on Spanish and Korean posts stay in their own language. */
const NON_ENGLISH_LABELS = new Set(['Boletín de visas', 'Tiempos de procesamiento', '영주권 문호']);

export const TOPIC_LABELS: string[] = Object.values(BLOG_HUBS).map((h) => h.name);

type Categorised = { slug: string; category: string; hub?: BlogHubSlug };

/** The topic label to display, or null when the label has not been mapped yet. */
export function resolveTopicLabel(post: Categorised): string | null {
  if (post.hub) return BLOG_HUBS[post.hub].name;
  if (SLUG_OVERRIDES[post.slug]) return SLUG_OVERRIDES[post.slug]!;
  if (NON_ENGLISH_LABELS.has(post.category)) return post.category;
  return LABEL_TO_TOPIC[post.category] ?? null;
}

/** Display label: the topic, falling back to the original label if unmapped. */
export function topicLabel(post: Categorised): string {
  return resolveTopicLabel(post) ?? post.category;
}
