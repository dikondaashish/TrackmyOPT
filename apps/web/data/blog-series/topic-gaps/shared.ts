import { defineArticle } from '../shared';
import type { ArticleSource, ResearchArticle } from '../types';

const gapSources = {
  practicalTraining: {
    label: 'USCIS Policy Manual: Practical Training (Vol. 2, Part F, Ch. 5)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-2-part-f-chapter-5',
  },
  enrollment: {
    label: 'USCIS Policy Manual: Courses, Full Course of Study, and RCL (Vol. 2, Part F, Ch. 3)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-2-part-f-chapter-3',
  },
  fullCourse: {
    label: 'Full Course of Study',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/students/study/full-course-of-study',
  },
  optHub: {
    label: 'F-1 Optional Practical Training (OPT)',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/sevis-help-hub/student-records/fm-student-employment/f-1-optional-practical-training-opt',
  },
  h1bPortability: {
    label: 'H-1B Specialty Occupations',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
  },
  noidRfe: {
    label: '8 CFR 103.2(b)(8): Requests for evidence and notices of intent to deny',
    publisher: 'eCFR / Office of the Federal Register',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-A/part-103/section-103.2',
  },
  itin: {
    label: 'Individual Taxpayer Identification Number (ITIN)',
    publisher: 'IRS',
    url: 'https://www.irs.gov/individuals/individual-taxpayer-identification-number',
  },
  ssn: {
    label: 'International Students and Social Security Numbers',
    publisher: 'Social Security Administration',
    url: 'https://www.ssa.gov/pubs/EN-05-10181.pdf',
  },
  cip: {
    label: 'STEM Designated Degree Program List',
    publisher: 'ICE / DHS',
    url: 'https://www.ice.gov/doclib/sevis/pdf/stemList2024.pdf',
  },
} satisfies Record<string, ArticleSource>;

export function gap(
  article: Omit<
    ResearchArticle,
    'publishedDate' | 'modifiedDate' | 'showContents'
  >
): ResearchArticle {
  return defineArticle({
    ...article,
    publishedDate: '2026-10-16',
    modifiedDate: '2026-10-16',
    showContents: true,
  });
}

export { gapSources };
