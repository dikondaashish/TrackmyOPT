import { defineArticle } from '../shared';
import type { ArticleSource, ResearchArticle } from '../types';

const platformSources = {
  caseStatus: {
    label: 'Case Status Online',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/',
  },
  processingTimes: {
    label: 'Check Case Processing Times',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/processing-times/',
  },
  sevpPortal: {
    label: 'SEVP Portal Help',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/sevp-portal-help',
  },
  optReporting: {
    label: 'F-1 Optional Practical Training (OPT) and reporting',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/sevis-help-hub/student-records/fm-student-employment/f-1-optional-practical-training-opt',
  },
  stemFaq: {
    label: 'STEM OPT Frequently Asked Questions',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/stem-opt-hub/additional-resources/stem-opt-frequently-asked-questions',
  },
  stemRule: {
    label: '8 CFR 214.2(f)(10)–(12): Practical training',
    publisher: 'eCFR / Office of the Federal Register',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2',
  },
  everifySearch: {
    label: 'E-Verify Employer Search',
    publisher: 'USCIS E-Verify',
    url: 'https://www.e-verify.gov/e-verify-employer-search',
  },
  everifyStem: {
    label: 'Enrolling in E-Verify',
    publisher: 'USCIS E-Verify',
    url: 'https://www.e-verify.gov/employers/enrolling-in-e-verify',
  },
  ar11: {
    label: 'How to Change Your Address (Form AR-11)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/addresschange',
  },
  i94: {
    label: 'Form I-94 and Travel History',
    publisher: 'U.S. Customs and Border Protection',
    url: 'https://i94.cbp.dhs.gov/',
  },
  lcaData: {
    label: 'OFLC Performance Data (LCA disclosure files)',
    publisher: 'U.S. Department of Labor',
    url: 'https://www.dol.gov/agencies/eta/foreign-labor/performance',
  },
  wageLevels: {
    label: 'Prevailing Wage Information and Resources',
    publisher: 'U.S. Department of Labor',
    url: 'https://flag.dol.gov/wage-data/wage-search',
  },
  h1bCap: {
    label: 'H-1B Electronic Registration Process',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations-and-fashion-models/h-1b-electronic-registration-process',
  },
  capExempt: {
    label: 'H-1B Specialty Occupations: Cap exemptions',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
  },
  flsaInterns: {
    label: 'Fact Sheet #71: Internship Programs Under the FLSA',
    publisher: 'U.S. Department of Labor',
    url: 'https://www.dol.gov/agencies/whd/fact-sheets/71-flsa-internships',
  },
  unemploymentInsurance: {
    label: 'Unemployment Insurance',
    publisher: 'U.S. Department of Labor',
    url: 'https://www.dol.gov/general/topic/unemployment-insurance',
  },
  futaExempt: {
    label: 'Foreign Student and Exchange Visitor Employment Taxes',
    publisher: 'IRS',
    url: 'https://www.irs.gov/individuals/international-taxpayers/foreign-student-liability-for-social-security-and-medicare-taxes',
  },
  fcra: {
    label: 'Background Checks: What Job Applicants and Employees Should Know',
    publisher: 'EEOC and Federal Trade Commission',
    url: 'https://www.eeoc.gov/laws/guidance/background-checks-what-job-applicants-and-employees-should-know',
  },
  i9: {
    label: 'Form I-9, Employment Eligibility Verification',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-9',
  },
  discrimination: {
    label: 'Immigrant and Employee Rights Section',
    publisher: 'U.S. Department of Justice',
    url: 'https://www.justice.gov/crt/immigrant-and-employee-rights-section',
  },
  healthMarketplace: {
    label: 'Coverage for lawfully present immigrants',
    publisher: 'HealthCare.gov',
    url: 'https://www.healthcare.gov/immigrants/lawfully-present-immigrants/',
  },
  jVisaResearch: {
    label: 'Research Scholar and Professor (J-1)',
    publisher: 'U.S. Department of State',
    url: 'https://j1visa.state.gov/programs/research-scholar',
  },
} satisfies Record<string, ArticleSource>;

export function platformGap(
  article: Omit<
    ResearchArticle,
    'publishedDate' | 'modifiedDate' | 'showContents' | 'image'
  >
): ResearchArticle {
  return defineArticle({
    ...article,
    image: `/blog/platform-gaps-2026-10/${article.slug}.webp`,
    publishedDate: '2026-10-16',
    modifiedDate: '2026-10-16',
    showContents: true,
  });
}

export { platformSources };
