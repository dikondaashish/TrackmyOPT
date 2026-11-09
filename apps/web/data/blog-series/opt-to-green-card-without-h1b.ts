import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// Pillar guide for "opt to green card without h1b", "stem opt to green card"
// and "opt to green card timeline" (Google autocomplete), plus "eb2 india"
// (92 impressions a quarter), "eb1 india" (214) and "eb1" (149) in Search
// Console. Every rule below was checked on 2026-11-09 against USCIS (EB-1,
// EB-2, employment-based and immediate-relative pages, Policy Manual Vol. 7),
// eCFR (8 CFR 204.5, 214.2, 214.6, 245.2; 20 CFR 656; 22 CFR 42.33), DOL
// (PERM program page and FLAG processing times), the November 2026 Visa
// Bulletin, the State Department Diversity Visa pages and Foreign Affairs
// Manual, and the Federal Register. No fees are quoted. No approval rates or
// success odds are given: none are published for these paths in a form that
// fits an individual decision.

const src = {
  ebGreenCard: {
    label: 'Green Card for Employment-Based Immigrants',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/green-card/green-card-eligibility/green-card-for-employment-based-immigrants',
  },
  eb1: {
    label: 'Employment-Based Immigration: First Preference EB-1',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-first-preference-eb-1',
  },
  eb2: {
    label: 'Employment-Based Immigration: Second Preference EB-2',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2',
  },
  perm: {
    label: 'Permanent Labor Certification',
    publisher: 'U.S. Department of Labor',
    url: 'https://www.dol.gov/agencies/eta/foreign-labor/programs/permanent',
  },
  flagTimes: {
    label: 'FLAG Processing Times',
    publisher: 'U.S. Department of Labor',
    url: 'https://flag.dol.gov/processingtimes',
  },
  cfr656: {
    label: '20 CFR Part 656: Labor certification for permanent employment',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-20/chapter-V/part-656',
  },
  cfr2045: {
    label: '8 CFR 204.5: Petitions for employment-based immigrants',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-204/subpart-A/section-204.5',
  },
  cfr2142: {
    label: '8 CFR 214.2: H, L and O nonimmigrant rules',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2',
  },
  cfr2146: {
    label: '8 CFR 214.6: TN professionals under USMCA',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.6',
  },
  cfr2452: {
    label: '8 CFR 245.2: Application for adjustment of status',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-245/section-245.2',
  },
  pmBars: {
    label: 'Policy Manual, Volume 7, Part B, Chapter 8: Inapplicability of Bars to Adjustment (INA 245(k))',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-7-part-b-chapter-8',
  },
  pmUnlawful: {
    label: 'Policy Manual, Volume 7, Part B, Chapter 3: Unlawful Immigration Status at Time of Filing',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-7-part-b-chapter-3',
  },
  charts: {
    label: 'Adjustment of Status Filing Charts from the Visa Bulletin',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates/adjustment-of-status-filing-charts-from-the-visa-bulletin',
  },
  bulletinNov: {
    label: 'Visa Bulletin for November 2026',
    publisher: 'U.S. Department of State',
    url: 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2027/visa-bulletin-for-november-2026.html',
  },
  immediateRelative: {
    label: 'Green Card for Immediate Relatives of U.S. Citizen',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/green-card/green-card-eligibility/green-card-for-immediate-relatives-of-us-citizen',
  },
  dvRule: {
    label: 'Visas: Enhancing Vetting and Combatting Fraud in the Diversity Immigrant Visa Program (March 11, 2026)',
    publisher: 'Federal Register',
    url: 'https://www.federalregister.gov/documents/2026/03/11/2026-04737/visas-enhancing-vetting-and-combatting-fraud-in-the-diversity-immigrant-visa-program',
  },
  dvEntry: {
    label: 'Electronic Diversity Visa Program',
    publisher: 'U.S. Department of State',
    url: 'https://dvprogram.state.gov/',
  },
  dvDelay: {
    label: 'Changes to Entry Period for 2027 Diversity Visa (DV) Program',
    publisher: 'U.S. Department of State',
    url: 'https://travel.state.gov/en/newsroom/visas/2025/changes-to-2027-dv-program-entry-period.html',
  },
  cfr4233: {
    label: '22 CFR 42.33: Diversity immigrants',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-22/chapter-I/subchapter-E/part-42/subpart-D/section-42.33',
  },
  famIntro: {
    label: '9 FAM 401.1: Introduction to Nonimmigrant Visas and Status',
    publisher: 'U.S. Department of State',
    url: 'https://fam.state.gov/fam/09FAM/09FAM040101.html',
  },
  famE: {
    label: '9 FAM 402.9: Treaty Traders, Investors and Specialty Occupations (E visas)',
    publisher: 'U.S. Department of State',
    url: 'https://fam.state.gov/fam/09FAM/09FAM040209.html',
  },
  famH: {
    label: '9 FAM 402.10: Temporary Workers and Trainees (H visas, including H-1B1)',
    publisher: 'U.S. Department of State',
    url: 'https://fam.state.gov/fam/09FAM/09FAM040210.html',
  },
  i765: {
    label: 'Form I-765, Application for Employment Authorization',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-765',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'opt-to-green-card-without-h1b';

export const optToGreenCardWithoutH1b: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'OPT to Green Card Without H-1B: Every Path, Who Qualifies and the Status Gap to Plan For',
  seoTitle: 'OPT to Green Card Without H-1B: Every Path (2026)',
  description:
    'The green card paths an OPT or STEM OPT worker can use without H-1B: employer PERM, EB-2 NIW, EB-1A, EB-1B, marriage, the diversity visa and O-1 or TN bridges, with steps, risks and priority dates by country.',
  category: 'Green Card',
  tags: [
    'OPT to green card',
    'STEM OPT green card',
    'green card without H-1B',
    'EB-2 NIW',
    'EB-1A',
    'EB-2 India',
    'EB-1 India',
    'PERM',
  ],
  readTime: '13 min read',
  publishedDate: '2026-11-09',
  modifiedDate: '2026-11-09',
  showContents: true,
  hub: 'after-opt',
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: green card paths from OPT that do not require H-1B, including PERM, NIW, EB-1 and status bridges.',
  imageCaption:
    'Green card routes an OPT or STEM OPT worker can consider without H-1B. Generated from the USCIS and State Department rules in this guide.',
  directAnswer:
    'Yes, you can go from OPT to a green card without ever holding H-1B. Employers can start PERM and file an I-140 while you are on OPT or STEM OPT. You can self-petition under the EB-2 National Interest Waiver or EB-1A. An employer can file for you as an EB-1B outstanding researcher. Marriage to a U.S. citizen and the diversity visa are separate routes. The hard part is usually time, not eligibility. OPT can end before your priority date lets you file the I-485. You then need another status, such as O-1, TN or H-1B, to stay and work while you wait.',
  keyTakeaways: [
    'A green card has two steps for most workers: an immigrant petition (usually I-140) and then the I-485 or an immigrant visa abroad. You can file the I-485 only when your priority date is current.',
    'EB-1A and the EB-2 National Interest Waiver are self-petitions. They need no employer and no PERM labor certification.',
    'Employer PERM cases can start on OPT, but PERM alone took DOL about 300 calendar days or more of analyst review in the periods DOL reported as of October 31, 2026.',
    'Country of birth sets your wait. In the November 2026 bulletin, EB-2 India final action was November 1, 2013, while most other countries were at April 1, 2025.',
    'F-1, TN, E-3 and H-1B1 generally require nonimmigrant intent. H-1B, L-1 and O-1 rules expressly allow you to seek a green card at the same time.',
  ],
  sections: [
    {
      heading: 'The paths at a glance',
      paragraphs: [
        'Every path below can start while you are on OPT or STEM OPT. They differ in who files, how strong your record must be and how long the wait is. The table compares them; the sections that follow explain each one.',
        'Read the table as a map, not a ranking. Which path fits depends on your field, your record, your employer and your country of birth. An immigration attorney can assess your evidence; this guide cannot.',
      ],
      table: {
        caption: 'Green card paths that do not require H-1B first.',
        columns: ['Path', 'Who files', 'PERM needed?', 'Who it fits', 'Main risk'],
        rows: [
          ['EB-2 or EB-3 through PERM', 'Employer', 'Yes', 'Workers with a sponsoring employer and a qualifying job', 'OPT ends before the I-485 can be filed'],
          ['EB-2 National Interest Waiver', 'You (self-petition)', 'No', 'Advanced degree or exceptional ability, with work of national importance', 'Evidence judged too thin; same EB-2 country backlog'],
          ['EB-1A extraordinary ability', 'You (self-petition)', 'No', 'People with sustained national or international acclaim', 'A high evidence bar; EB-1 backlog for India and China'],
          ['EB-1B outstanding researcher', 'Employer', 'No', 'Researchers with international recognition and 3 years of experience', 'Needs a qualifying research job offer'],
          ['Immediate relative of a U.S. citizen', 'U.S. citizen spouse', 'No', 'People married to a U.S. citizen', 'A real marriage is required; scrutiny of the relationship'],
          ['Diversity visa', 'You (lottery entry)', 'No', 'Natives of eligible countries who meet the education or work test', 'Random selection; entry periods can be delayed'],
          ['O-1, TN, L-1, E-3, H-1B1', 'Employer', 'Not a green card', 'A status bridge while a green card case waits', 'Some of these require nonimmigrant intent'],
        ],
      },
      links: [
        { label: 'Green card options after OPT', href: '/blog/green-card-after-opt' },
        { label: 'H-1B alternatives and other work visas', href: '/blog/h1b-alternatives-work-visas' },
      ],
      sources: [src.eb1, src.eb2, src.ebGreenCard],
    },
    {
      heading: 'Path 1: employer PERM, then I-140, while on STEM OPT',
      paragraphs: [
        'This is the most common employer route. The employer, not you, files the labor certification. DOL regulations bar the employer from making you pay its costs of the labor certification, including its attorney’s fees.',
        'Your priority date for a PERM-based I-140 is generally the date DOL accepted the labor certification for processing. That date is your place in line, so an earlier start helps.',
      ],
      numbered: [
        'The employer requests a prevailing wage determination from DOL.',
        'The employer runs a recruitment test of the U.S. labor market. For professional jobs this includes a job order and two print advertisements, plus three additional steps.',
        'The employer files Form ETA-9089 in DOL’s FLAG system at least 30 days after the mandatory recruitment and within 180 days of it.',
        'After certification, the employer has 180 days to file Form I-140 with USCIS, or the certification expires.',
        'When your priority date is current on the chart USCIS selects, you file Form I-485, usually with an I-765 (c)(9) and an I-131.',
      ],
      note: 'Timing as of DOL’s own page: on September 30, 2026, DOL was working PERM prevailing wage requests filed in June 2026. As of October 31, 2026, PERM analyst review averaged 300 calendar days over the last 30 days and 360 over the last 180 days. Check the current numbers before you plan.',
      links: [
        { label: 'PERM labor certification for OPT workers', href: '/blog/perm-labor-certification-opt' },
        { label: 'I-140 case status tracker', href: '/blog/i-140-case-status-tracking' },
      ],
      sources: [src.perm, src.cfr656, src.flagTimes, src.cfr2045, src.eb2],
    },
    {
      heading: 'The status gap: when OPT ends before the I-485 can be filed',
      paragraphs: [
        'OPT and STEM OPT have fixed end dates. PERM plus the I-140 can take more than a year, and the I-485 waits for your priority date. If OPT ends first, an approved I-140 alone does not give you a status, a work permit or permission to stay.',
        'Once a properly filed I-485 is pending, the USCIS Policy Manual treats you as in a period of authorized stay. You do not accrue unlawful presence while it is pending, although the Policy Manual says a pending I-485 does not itself give you a lawful status. With a (c)(9) EAD you can work. The problem is the gap before you are allowed to file.',
        'People bridge that gap in a few ways. Some keep entering the H-1B lottery or find a cap-exempt employer. Some move to O-1, TN, L-1 or E-3 if they qualify. Some leave the United States and finish through an immigrant visa at a consulate when the date is current.',
        'INA 245(k) also matters for employment-based cases. It forgives failure to keep status or unauthorized work for an aggregate of 180 days or less since your last lawful admission. More than that can bar adjustment inside the United States. Plan dates with an attorney rather than relying on this rule.',
      ],
      table: {
        caption: 'Where the gap usually appears in a PERM case.',
        columns: ['Stage', 'What you hold', 'Can you work?'],
        rows: [
          ['PERM or I-140 pending, OPT valid', 'F-1 with OPT or STEM OPT EAD', 'Yes, on the OPT EAD'],
          ['I-140 approved, OPT ended, date not current', 'No status from the I-140 itself', 'No, unless you hold another status that allows it'],
          ['I-485 filed and pending', 'Period of authorized stay (not a lawful status by itself)','Yes, once the (c)(9) EAD is approved, or on a still-valid OPT EAD'],
        ],
      },
      note: 'After OPT ends, F-1 students generally have a 60-day grace period to leave, change status or start a new program. A September 14, 2026 federal court order postponed the DHS fixed-admission-period rule, and USCIS says it is applying the previous rules.',
      links: [
        { label: '60-day grace period for F-1 students', href: '/blog/60-day-grace-period-f1-students' },
        { label: 'I-485 green card status tracking', href: '/blog/i-485-green-card-status-tracking' },
      ],
      sources: [src.pmUnlawful, src.pmBars, src.i765, src.charts],
    },
    {
      heading: 'Path 2: EB-2 National Interest Waiver (self-petition)',
      paragraphs: [
        'The National Interest Waiver asks USCIS to waive the job offer and the labor certification. You can file the I-140 yourself. You still have to qualify for EB-2, either as a member of the professions with an advanced degree or through exceptional ability.',
        'An advanced degree means a U.S. degree above a bachelor’s, or a foreign equivalent. A bachelor’s degree plus at least five years of progressive experience in the specialty counts as the equivalent of a master’s. Exceptional ability needs evidence for at least three of the listed criteria.',
        'USCIS then weighs three factors. Your proposed endeavor must have substantial merit and national importance. You must be well positioned to advance it. On balance, waiving the job offer and labor certification must benefit the United States.',
        'The main risk is evidence. Your priority date is the I-140 filing date, and you join the same EB-2 line by country as PERM cases. For India, that line is long.',
      ],
      links: [{ label: 'EB-2 NIW for OPT and STEM OPT workers', href: '/blog/eb2-niw-green-card-opt' }],
      sources: [src.eb2, src.cfr2045],
    },
    {
      heading: 'Path 3: EB-1A extraordinary ability (self-petition)',
      paragraphs: [
        'EB-1A is for people with extraordinary ability in the sciences, arts, education, business or athletics, shown by sustained national or international acclaim. No job offer or labor certification is required, and you may file the I-140 yourself.',
        'You must show either a one-time major achievement, such as a major international award, or meet at least 3 of the 10 USCIS criteria. You also need evidence that you will keep working in your area of expertise.',
        'The bar is high, and meeting three criteria does not end the review. EB-1 is current for most countries in the November 2026 bulletin, but not for India or China, so an approved EB-1A still means a wait for those applicants.',
      ],
      sources: [src.eb1, src.cfr2045, src.bulletinNov],
    },
    {
      heading: 'Path 4: EB-1B outstanding professor or researcher (employer files)',
      paragraphs: [
        'EB-1B needs an employer but skips PERM. You must show international recognition for outstanding achievements in an academic field and at least three years of teaching or research in that field.',
        'The job must be a tenure or tenure-track teaching post or a comparable research position at a university, an institution of higher education or a private employer. You must meet at least 2 of the 6 USCIS criteria. A private employer must show documented accomplishments and at least three full-time researchers.',
        'This path can fit PhD graduates and postdocs on STEM OPT. The main risk is that it depends on a qualifying job offer, so a job change can mean starting over.',
      ],
      links: [{ label: 'Postdoc and research jobs on OPT', href: '/blog/postdoc-research-jobs-opt-stem-opt' }],
      sources: [src.eb1],
    },
    {
      heading: 'Path 5: family-based, as the spouse of a U.S. citizen',
      paragraphs: [
        'The spouse of a U.S. citizen is an immediate relative. Immediate relative visas are not limited by number, so there is no priority date wait. If you are in the United States, you may file the I-485 together with the I-130 your spouse files, while it is pending or after approval.',
        'You generally must have been inspected and admitted or paroled into the United States. USCIS requires a real marriage and reviews the relationship closely. This guide describes the route only so the comparison is complete; marry for your own reasons, not for status.',
      ],
      sources: [src.immediateRelative],
    },
    {
      heading: 'Path 6: the diversity visa lottery',
      paragraphs: [
        'The diversity visa is a random lottery for natives of countries with low recent immigration to the United States. You also need at least a high school education or its equivalent, or two years of qualifying work experience within the past five years. Each year’s instructions list which countries are not eligible.',
        'Selection only lets you apply. A selectee must get the visa or adjust status by the end of that fiscal year, or the chance is lost.',
        'Starting with DV-2027, Federal Register rules added a $1 entry fee and a scan of a valid, unexpired passport with each entry. The State Department delayed the DV-2027 entry period in November 2025. When we checked dvprogram.state.gov on November 9, 2026, it said entries were not being accepted. Enter only on that official site, never through a third party.',
      ],
      sources: [src.cfr4233, src.dvRule, src.dvDelay, src.dvEntry],
    },
    {
      heading: 'Status bridges: O-1, TN, L-1, E-3 and H-1B1',
      paragraphs: [
        'These are temporary work statuses, not green cards. They matter because they can keep you working while a green card case waits. The key question is intent. Some classifications let you pursue a green card openly; others require you to show you plan to leave.',
        'The regulations say a labor certification or immigrant petition cannot be the basis for denying an H-1B, L-1 or O-1. For TN, the regulation defines temporary entry as entry without the intent to establish permanent residence. The State Department applies the INA 214(b) presumption of immigrant intent to E visa applicants and treats H-1B1 as having no dual intent.',
      ],
      table: {
        caption: 'Temporary statuses OPT workers use as bridges, and how each treats green card plans.',
        columns: ['Status', 'Who can use it', 'Green card case while in status'],
        rows: [
          ['O-1', 'People with extraordinary ability, shown by sustained acclaim', 'Allowed by regulation'],
          ['L-1', 'Employees with one continuous year abroad at a related company in the past three years', 'Allowed by regulation'],
          ['TN', 'Citizens of Canada and Mexico in listed professions', 'Generally requires intent to leave; get advice first'],
          ['E-3', 'Australian citizens in specialty occupations', 'Presumed immigrant until shown otherwise; get advice first'],
          ['H-1B1', 'Citizens of Chile and Singapore in specialty occupations', 'No dual intent; get advice first'],
        ],
      },
      links: [
        { label: 'O-1 visa for international students', href: '/blog/o1-visa-international-students-opt' },
        { label: 'TN visa for Canadian and Mexican students', href: '/blog/tn-visa-canadian-mexican-students-opt' },
        { label: 'L-1 transfer after OPT', href: '/blog/l1-visa-transfer-after-opt' },
      ],
      sources: [src.cfr2142, src.cfr2146, src.famIntro, src.famE, src.famH],
    },
    {
      heading: 'Why your country of birth decides the wait',
      paragraphs: [
        'Employment-based visas are limited each year, with a per-country limit. Your wait is generally set by your country of birth, called chargeability, rather than your citizenship. That is why "EB-2 India" and "EB-1 India" are searched so often.',
        'The table shows the official November 2026 Final Action Dates. Your priority date must be earlier than the date shown for USCIS to approve an I-485. A "C" means current. Filing can sometimes start earlier, when USCIS lets applicants use the Dates for Filing chart.',
      ],
      table: {
        caption: 'November 2026 Visa Bulletin, employment-based Final Action Dates (official).',
        columns: ['Category', 'India', 'China (mainland born)', 'Most other countries'],
        rows: [
          ['EB-1', 'Feb 1, 2023', 'Aug 1, 2023', 'Current'],
          ['EB-2', 'Nov 1, 2013', 'Oct 1, 2021', 'Apr 1, 2025'],
          ['EB-3', 'Jan 22, 2014', 'Jan 22, 2022', 'Jun 15, 2024'],
        ],
      },
      note: 'A self-petition does not skip the line. An approved EB-2 NIW for someone born in India waits on the same EB-2 India date as a PERM case.',
      links: [
        { label: 'December 2026 Visa Bulletin predictions', href: '/blog/december-2026-visa-bulletin-predictions' },
        { label: 'November 2026 Visa Bulletin for OPT workers', href: '/blog/november-2026-visa-bulletin-predictions-opt-workers' },
      ],
      sources: [src.bulletinNov, src.charts],
    },
    {
      heading: 'F-1 intent, travel and visa renewal',
      paragraphs: [
        'F-1 is not a dual-intent status. The State Department lists F among the classes that require a residence abroad you do not intend to abandon. A pending PERM, I-140 or NIW petition can make that harder to show at a consulate if you need a new F-1 visa.',
        'Once an I-485 is pending, leaving the United States without advance parole generally abandons it. The regulation’s travel exception covers H-1 and L-1 workers, not F-1 students. Even with advance parole, the regulation treats your return as a parole, not a readmission in F-1 status, which can affect your OPT. Ask your attorney before booking any trip.',
      ],
      sources: [src.famIntro, src.cfr2452],
    },
    {
      heading: 'Tracking the case once it starts',
      paragraphs: [
        'A green card case produces several receipts: the I-140, the I-485, the I-765 (c)(9) and the I-131. Add each one to TrackMyOPT as it arrives. It checks USCIS for changes and emails you when a status moves, alongside your OPT or STEM OPT EAD.',
        'TrackMyOPT is a tracker, not legal advice. USCIS notices are the official record. For choosing a path, the evidence for a self-petition or the timing of a status bridge, work with an immigration attorney.',
      ],
      links: [
        { label: 'I-485 green card status tracking', href: '/blog/i-485-green-card-status-tracking' },
        { label: 'I-140 case status tracker', href: '/blog/i-140-case-status-tracking' },
      ],
    },
    {
      heading: 'Example: Lin weighs PERM against an NIW on STEM OPT',
      paragraphs: [
        'Fictional example: Lin was born in Vietnam and has a U.S. master’s in environmental engineering. She is 10 months into STEM OPT. Her employer offers to start PERM, and her advisor suggests an NIW based on her flood-modelling work.',
        'Her attorney explains the trade-off. PERM depends on the employer and on DOL processing that alone can take most of a year. An NIW needs no employer but rests on her evidence for the three factors. Lin files the NIW I-140 herself, and her employer starts PERM in parallel as a backup.',
        'Her NIW is approved while STEM OPT still has eight months left. Her priority date is earlier than the Dates for Filing cutoff USCIS accepts that month, so she files the I-485 with a (c)(9) I-765 and an I-131. She tracks all four receipts and does not travel until advance parole arrives. In this example, the (c)(9) EAD is approved before STEM OPT ends, so she has no gap in work authorization.',
      ],
    },
  ],
  checklist: [
    'Write down your OPT or STEM OPT end date and work backward from it.',
    'Ask your employer whether and when it will start PERM.',
    'Have an attorney assess your record for EB-2 NIW, EB-1A or EB-1B.',
    'Check your country’s line on the current Visa Bulletin.',
    'Plan a status bridge in case OPT ends before you can file the I-485.',
    'Track every receipt and keep copies of every notice.',
  ],
  mistakes: [
    'Assuming an approved I-140 lets you stay or work after OPT ends.',
    'Assuming a self-petition skips the country backlog.',
    'Travelling on F-1 status with a pending I-485 and no advance parole.',
    'Paying the employer’s PERM costs, which DOL rules prohibit.',
    'Entering the diversity visa lottery through a third-party website.',
  ],
  faq: [
    {
      question: 'Can I get a green card directly from OPT without H-1B?',
      answer:
        'Yes. Employer PERM cases, the EB-2 NIW, EB-1A, EB-1B, marriage to a U.S. citizen and the diversity visa do not require H-1B. The challenge is keeping a status until you can file the I-485.',
    },
    {
      question: 'Can my employer file PERM while I am on STEM OPT?',
      answer:
        'Yes. Nothing requires H-1B first. The employer pays the PERM costs. Keep in mind that F-1 is not a dual-intent status, which can matter for F-1 visa renewal abroad.',
    },
    {
      question: 'How long does OPT to green card take?',
      answer:
        'There is no single timeline. PERM alone was taking DOL roughly 300 or more days of analyst review in late 2026. After the I-140, the wait depends on your category and country of birth on the Visa Bulletin.',
    },
    {
      question: 'Is EB-2 NIW faster than PERM for someone born in India?',
      answer:
        'It can skip the PERM step, but the visa wait is the same EB-2 India line. In November 2026 the EB-2 India final action date was November 1, 2013.',
    },
    {
      question: 'What happens if my STEM OPT ends before I can file the I-485?',
      answer:
        'An approved I-140 alone does not let you stay or work. You need another status, such as H-1B, O-1, TN or L-1, or to leave and later process through a consulate. Ask an attorney early.',
    },
  ],
  sources: [
    src.ebGreenCard,
    src.eb1,
    src.eb2,
    src.perm,
    src.flagTimes,
    src.cfr656,
    src.cfr2045,
    src.pmUnlawful,
    src.pmBars,
    src.bulletinNov,
    src.charts,
    src.immediateRelative,
    src.cfr4233,
    src.dvRule,
    src.cfr2142,
    src.cfr2146,
    src.famIntro,
    src.famH,
    src.cfr2452,
  ],
  related: [
    { label: 'Green card after OPT', href: '/blog/green-card-after-opt' },
    { label: 'EB-2 NIW for OPT workers', href: '/blog/eb2-niw-green-card-opt' },
    { label: 'PERM labor certification for OPT workers', href: '/blog/perm-labor-certification-opt' },
    { label: 'H-1B alternatives and other work visas', href: '/blog/h1b-alternatives-work-visas' },
  ],
});
