import { defineArticle } from './shared';
import { PLANNING_GUIDE_DATE, planningSources as src } from './planning-guides-shared';
import type { ResearchArticle } from './types';

// Autocomplete: "h1b wage level by zip code", "h1b wage level calculator",
// "h1b level 2 salary range", "h1b wage level lookup".
// Wage figures: OFLC_Wages_2026-27.zip (ALC_Export.csv, All Industries),
// downloaded from flag.dol.gov on November 20, 2026. Annual = hourly x 2,080,
// rounded to the dollar, which is how the DOL wage search shows it.
// Areas: San Jose 41940, Seattle 42660, New York 35620, Dallas 19100,
// Columbus OH 18140. Re-read the file before changing any number.

const SLUG = 'h1b-wage-level-by-zip-code-salary';

export const h1bWageLevelLookupGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title: 'H-1B Wage Level by Zip Code and Salary: How to Find Yours',
  seoTitle: 'H-1B Wage Level by Zip Code and Salary: Find Your Level',
  description:
    'There is no zip code search. Find your county, look up your occupation in the Labor Department wage search, and compare your salary with the four level wages. With 2026-27 examples.',
  category: 'H-1B',
  tags: [
    'H-1B wage level by zip code',
    'H-1B wage level lookup',
    'H-1B level 2 salary range',
    'OEWS wage level',
    'H-1B prevailing wage',
  ],
  readTime: '6 min read',
  publishedDate: PLANNING_GUIDE_DATE,
  modifiedDate: PLANNING_GUIDE_DATE,
  showContents: true,
  cta: 'sponsors',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: the same $140,000 salary is level III in Dallas and level I in Seattle.',
  imageCaption: 'The same salary lands at a different level in each area.',
  dataNote:
    'Wage figures are from the Labor Department wage file for July 2026 to June 2027, All Industries, read on November 20, 2026. Annual figures are the hourly wage times 2,080 hours.',
  directAnswer:
    'The Labor Department does not set H-1B wages by zip code. It sets four wage levels for each occupation in each area, and an area is a county or a metro area. Use your zip code to find your county, look up your occupation in the wage search, and compare your salary with the four wages. Your level is the highest one your salary equals or exceeds.',
  keyTakeaways: [
    'Wages are set by occupation and area, not by zip code.',
    'Your level is the highest level wage your salary equals or exceeds.',
    'In the lottery, level I gets one entry and level IV gets four.',
    'The same $140,000 is level III in Dallas and level I in Seattle.',
  ],
  sections: [
    {
      heading: 'How to look up your wage level',
      paragraphs: [
        'The tool is the wage search on the Labor Department FLAG site. It is free.',
      ],
      numbered: [
        'Find the county of your work address from its zip code. The USPS zip lookup shows it.',
        'Open the wage search and choose the data series for July 2026 to June 2027.',
        'Choose All Industries, unless your employer is a university or a nonprofit research body.',
        'Enter your occupation code. Ask your employer which code it uses for your job.',
        'Choose your state and county.',
        'Read the four yearly wages. Find the highest one your salary equals or exceeds.',
      ],
      note: 'If you work in more than one place, the lowest level among the locations applies.',
      sources: [src.wageSearch, src.registrationFaq],
    },
    {
      heading: 'Example: software developers in five areas',
      figure: {
        src: `/blog/illustrations/${SLUG}.webp`,
        alt: 'Painted illustration of a wide map of hills and cities with four ascending stone steps in the foreground.',
        caption: 'Each area has its own four steps. Illustration generated with AI.',
        width: 1200,
        height: 675,
      },
      paragraphs: [
        'These are the yearly wages for Software Developers, code 15-1252, in the current wage year.',
      ],
      table: {
        caption: 'Software Developers (15-1252), July 2026 to June 2027, All Industries, yearly wage.',
        columns: ['Metro area', 'Level I', 'Level II', 'Level III', 'Level IV'],
        rows: [
          ['San Jose', '$152,797', '$187,075', '$221,374', '$255,653'],
          ['Seattle', '$111,613', '$143,104', '$174,595', '$206,086'],
          ['New York', '$109,845', '$137,717', '$165,589', '$193,461'],
          ['Dallas', '$95,202', '$116,896', '$138,590', '$160,285'],
          ['Columbus, Ohio', '$85,800', '$104,624', '$123,427', '$142,251'],
        ],
      },
      sources: [src.wageDownloads, src.wageSearch],
    },
    {
      heading: 'The same salary in different places',
      paragraphs: [
        'Take a software developer offered $140,000. The level, and the number of lottery entries, depends on where the job is.',
      ],
      table: {
        caption: 'Where a $140,000 software developer salary lands, using the table above.',
        columns: ['Metro area', 'Wage level', 'Lottery entries'],
        rows: [
          ['Dallas', 'Level III', '3'],
          ['Columbus, Ohio', 'Level III', '3'],
          ['New York', 'Level II', '2'],
          ['Seattle', 'Level I', '1'],
          ['San Jose', 'Below level I', 'See below'],
        ],
      },
      note: 'In San Jose, $140,000 is under the level I wage in this data. The employer would need to pay more or use another valid wage source, and the registration would be level I.',
      sources: [src.wageDownloads, src.registrationFaq],
    },
    {
      heading: 'Other occupations: New York example',
      paragraphs: [
        'Levels differ as much by occupation as by place. These are four common codes in the New York metro area.',
      ],
      table: {
        caption: 'New York metro area, July 2026 to June 2027, All Industries, yearly wage.',
        columns: ['Occupation', 'Level I', 'Level II', 'Level III', 'Level IV'],
        rows: [
          ['Software Developers (15-1252)', '$109,845', '$137,717', '$165,589', '$193,461'],
          ['Data Scientists (15-2051)', '$87,256', '$115,835', '$144,414', '$172,994'],
          ['Accountants and Auditors (13-2011)', '$75,046', '$97,053', '$119,059', '$141,066'],
          ['Mechanical Engineers (17-2141)', '$83,200', '$100,256', '$117,333', '$134,389'],
        ],
      },
      sources: [src.wageDownloads],
    },
    {
      heading: 'What the level means in the lottery',
      paragraphs: [
        'For the H-1B registration, the employer selects the highest level your salary equals or exceeds. Level I gets one entry, level II two, level III three and level IV four.',
        'The four levels sit at about the 17th, 34th, 50th and 67th percentile of wages for the occupation in that area. The Labor Department describes them as entry, qualified, experienced and fully competent.',
        'If the offer is a range, the bottom of the range decides the level. The salary in the later petition must support the level on the registration.',
      ],
      links: [
        { label: 'H-1B lottery 2027 (FY2028): dates, fee and odds', href: '/blog/h1b-lottery-2027-fy2028' },
        { label: 'H-1B wage levels explained', href: '/blog/h1b-wage-levels-explained-opt' },
      ],
      sources: [src.registrationFaq, src.capSeason, src.wageGuidance, src.wageProposal],
    },
    {
      heading: 'These numbers may change',
      paragraphs: [
        'The wage data resets every July 1. The figures here run to June 30, 2027.',
        'A Labor Department proposal from March 2026 would move the four levels to about the 34th, 52nd, 70th and 88th percentile. The law firm Fragomen reported on November 9, 2026 that the final rule is under White House review. It is not in effect.',
        'If it takes effect before registration, each level will need a higher salary. Look up your level again in February.',
      ],
      links: [
        { label: 'Labor Department prevailing wage proposal', href: '/blog/dol-prevailing-wage-hikes-h1b-impact-2026' },
      ],
      sources: [src.wageProposal, src.fragomenWage, src.wageDownloads],
    },
  ],
  checklist: [
    'Get your occupation code from your employer.',
    'Find your work county from the zip code.',
    'Look up the four wages for the current wage year.',
    'Compare your base salary with each level.',
    'Ask your employer which level it will select.',
    'Look again in February, before registration.',
  ],
  mistakes: [
    'Searching by zip code or city name alone.',
    'Using the wrong occupation code.',
    'Using a national average salary.',
    'Using last year\'s wage data.',
    'Assuming the job title sets the lottery level. The salary does.',
  ],
  faq: [
    {
      question: 'Can I look up H-1B wage levels by zip code?',
      answer:
        'Not directly. The Labor Department wage search uses counties and metro areas. Find your county from the zip code, then search by county.',
    },
    {
      question: 'What is the salary range for H-1B level 2?',
      answer:
        'It depends on the occupation and area. For software developers in 2026-27 it runs from $116,896 to $138,589 in Dallas and from $187,075 to $221,373 in San Jose.',
    },
    {
      question: 'How do I know my H-1B wage level?',
      answer:
        'Compare your offered salary with the four level wages for your occupation and work area. Your level is the highest one your salary equals or exceeds.',
    },
    {
      question: 'Does a higher wage level improve my lottery chances?',
      answer:
        'Yes. Level I gets one entry in the selection, level II two, level III three and level IV four.',
    },
    {
      question: 'Is there an official H-1B wage level calculator?',
      answer:
        'The Labor Department wage search is the official source. It shows the four wages. You compare your salary with them yourself.',
    },
    {
      question: 'Which wage year applies to the March 2027 registration?',
      answer:
        'The data for July 2026 to June 2027, unless a new rule changes the levels first.',
    },
  ],
  sources: [
    src.wageSearch,
    src.wageDownloads,
    src.registrationFaq,
    src.capSeason,
    src.wageGuidance,
    src.wageProposal,
    src.fragomenWage,
  ],
  related: [
    { label: 'H-1B lottery 2027 (FY2028): dates, fee and odds', href: '/blog/h1b-lottery-2027-fy2028' },
    { label: 'H-1B wage levels explained', href: '/blog/h1b-wage-levels-explained-opt' },
    { label: 'How to read H-1B sponsor and LCA data', href: '/blog/how-to-read-h1b-sponsor-data-lca' },
    { label: 'Does the $100,000 fee apply to F-1 and OPT students?', href: '/blog/h1b-100k-fee-f1-opt-students' },
  ],
});
