import type { ResearchArticle } from './types';

export const source = {
  i765: {
    label: 'Instructions for Form I-765',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/sites/default/files/document/forms/i-765instr.pdf',
  },
  opt: {
    label: 'Optional Practical Training for F-1 Students',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students',
  },
  stem: {
    label: 'STEM OPT Hub',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/stem-opt-hub',
  },
  i983: {
    label: 'Form I-983 Overview',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/form-i-983-overview',
  },
  sevpEmployment: {
    label: 'F-1 Employment',
    publisher: 'ICE SEVP',
    url: 'https://www.ice.gov/sevis/employment',
  },
  sevpTravel: {
    label: 'Travel for F-1 Students',
    publisher: 'ICE SEVP',
    url: 'https://www.ice.gov/sevis/travel',
  },
  visaDenials: {
    label: 'Visa Denials: INA 214(b) and 221(g)',
    publisher: 'U.S. Department of State',
    url: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-denials.html',
  },
  visaBulletin: {
    label: 'Official Visa Bulletin Index',
    publisher: 'U.S. Department of State',
    url: 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html',
  },
  augustBulletin: {
    label: 'Visa Bulletin for August 2026',
    publisher: 'U.S. Department of State',
    url: 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-august-2026.html',
  },
  i94: {
    label: 'Form I-94 and Travel History',
    publisher: 'U.S. Customs and Border Protection',
    url: 'https://i94.cbp.dhs.gov/',
  },
  cbpDeferred: {
    label: 'Deferred Inspection Sites',
    publisher: 'U.S. Customs and Border Protection',
    url: 'https://www.cbp.gov/contact/ports/deferred-inspection-sites',
  },
  avr: {
    label: 'Automatic Revalidation',
    publisher: 'U.S. Department of State',
    url: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-expiration-date/auto-revalidate.html',
  },
  reinstatement: {
    label: 'Reinstatement to F-1 Student Status',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-2-part-f-chapter-8',
  },
  i539: {
    label: 'Form I-539',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-539',
  },
  hardship: {
    label: 'Severe Economic Hardship',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/severe-economic-hardship',
  },
  ssr: {
    label: 'Special Student Relief',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/special-student-relief',
  },
  pp: {
    label: 'Form I-907 Premium Processing',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-907',
  },
  ev: {
    label: 'E-Verify: STEM OPT Students',
    publisher: 'E-Verify',
    url: 'https://www.e-verify.gov/employers/verification-process/stem-opt-extension',
  },
  capgap: {
    label: 'Cap-Gap Extension',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/cap-gap-extension',
  },
  biometrics: {
    label: 'Preparing for Your Biometric Services Appointment',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/forms/filing-guidance/preparing-for-your-biometric-services-appointment',
  },
  unsolicited: {
    label: 'Online Filing Webinar: Uploading Evidence',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/sites/default/files/document/outreach-engagements/USCIS_Online_Filing_Webinar_Form_I-821-Application_for_Temporary_Protected_Status.pdf',
  },
  form8843: {
    label: 'Exempt Individual Who Is a Student',
    publisher: 'IRS',
    url: 'https://www.irs.gov/individuals/international-taxpayers/exempt-individual-who-is-a-student',
  },
  fica: {
    label: 'Foreign Student Social Security and Medicare Taxes',
    publisher: 'IRS',
    url: 'https://www.irs.gov/individuals/international-taxpayers/foreign-student-liability-for-social-security-and-medicare-taxes',
  },
  form843: {
    label: 'Instructions for Form 843',
    publisher: 'IRS',
    url: 'https://www.irs.gov/instructions/i843',
  },
  pub519: {
    label: 'Publication 519, U.S. Tax Guide for Aliens',
    publisher: 'IRS',
    url: 'https://www.irs.gov/publications/p519',
  },
  nraW4: {
    label: 'Notice 1392: W-4 Instructions for Nonresident Aliens',
    publisher: 'IRS',
    url: 'https://www.irs.gov/forms-pubs/about-notice-1392',
  },
  treaty: {
    label: 'Tax Treaties',
    publisher: 'IRS',
    url: 'https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z',
  },
  stateTax: {
    label: 'State Government Tax Agencies',
    publisher: 'IRS',
    url: 'https://www.irs.gov/businesses/small-businesses-self-employed/state-government-websites',
  },
  scholarship: {
    label: 'Taxation of Nonresident Aliens',
    publisher: 'IRS',
    url: 'https://www.irs.gov/individuals/international-taxpayers/taxation-of-nonresident-aliens',
  },
  dolDisclosure: {
    label: 'OFLC Performance Data',
    publisher: 'U.S. Department of Labor',
    url: 'https://www.dol.gov/agencies/eta/foreign-labor/performance',
  },
} as const;

export function defineArticle(
  article: Omit<ResearchArticle, 'publishedDate' | 'modifiedDate' | 'image'> &
    Partial<Pick<ResearchArticle, 'publishedDate' | 'modifiedDate' | 'image'>>
): ResearchArticle {
  return {
    publishedDate: '2026-08-11',
    modifiedDate: '2026-08-11',
    image: '/blog/international-student-guidance-library-2026.png',
    ...article,
  };
}

export const standardRelated = [
  {
    label: 'Complete Form I-765 and EAD application guide',
    href: '/blog/form-i765-ead-application-guide',
  },
  {
    label: 'Track your USCIS case status',
    href: '/blog/uscis-case-status-tracking-guide',
  },
  {
    label: 'OPT application checklist',
    href: '/blog/opt-application-checklist-2026',
  },
];
