import { platformGap, platformSources } from './shared';

export const howToReadH1bSponsorDataLcaArticle = platformGap({
  slug: 'how-to-read-h1b-sponsor-data-lca',
  title:
    'How to Read H-1B Sponsor Data: LCA Job Titles, Wages, Scores, and Trends',
  seoTitle: 'How to Read H-1B Sponsor Data and LCA Filings',
  description:
    'Learn what H-1B sponsor data can and cannot tell an OPT job seeker: LCA job titles, offered wages, wage levels, worksites, approval trends, and how to use a sponsor score without over-reading it.',
  category: 'H-1B',
  tags: [
    'H-1B sponsor data',
    'LCA data',
    'H-1B sponsor score',
    'OPT job search',
  ],
  readTime: '10 min read',
  cta: 'sponsors',
  imageAlt: 'Illustrated laptop with a rising bar chart and a magnifying glass',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'H-1B sponsor data comes mainly from Labor Condition Applications (LCAs) that employers file with the Department of Labor, plus approval summaries. An LCA shows the job title, occupation code, offered wage, prevailing wage level, worksite, and dates. Use this data to answer three questions. Does the employer file for roles like mine? At what wage level? Is filing growing or shrinking? LCAs are filed before petitions, so they show intent to hire, not approvals, and past filing is never a promise that an employer will sponsor you.',
  keyTakeaways: [
    'An LCA is a required step before an H-1B petition, not an approval.',
    'Job titles and occupation codes tell you whether an employer files for your type of role.',
    'Wage level shows the seniority the employer is paying for, which affects weighted selection.',
    'Trends over several years matter more than any single year.',
  ],
  sections: [
    {
      heading: 'What an LCA is',
      paragraphs: [
        'Before filing most H-1B petitions, an employer must file a Labor Condition Application with the Department of Labor. The employer attests to the wage, the working conditions, and the worksite. DOL publishes LCA disclosure data, which is why so much sponsor research is possible.',
        'Because employers sometimes file more LCAs than petitions, LCA counts tend to overstate actual hiring. They are best used to see patterns: which roles, where, and at what pay.',
      ],
      sources: [platformSources.lcaData],
    },
    {
      heading: 'Fields to read on every sponsor profile',
      paragraphs: [
        'A TrackMyOPT sponsor profile combines DOL LCA data with derived employer summaries. Read the fields in this order:',
      ],
      bullets: [
        'Job and occupation (SOC) titles: are there roles close to yours?',
        'Offered wage and prevailing wage level: what seniority is the employer paying for?',
        'Worksite locations: does the employer hire where you can work?',
        'Approvals by year (FY2021 to FY2025): is sponsorship steady, growing, or shrinking?',
        'Entry-level focus: how much of the filing activity looks open to new graduates?',
        'Flags such as H-1B dependency or a shared virtual-office address, which are worth investigating.',
      ],
      links: [
        {
          label: 'H-1B approval rates by company',
          href: '/blog/h1b-approval-rates-by-company',
        },
      ],
    },
    {
      heading: 'Understanding wage levels',
      paragraphs: [
        'Each LCA ties the offered wage to a prevailing wage level from I (entry) to IV (fully competent) for the occupation and area. Under the weighted H-1B selection process used from FY2027, higher wage levels receive more entries in the lottery. A Level I offer gets one entry, while a Level IV offer gets four.',
        'If an employer files mostly Level I and II LCAs for your occupation, it is probably used to hiring new graduates. Mostly Level III and IV filings suggest experienced hires.',
      ],
      links: [
        {
          label: 'H-1B wage levels explained',
          href: '/blog/h1b-wage-levels-explained-opt',
        },
        {
          label: 'FY2027 H-1B weighted selection process',
          href: '/blog/h1b-weighted-selection-process-fy2027',
        },
      ],
      sources: [platformSources.wageLevels, platformSources.h1bCap],
    },
    {
      heading: 'What the sponsor score measures',
      paragraphs: [
        'The TrackMyOPT Sponsor Score is a 0–100 research aid. It weights recent approval volume (50%), three-year average volume (30%), and year-over-year trend (20%), and labels results Strong, Medium, or Low. The trend is Up or Down when the latest year moves more than 10% versus the prior year.',
        'The score measures how active a sponsor is, not your chance of approval. A small company with a low score may still sponsor your role, and a large sponsor may not hire new graduates in your field.',
      ],
      note: 'Historical data is not a promise of current sponsorship. Confirm with the employer.',
    },
    {
      heading: 'Fictional example: two sponsors, same score',
      paragraphs: [
        'Lena is fictional and studying data analytics. Two companies both score in the high 70s. Company A files mainly for software engineers at Level III and IV in one city. Company B files for data analysts and data scientists at Levels I and II across several states. Despite the matching scores, Company B is the better target for her outreach.',
      ],
    },
    {
      heading: 'Turning data into a target list',
      numbered: [
        'Filter sponsors by job titles close to your degree.',
        'Check wage levels for signs of entry-level hiring.',
        'Prefer employers with steady or rising filing trends.',
        'Confirm worksite locations match where you can live.',
        'Use the careers link to find open roles, then reach out to the team.',
      ],
      paragraphs: [
        'Free accounts can browse the top 25 sponsors by approval volume. Pro unlocks the full database and sponsor analytics.',
      ],
      links: [
        {
          label: 'Find cap-exempt H-1B employers',
          href: '/blog/find-cap-exempt-h1b-employers',
        },
        {
          label: 'Cold emailing recruiters as an F-1 student',
          href: '/blog/cold-email-recruiters-f1-opt-students',
        },
      ],
    },
  ],
  checklist: [
    'Search for job titles that match your degree and target role.',
    'Read wage levels before reading total filing counts.',
    'Compare at least three years of approvals.',
    'Check worksite cities.',
    'Investigate unusual flags before applying.',
    'Confirm sponsorship directly with recruiters.',
  ],
  mistakes: [
    'Treating LCA counts as approvals.',
    'Choosing employers by total volume alone.',
    'Ignoring wage levels when you are an entry-level candidate.',
    'Reading the sponsor score as a personal approval probability.',
  ],
  faq: [
    {
      question: 'Where does H-1B sponsor data come from?',
      answer:
        'Mostly from DOL’s public LCA disclosure data, combined with employer-level summaries. It reflects past filings.',
    },
    {
      question: 'Does a high sponsor score mean I will be sponsored?',
      answer:
        'No. It shows how active an employer has been in H-1B filings. Hiring decisions depend on the role, the candidate, and the company’s current plans.',
    },
    {
      question: 'Why do LCA numbers differ from petition approvals?',
      answer:
        'Employers can file LCAs for roles they never petition for, file several per position, or withdraw them. Approvals happen later, at USCIS.',
    },
  ],
  sources: [
    platformSources.lcaData,
    platformSources.wageLevels,
    platformSources.h1bCap,
  ],
  related: [
    {
      label: 'Top H-1B sponsor companies 2026',
      href: '/blog/top-h1b-sponsor-companies-2026',
    },
    {
      label: 'H-1B sponsors hiring new graduates',
      href: '/blog/h1b-sponsors-international-new-graduates-2026-2027',
    },
    {
      label: 'OPT to H-1B transition',
      href: '/blog/opt-to-h1b-transition',
    },
  ],
});
