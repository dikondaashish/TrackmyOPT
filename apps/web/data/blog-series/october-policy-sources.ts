import type { ArticleSource, ArticleSection } from './types';

export const policySources = {
  graceProposal: {
    label:
      'Eliminating the Discretionary 60-Day Grace Period — September 11 proposed rule',
    publisher: 'DHS / Federal Register',
    url: 'https://www.federalregister.gov/documents/2026/09/11/2026-18631/eliminating-the-discretionary-60-day-grace-period',
  },
  graceCurrent: {
    label: '8 CFR 214.1(l)(2) — current discretionary grace-period regulation',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/subpart-A/section-214.1#p-214.1(l)(2)',
  },
  employerOrder: {
    label: 'September 18 H-1B interagency coordination executive order',
    publisher: 'White House',
    url: 'https://www.whitehouse.gov/presidential-actions/2026/09/enhancing-program-integrity-and-integrity-and-interagency-coordination-in-the-administration-of-the-h-1b-nonimmigrant-visa-program/',
  },
  feeExtension: {
    label: 'September 18 proclamation extending the H-1B entry restrictions',
    publisher: 'White House',
    url: 'https://www.whitehouse.gov/presidential-actions/2026/09/restriction-on-entry-of-certain-nonimmigrant-workers-faad/',
  },
  feeCase: {
    label:
      'Global Nurse Force v. Trump — plaintiffs’ current litigation update',
    publisher: 'Justice Action Center (plaintiffs’ counsel)',
    url: 'https://justiceactioncenter.org/case/gnf-v-trump-h1b-visas/',
  },
  feeUniversity: {
    label: 'October 1 update: extended $100,000 payment remains blocked',
    publisher: 'University of Michigan International Center',
    url: 'https://internationalcenter.umich.edu/about/news/100000-h-1b-executive-order-extended-fee-remains-blocked',
  },
  screening: {
    label:
      'Expanded online presence review — September 18 announcement, effective October 1',
    publisher: 'U.S. Department of State',
    url: 'https://travel.state.gov/content/travel/en/News/visas-news/announcement-of-expanded-screening-and-vetting-for-visa-applicants.html',
  },
  tn: {
    label: 'Visas for Canadian and Mexican USMCA Professional Workers',
    publisher: 'U.S. Department of State',
    url: 'https://travel.state.gov/content/travel/en/us-visas/employment/visas-canadian-mexican-usmca-professional-workers.html',
  },
  permNews: {
    label: 'October 8 announcement on new and pending PERM applications',
    publisher: 'Reuters, republished by Investing.com',
    url: 'https://ca.investing.com/news/stock-market-news/us-freezes-microsoft-adobe-infosys-greencard-applications-over-alleged-fraud-4872243',
  },
  microsoft: {
    label: 'Microsoft’s October 8 response to immigration questions',
    publisher: 'Microsoft (company statement)',
    url: 'https://blogs.microsoft.com/on-the-issues/2026/10/08/microsoft-comment-on-recent-immigration-questions/',
  },
  perm: {
    label: 'Permanent Labor Certification program overview',
    publisher: 'U.S. Department of Labor',
    url: 'https://www.dol.gov/agencies/eta/foreign-labor/programs/permanent',
  },
  permValidity: {
    label:
      '20 CFR 656.30 — certification validity, expiration and invalidation',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-20/chapter-V/part-656/subpart-C/section-656.30',
  },
  i140: {
    label: 'Form I-140, Immigrant Petition for Alien Workers',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-140',
  },
} satisfies Record<string, ArticleSource>;

export function policyVisual(
  id: string,
  alt: string,
  steps: string[]
): NonNullable<ArticleSection['visual']> {
  return {
    src: `/blog/october-policy-2026/${id}.gif`,
    poster: `/blog/october-policy-2026/${id}.png`,
    alt,
    caption: `${alt} Checked October 12, 2026; follow the source links for later changes.`,
    steps,
  };
}

export const policyPublication = {
  publishedDate: '2026-10-12',
  modifiedDate: '2026-10-12',
  newsSitemapEligible: true,
  newsPublishedAt: '2026-10-12T14:03:21Z',
  showContents: true,
  imageCaption:
    'AI-generated conceptual illustration of fictional people; not a photograph of an actual applicant, company meeting, or government action.',
};
