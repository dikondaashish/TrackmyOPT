import { platformGap, platformSources } from './shared';

export const h1bWageLevelsExplainedOptArticle = platformGap({
  slug: 'h1b-wage-levels-explained-opt',
  title: 'H-1B Wage Levels I–IV Explained for OPT Job Seekers',
  seoTitle: 'H-1B Wage Levels I–IV Explained for OPT Students',
  description:
    'What H-1B prevailing wage levels mean, how employers choose them, how to look up the wage for your role and city, and how wage level affects your odds under weighted H-1B selection.',
  category: 'H-1B',
  tags: [
    'H-1B wage levels',
    'prevailing wage',
    'weighted selection',
    'OPT to H-1B',
  ],
  readTime: '9 min read',
  cta: 'sponsors',
  imageAlt:
    'Illustrated four-step bar chart where each taller bar has one more dot',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'Every H-1B petition is tied to a prevailing wage level, from Level I (entry) to Level IV (fully competent), for your occupation and work location. The employer picks the level based on the job’s requirements, such as education, experience, and responsibility, and must pay at least that wage. Under the weighted H-1B selection process used from FY2027, a registration gets more lottery entries the higher the wage level it qualifies for: one entry at Level I, up to four at Level IV. So the offered salary, not just the job title, affects your odds.',
  keyTakeaways: [
    'Wage levels are set for each occupation and geographic area.',
    'The level reflects the job’s requirements, not your personal talent.',
    'Weighted selection gives higher-level registrations more entries.',
    'You can look up prevailing wages yourself on DOL’s wage search.',
  ],
  sections: [
    {
      heading: 'What the four levels mean',
      bullets: [
        'Level I: entry-level roles that need a basic understanding of the duties and close supervision.',
        'Level II: qualified roles with some experience and limited judgment.',
        'Level III: experienced roles with special skills and independent judgment.',
        'Level IV: fully competent roles with advanced skills, often supervisory.',
      ],
      paragraphs: [
        'The levels come from DOL wage data for an occupation (SOC code) in a specific metropolitan area. The same job pays a different Level II wage in San Francisco than in Austin.',
      ],
      sources: [platformSources.wageLevels],
    },
    {
      heading: 'How employers choose a level',
      paragraphs: [
        'Employers, often with immigration counsel, compare the job’s requirements with DOL guidance: required degree, years of experience, special skills, and supervisory duties. A role that requires a master’s degree and two years of experience may land at a higher level than one that requires only a bachelor’s degree.',
        'The employer must then pay at least the higher of the prevailing wage or its actual wage for similar workers.',
      ],
    },
    {
      heading: 'Why the level matters more now',
      paragraphs: [
        'Weighted selection, used from the FY2027 cap season, gives each registration a number of lottery entries based on the highest wage level the offered salary meets: Level IV gets four entries, Level III three, Level II two, and Level I one. New graduates offered Level I salaries still have a chance, but it is lower than under the old random lottery.',
      ],
      links: [
        {
          label: 'FY2027 H-1B weighted selection process',
          href: '/blog/h1b-weighted-selection-process-fy2027',
        },
        {
          label: 'DOL prevailing wage changes and H-1B impact',
          href: '/blog/dol-prevailing-wage-hikes-h1b-impact-2026',
        },
      ],
      sources: [platformSources.h1bCap],
    },
    {
      heading: 'How to look up your prevailing wage',
      numbered: [
        'Find the closest occupation (SOC code) for your role.',
        'Open the DOL wage search and choose your work area.',
        'Compare the four wage levels with your offer.',
        'Note which level your salary meets or exceeds.',
      ],
      paragraphs: [
        'You can also check the wage levels employers used in real filings. TrackMyOPT sponsor profiles show offered wages and prevailing wage levels from DOL LCA data.',
      ],
      links: [
        {
          label: 'How to read H-1B sponsor data',
          href: '/blog/how-to-read-h1b-sponsor-data-lca',
        },
      ],
    },
    {
      heading: 'Using wage levels in salary negotiation',
      paragraphs: [
        'If your offer sits just below the next wage level, a small raise may give your registration an extra entry. Raise it carefully and factually: “The Level II wage for this role in this area is X. Would the team consider matching it?” Employers decide the level based on the job’s requirements, so do not ask anyone to misstate duties.',
      ],
      links: [
        {
          label: 'Salary negotiation for international workers',
          href: '/blog/salary-negotiation-international-workers-opt',
        },
      ],
    },
    {
      heading: 'Fictional example: one offer, two cities',
      paragraphs: [
        'Omar is fictional. He receives the same software developer salary offer for two offices. In the lower-cost city, the salary meets the Level III wage; in the higher-cost city, only Level I. He discusses both with the employer, understanding that the location affects his H-1B registration weight.',
      ],
    },
  ],
  checklist: [
    'Identify the SOC code that fits your role.',
    'Look up prevailing wages for your work location.',
    'Compare your offer with each level.',
    'Ask how the employer plans to classify the role.',
    'Negotiate factually if you are close to the next level.',
  ],
  mistakes: [
    'Assuming wage level reflects your personal skill.',
    'Comparing wages across cities without adjusting for location.',
    'Asking an employer to inflate job requirements.',
    'Ignoring wage level when comparing offers.',
  ],
  faq: [
    {
      question: 'Who decides my H-1B wage level?',
      answer:
        'Your employer, based on the job’s requirements and DOL guidance, usually with immigration counsel.',
    },
    {
      question: 'Can a new graduate get a Level II or higher?',
      answer:
        'Yes, if the salary meets that level’s prevailing wage and the role’s requirements support it. This is more common in some fields and cities.',
    },
    {
      question: 'Where can I check prevailing wages?',
      answer:
        'Use DOL’s Foreign Labor Application Gateway (FLAG) wage search for your occupation and area.',
    },
  ],
  sources: [
    platformSources.wageLevels,
    platformSources.h1bCap,
    platformSources.lcaData,
  ],
  related: [
    {
      label: 'OPT to H-1B transition',
      href: '/blog/opt-to-h1b-transition',
    },
    {
      label: 'FY2027 H-1B: no second lottery and backup plans',
      href: '/blog/fy2027-h1b-no-second-lottery-opt-backup-plan',
    },
    {
      label: 'H-1B approval rates by company',
      href: '/blog/h1b-approval-rates-by-company',
    },
  ],
});
