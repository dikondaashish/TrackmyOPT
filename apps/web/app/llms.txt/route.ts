import { blogPosts } from '@/app/blog/blog-index-data';
import { getPublicBlogRoutes } from '@/lib/blog-routes';

const BASE_URL = 'https://www.trackmyopt.com';

// Generated at build time from the blog index so new posts are listed automatically.
export const dynamic = 'force-static';

const TOOLS = [
  [
    'OPT Decision Window',
    '/tools/opt-decision-window',
    'Free planning estimate of when USCIS may decide an OPT or STEM OPT I-765, based on completed community-reported cases (median and middle-50% range, with sample size). Not a USCIS decision date.',
  ],
  [
    'OPT filing window calculator',
    '/tools/opt-apply',
    'When to file Form I-765 for post-completion OPT, with a checklist.',
  ],
  [
    'OPT unemployment clock',
    '/tools/opt-clock',
    'Counts used and remaining days against the 90-day post-completion OPT unemployment limit.',
  ],
  [
    'STEM OPT filing window calculator',
    '/tools/stem-apply',
    'STEM OPT extension filing window, Form I-983, and E-Verify planning.',
  ],
  [
    'STEM OPT unemployment clock',
    '/tools/stem-clock',
    'Tracks the combined 150-day OPT and STEM OPT unemployment limit.',
  ],
  [
    'E-Verify employer search',
    '/e-verify-employer-search',
    'Embeds the official USCIS E-Verify employer search with plain-English STEM OPT notes.',
  ],
] as const;

const FEATURES = [
  [
    'USCIS case status tracking',
    '/features/case-status',
    'Save a receipt for manual checks (free); Pro adds daily checks and status-change alerts.',
  ],
  [
    'H-1B sponsor database',
    '/features/sponsors',
    'Employer profiles from Department of Labor LCA data: job titles, wage levels, worksites, and multi-year trends. Historical data, not a promise of sponsorship.',
  ],
  [
    'Job tracker and Chrome extension',
    '/features/extension',
    'Save postings from job boards and ATS portals to a job tracker; flags explicit sponsorship wording; never auto-submits applications.',
  ],
  [
    'Resume and ATS tools',
    '/features/resume-ai',
    'ATS-friendly resume builder and scanner for international students.',
  ],
  [
    'Health insurance options',
    '/features/health-insurance',
    'Compare OPT health insurance options and state program eligibility.',
  ],
  [
    'F-1 tax filing guidance',
    '/features/tax-filing',
    'Which tax forms nonresident F-1 students and OPT workers usually need.',
  ],
  ['Pricing', '/pricing', 'Free tools plus optional Pro plans.'],
] as const;

// Ordered: the first matching rule decides the section a category lands in.
const SECTIONS: Array<[string, RegExp]> = [
  ['Policy updates and news', /news|update|policy|launch/i],
  ['STEM OPT', /stem/i],
  [
    'H-1B, green card, and other visas',
    /h-1b|green card|work visas|visa types|j-1|dependent/i,
  ],
  ['Taxes and money', /tax|finance/i],
  ['Careers and job search', /career/i],
  [
    'Applications, USCIS, and case tracking',
    /uscis|case|application|deadline|timing/i,
  ],
  ['Travel and visa stamps', /travel|visa/i],
  ['Health and life in the US', /health|life|student life|mental/i],
];
const DEFAULT_SECTION = 'OPT rules and compliance';

function sectionFor(category: string): string {
  return (
    SECTIONS.find(([, rule]) => rule.test(category))?.[0] ?? DEFAULT_SECTION
  );
}

function line(title: string, path: string, description: string): string {
  return `- [${title}](${BASE_URL}${path}): ${description.replace(/\s+/g, ' ').trim()}`;
}

export function GET(): Response {
  const liveRoutes = new Set(getPublicBlogRoutes());
  const seen = new Set<string>();
  const bySection = new Map<string, string[]>();

  for (const post of blogPosts) {
    const path = `/blog/${post.slug}`;
    if (!liveRoutes.has(path) || seen.has(post.slug)) continue;
    seen.add(post.slug);
    const section = sectionFor(post.category);
    const entries = bySection.get(section) ?? [];
    entries.push(line(post.title, path, post.description));
    bySection.set(section, entries);
  }

  const guideSections = [DEFAULT_SECTION, ...SECTIONS.map(([name]) => name)]
    .filter((name) => bySection.has(name))
    .map((name) => `### ${name}\n\n${bySection.get(name)!.join('\n')}`)
    .join('\n\n');

  const body = `# TrackMyOPT

> TrackMyOPT helps F-1 international students in the United States manage Optional Practical Training (OPT) and the STEM OPT extension: filing windows, USCIS case status, unemployment-day limits, compliance reporting, and the job search toward H-1B. Guides are educational and are not legal advice; official sources (USCIS, SEVP / Study in the States, DOL, IRS) control.

Key facts:
- Post-completion OPT allows up to 90 days of unemployment; a STEM OPT extension adds 60 days (150 total).
- STEM OPT requires an employer enrolled in E-Verify and a signed Form I-983 training plan.
- TrackMyOPT estimates and community data are planning aids, not USCIS decisions.

## Free tools

${TOOLS.map(([t, p, d]) => line(t, p, d)).join('\n')}

## Product features

${FEATURES.map(([t, p, d]) => line(t, p, d)).join('\n')}

## Guides

${guideSections}

## Optional

- [Blog index](${BASE_URL}/blog): All guides.
- [FAQ](${BASE_URL}/faq): Common OPT and product questions.
- [Glossary](${BASE_URL}/glossary): OPT, STEM OPT, and H-1B terms.
- [Sitemap](${BASE_URL}/sitemap.xml): Every public URL.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
