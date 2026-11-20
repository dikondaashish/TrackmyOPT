import type { ArticleSource } from './types';

/**
 * Sources shared by the November 20, 2026 planning guides (topics 11 to 15 of
 * the keyword research run that day): H-1B lottery FY2028, wage-level lookup,
 * the $100,000 payment for F-1 students, the 1040-NR deadline and Form I-983
 * sample answers.
 *
 * Every figure in those guides was read from the source named beside it on
 * November 20, 2026. Wage figures come from the OFLC 2026-27 wage file
 * (All Industries), hourly wage times 2,080 hours, rounded to the dollar.
 */
export const PLANNING_GUIDE_DATE = '2026-11-20';

const uscis = 'USCIS';
const irs = 'IRS';

export const planningSources = {
  // H-1B
  capSeason: {
    label: 'H-1B Cap Season',
    publisher: uscis,
    url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations/h-1b-cap-season',
  },
  registration: {
    label: 'H-1B Electronic Registration Process',
    publisher: uscis,
    url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations/h-1b-electronic-registration-process',
  },
  registrationFaq: {
    label: 'H-1B Electronic Registration Frequently Asked Questions',
    publisher: uscis,
    url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations/h-1b-electronic-registration-frequently-asked-questions',
  },
  weightedRule: {
    label: 'Weighted selection final rule, 90 FR 60864 (December 29, 2025)',
    publisher: 'Federal Register / GPO',
    url: 'https://www.govinfo.gov/content/pkg/FR-2025-12-29/html/2025-23853.htm',
  },
  fy2027Dates: {
    label: 'FY 2027 H-1B cap initial registration period announcement',
    publisher: uscis,
    url: 'https://content.govdelivery.com/accounts/USDHSCIS/bulletins/406da02',
  },
  capReached: {
    label: 'USCIS Reaches Fiscal Year 2027 H-1B Cap',
    publisher: uscis,
    url: 'https://www.uscis.gov/newsroom/alerts/uscis-reaches-fiscal-year-2027-h-1b-cap',
  },
  fragomenCap: {
    label: 'H-1B Cap Is Reached for FY 2027 (reports USCIS registration figures)',
    publisher: 'Fragomen',
    url: 'https://www.fragomen.com/insights/united-states-h-1b-cap-is-reached-for-fy-2027.html',
  },
  feeProposal: {
    label: 'Fee for Certain H-1B Petitions, proposed rule, 91 FR 54817 (August 25, 2026)',
    publisher: 'Federal Register / GPO',
    url: 'https://www.govinfo.gov/content/pkg/FR-2026-08-25/pdf/2026-17324.pdf',
  },
  wageSearch: {
    label: 'OFLC Wage Search',
    publisher: 'U.S. Department of Labor',
    url: 'https://flag.dol.gov/wage-data/wage-search',
  },
  wageDownloads: {
    label: 'OFLC wage data downloads, wage year July 2026 to June 2027',
    publisher: 'U.S. Department of Labor',
    url: 'https://flag.dol.gov/wage-data/wage-data-downloads',
  },
  wageGuidance: {
    label: 'Prevailing Wage Determination Policy Guidance (2009)',
    publisher: 'U.S. Department of Labor',
    url: 'https://www.dol.gov/sites/dolgov/files/ETA/oflc/pdfs/NPWHC_Guidance_Revised_11_2009.pdf',
  },
  wageProposal: {
    label: 'Proposed rule on prevailing wage levels, 91 FR 15454 (March 27, 2026)',
    publisher: 'Federal Register / GPO',
    url: 'https://www.govinfo.gov/content/pkg/FR-2026-03-27/html/2026-06017.htm',
  },
  fragomenWage: {
    label: 'DOL Final Rule on Prevailing Wages Now Under OMB Review (November 9, 2026)',
    publisher: 'Fragomen',
    url: 'https://www.fragomen.com/insights/united-states-dol-final-rule-on-prevailing-wages-now-under-omb-review.html',
  },
  // $100,000 payment
  h1bPage: {
    label: 'H-1B Specialty Occupations (payment guidance and court alert)',
    publisher: uscis,
    url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
  },
  proclamation2025: {
    label: 'Restriction on Entry of Certain Nonimmigrant Workers (September 19, 2025)',
    publisher: 'White House',
    url: 'https://www.whitehouse.gov/presidential-actions/2025/09/restriction-on-entry-of-certain-nonimmigrant-workers/',
  },
  proclamation2026: {
    label: 'Proclamation extending the restriction to September 21, 2027 (September 18, 2026)',
    publisher: 'White House',
    url: 'https://www.whitehouse.gov/presidential-actions/2026/09/restriction-on-entry-of-certain-nonimmigrant-workers-faad/',
  },
  feeOrder: {
    label: 'Global Nurse Force v. Trump, order of September 30, 2026 (Dkt. 130)',
    publisher: 'U.S. District Court, N.D. California (CourtListener copy)',
    url: 'https://storage.courtlistener.com/recap/gov.uscourts.cand.457426/gov.uscourts.cand.457426.130.0.pdf',
  },
  // Taxes
  i1040nr: {
    label: 'Instructions for Form 1040-NR',
    publisher: irs,
    url: 'https://www.irs.gov/instructions/i1040nr',
  },
  topic851: {
    label: 'Topic no. 851, Resident and nonresident aliens',
    publisher: irs,
    url: 'https://www.irs.gov/taxtopics/tc851',
  },
  f8843: {
    label: 'Form 8843 (2026), Statement for Exempt Individuals',
    publisher: irs,
    url: 'https://www.irs.gov/pub/irs-pdf/f8843.pdf',
  },
  pub519: {
    label: 'Publication 519, U.S. Tax Guide for Aliens',
    publisher: irs,
    url: 'https://www.irs.gov/pub/irs-pdf/p519.pdf',
  },
  f4868: {
    label: 'Form 4868, Application for Automatic Extension of Time To File',
    publisher: irs,
    url: 'https://www.irs.gov/pub/irs-pdf/f4868.pdf',
  },
  lateFiling: {
    label: 'Failure to File Penalty',
    publisher: irs,
    url: 'https://www.irs.gov/payments/failure-to-file-penalty',
  },
  latePayment: {
    label: 'Failure to Pay Penalty',
    publisher: irs,
    url: 'https://www.irs.gov/payments/failure-to-pay-penalty',
  },
  revProc: {
    label: 'Revenue Procedure 2025-32 (inflation-adjusted amounts for 2026)',
    publisher: irs,
    url: 'https://www.irs.gov/pub/irs-drop/rp-25-32.pdf',
  },
  w2Instructions: {
    label: '2026 General Instructions for Forms W-2 and W-3',
    publisher: irs,
    url: 'https://www.irs.gov/pub/irs-pdf/iw2w3.pdf',
  },
  i1042s: {
    label: '2026 Instructions for Form 1042-S',
    publisher: irs,
    url: 'https://www.irs.gov/pub/irs-pdf/i1042s.pdf',
  },
  refunds: {
    label: 'Refunds',
    publisher: irs,
    url: 'https://www.irs.gov/refunds',
  },
  virginia: {
    label: 'When to File',
    publisher: 'Virginia Tax',
    url: 'https://www.tax.virginia.gov/when-to-file',
  },
  // Form I-983
  i983: {
    label: 'Form I-983, Training Plan for STEM OPT Students',
    publisher: 'U.S. Immigration and Customs Enforcement',
    url: 'https://www.ice.gov/doclib/sevis/pdf/i983.pdf',
  },
  i983Instructions: {
    label: 'Form I-983 Instructions',
    publisher: 'U.S. Immigration and Customs Enforcement',
    url: 'https://www.ice.gov/doclib/sevis/pdf/i983Instructions.pdf',
  },
  i983Students: {
    label: 'Students and the Form I-983',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/stem-opt-hub/for-students/students-and-the-form-i-983',
  },
  i983Overview: {
    label: 'Form I-983 Overview',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/stem-opt-hub/additional-resources/form-i-983-overview',
  },
  cfrStem: {
    label: '8 CFR 214.2(f)(10)(ii)(C), STEM OPT extension',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/section-214.2',
  },
  osuI983: {
    label: 'Form I-983 guide, Section 5',
    publisher: 'Ohio State University, Office of International Affairs',
    url: 'https://oia.osu.edu/stem-optional-practical-training-stem-opt-form-i-983-guide/section-five-completed-employer',
  },
  isuI983: {
    label: 'I-983 sample and instructions',
    publisher: 'Illinois State University, International Student and Scholar Services',
    url: 'https://isss.illinoisstate.edu/employment/f-1-stem/how-to-apply/i-983-sample/',
  },
} satisfies Record<string, ArticleSource>;
