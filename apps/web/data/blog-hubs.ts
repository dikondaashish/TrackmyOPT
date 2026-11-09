/**
 * Blog hubs: topic index pages under /blog/hub/<slug> that list the posts
 * carrying the matching `hub` field. See
 * docs/marketing/blog-strategy/2026-11-08-search-gaps-and-blog-architecture.md,
 * section 3. Add a hub here, then set `hub` on the posts that belong to it;
 * the hub page and the blog index read everything else from this record.
 */
export type BlogHubSlug =
  | 'processing-times'
  | 'case-status'
  | 'visa-bulletin'
  | 'opt-rules'
  | 'stem-opt'
  | 'after-opt'
  | 'money-and-life'
  | 'policy-news';

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
      'Start with the monthly processing-time update for the current wait, then open the guide that matches your situation: a biometrics notice, a myProgress estimate that keeps moving, an RFE, or a pending case while you move.',
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
  'visa-bulletin': {
    slug: 'visa-bulletin',
    name: 'Visa Bulletin',
    title: 'Visa Bulletin: monthly predictions and what moved',
    seoTitle: 'Visa Bulletin Predictions 2026: Every Monthly Guide',
    description:
      'Monthly Visa Bulletin predictions and breakdowns for EB-1, EB-2 and EB-3, in English and Spanish, plus the PERM and EB-2 NIW steps that set your place in line.',
    intro:
      'Open the newest month first to see what moved and what held. The State Department publishes the bulletin, and USCIS names the chart to use for adjustment filings each month. The older months show the trend over the fiscal year.',
    cta: 'case-status',
  },
  'opt-rules': {
    slug: 'opt-rules',
    name: 'OPT rules',
    title: 'OPT rules: unemployment days, reporting and employment',
    seoTitle: 'OPT Rules: Unemployment Days, Reporting and Work Guides',
    description:
      'How the 90-day OPT unemployment limit is counted, what counts as qualifying work, what to report in the SEVP Portal or to your DSO, and how the grace period works after OPT.',
    intro:
      'Start with the 90-day unemployment rule and the guide to when the clock starts. Then read the reporting guides, since a new name, address or employer generally must be reported within 10 days. Your DSO and the regulations are the official word; these guides explain them in plain language.',
    cta: 'case-status',
  },
  'stem-opt': {
    slug: 'stem-opt',
    name: 'STEM OPT',
    title: 'STEM OPT: the 24-month extension, Form I-983 and employer rules',
    seoTitle: 'STEM OPT Guides: I-983, E-Verify, Extension and Reports',
    description:
      'How the 24-month STEM OPT extension works, what Form I-983 needs, why your employer must use E-Verify, and how validation reports, site visits and job changes work.',
    intro:
      'Start with the extension guide and check that your degree qualifies. Read the employer and Form I-983 guides before you accept an offer. The later guides cover the validation report due every six months, material changes and changing employers.',
    cta: 'case-status',
  },
  'after-opt': {
    slug: 'after-opt',
    name: 'After OPT',
    title: 'After OPT: H-1B, cap-gap, green card and other work visas',
    seoTitle: 'After OPT: H-1B, Cap-Gap, Green Card and Work Visa Guides',
    description:
      'Your options when OPT or STEM OPT ends: the H-1B lottery and cap-gap, cap-exempt employers, change of status, green card routes, and TN, O-1 and L-1 visas.',
    intro:
      'Start with the OPT to H-1B guide and the cap-gap explainer, since H-1B is a common next step. If the lottery does not work out, the cap-exempt and alternative-visa guides show other paths. Talk to an immigration attorney before you rely on any one route.',
    cta: 'case-status',
  },
  'money-and-life': {
    slug: 'money-and-life',
    name: 'Money and life',
    title: 'Money and life on OPT: taxes, SSN, insurance, credit and housing',
    seoTitle: 'Money and Life on OPT: Taxes, SSN, Insurance and Credit',
    description:
      'Practical guides for life on F-1 and OPT: filing taxes as a nonresident, getting an SSN, health insurance after graduation, building credit, renting, buying a car and banking.',
    intro:
      'Start with the tax filing guide, because your tax status can change after your first few years in the U.S. Then use the SSN and credit guides to set up your finances. The IRS and SSA are the official sources; these guides are general information, not tax advice.',
    cta: 'case-status',
  },
  'policy-news': {
    slug: 'policy-news',
    name: 'Policy news',
    title: 'Immigration policy news for F-1, OPT and H-1B',
    seoTitle: 'F-1, OPT and H-1B Policy News: Reviewed Updates',
    description:
      'Reviewed news on proposed rules, court cases, fees and screening changes that affect F-1 students, OPT and STEM OPT workers, and H-1B applicants.',
    intro:
      'A proposed rule is not a final rule, and court orders can change quickly. Each post says what was known on its date and links to official sources where they exist. Check the Federal Register, USCIS and your DSO before you act on any news.',
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
